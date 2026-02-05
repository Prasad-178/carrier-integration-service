import { ShippingError, type ErrorCode, type ErrorContext } from './base.error.js';

export class NetworkError extends ShippingError {
  readonly statusCode?: number;
  readonly responseBody?: unknown;

  constructor(
    message: string,
    code: ErrorCode = 'NETWORK_ERROR',
    options?: {
      statusCode?: number;
      responseBody?: unknown;
      context?: ErrorContext;
      cause?: Error;
    }
  ) {
    super(message, code, options?.context, {
      cause: options?.cause,
      isRetryable: NetworkError.isRetryableStatus(options?.statusCode),
    });
    this.name = 'NetworkError';
    this.statusCode = options?.statusCode;
    this.responseBody = options?.responseBody;
  }

  private static isRetryableStatus(status?: number): boolean {
    if (!status) return true;
    return status >= 500 || status === 429 || status === 408;
  }

  override toJSON(): object {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      responseBody: this.responseBody,
    };
  }
}

export class TimeoutError extends NetworkError {
  readonly timeoutMs?: number;

  constructor(message = 'Request timed out', timeoutMs?: number) {
    super(message, 'TIMEOUT', {
      context: timeoutMs ? { timeoutMs } : undefined,
    });
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class RateLimitError extends NetworkError {
  readonly retryAfter?: number;

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT', {
      statusCode: 429,
      context: retryAfter ? { retryAfter } : undefined,
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
