import type {
  IHttpClient,
  HttpRequest,
  HttpResponse,
} from '../../src/core/interfaces/http-client.interface';
import type { Result } from '../../src/utils/result';
import { ok, err } from '../../src/utils/result';
import {
  NetworkError,
  TimeoutError,
  RateLimitError,
} from '../../src/core/errors/network.error';

type MockHandler = (
  req: HttpRequest
) => Promise<HttpResponse> | HttpResponse | never;

export class MockHttpClient implements IHttpClient {
  private handlers: Map<string, MockHandler> = new Map();
  private calls: HttpRequest[] = [];

  onRequest(urlPattern: string | RegExp, handler: MockHandler): this {
    const key = urlPattern instanceof RegExp ? urlPattern.source : urlPattern;
    this.handlers.set(key, handler);
    return this;
  }

  onSuccess(urlPattern: string, data: unknown, status = 200): this {
    return this.onRequest(urlPattern, () => ({
      status,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data,
    }));
  }

  onError(urlPattern: string, status: number, body?: unknown): this {
    return this.onRequest(urlPattern, () => {
      throw new NetworkError(`HTTP ${status} error`, 'NETWORK_ERROR', {
        statusCode: status,
        responseBody: body,
      });
    });
  }

  onTimeout(urlPattern: string): this {
    return this.onRequest(urlPattern, () => {
      throw new TimeoutError('Request timed out', 30000);
    });
  }

  onRateLimit(urlPattern: string, retryAfter = 60): this {
    return this.onRequest(urlPattern, () => {
      throw new RateLimitError('Rate limit exceeded', retryAfter);
    });
  }

  async request<T>(req: HttpRequest): Promise<Result<HttpResponse<T>, NetworkError>> {
    this.calls.push(req);

    for (const [pattern, handler] of this.handlers) {
      const regex = new RegExp(pattern);
      if (regex.test(req.url)) {
        try {
          const response = await handler(req);
          return ok(response as HttpResponse<T>);
        } catch (error) {
          if (error instanceof NetworkError) {
            return err(error);
          }
          throw error;
        }
      }
    }

    return err(
      new NetworkError('No mock handler found', 'NETWORK_ERROR', {
        statusCode: 404,
        context: { url: req.url },
      })
    );
  }

  getCalls(): HttpRequest[] {
    return [...this.calls];
  }

  getLastCall(): HttpRequest | undefined {
    return this.calls[this.calls.length - 1];
  }

  getCallCount(): number {
    return this.calls.length;
  }

  getCallsToUrl(urlPattern: string | RegExp): HttpRequest[] {
    const regex = urlPattern instanceof RegExp ? urlPattern : new RegExp(urlPattern);
    return this.calls.filter((call) => regex.test(call.url));
  }

  reset(): void {
    this.handlers.clear();
    this.calls = [];
  }

  clearCalls(): void {
    this.calls = [];
  }
}
