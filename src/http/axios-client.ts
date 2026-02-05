import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import type {
  IHttpClient,
  HttpRequest,
  HttpResponse,
} from '../core/interfaces/http-client.interface.js';
import type { Result } from '../utils/result.js';
import { ok, err } from '../utils/result.js';
import {
  NetworkError,
  TimeoutError,
  RateLimitError,
} from '../core/errors/network.error.js';

const DEFAULT_TIMEOUT = 30000;

export interface AxiosClientOptions {
  timeout?: number;
  baseURL?: string;
}

export class AxiosHttpClient implements IHttpClient {
  private client: AxiosInstance;

  constructor(options: AxiosClientOptions = {}) {
    this.client = axios.create({
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      baseURL: options.baseURL,
    });
  }

  async request<T>(req: HttpRequest): Promise<Result<HttpResponse<T>, NetworkError>> {
    const config: AxiosRequestConfig = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      data: req.body,
      timeout: req.timeout,
    };

    try {
      const response = await this.client.request<T>(config);

      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(response.headers)) {
        if (typeof value === 'string') {
          headers[key] = value;
        } else if (Array.isArray(value)) {
          headers[key] = value.join(', ');
        }
      }

      return ok({
        status: response.status,
        statusText: response.statusText,
        headers,
        data: response.data,
      });
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  private normalizeError(error: unknown): NetworkError {
    if (!axios.isAxiosError(error)) {
      return new NetworkError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'NETWORK_ERROR',
        { cause: error instanceof Error ? error : undefined }
      );
    }

    const axiosError = error as AxiosError;

    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return new TimeoutError(
        'Request timed out',
        axiosError.config?.timeout
      );
    }

    if (axiosError.code === 'ECONNREFUSED') {
      return new NetworkError(
        'Connection refused',
        'CONNECTION_REFUSED',
        { cause: axiosError }
      );
    }

    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      if (status === 429) {
        const retryAfter = this.parseRetryAfter(
          axiosError.response.headers['retry-after']
        );
        return new RateLimitError('Rate limit exceeded', retryAfter);
      }

      return new NetworkError(
        `HTTP ${status}: ${axiosError.message}`,
        'NETWORK_ERROR',
        {
          statusCode: status,
          responseBody: data,
          cause: axiosError,
        }
      );
    }

    return new NetworkError(
      axiosError.message || 'Network request failed',
      'NETWORK_ERROR',
      { cause: axiosError }
    );
  }

  private parseRetryAfter(value: unknown): number | undefined {
    if (typeof value === 'string') {
      const seconds = parseInt(value, 10);
      if (!isNaN(seconds)) {
        return seconds;
      }
    }
    return undefined;
  }
}
