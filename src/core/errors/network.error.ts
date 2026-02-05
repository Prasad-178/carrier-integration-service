import { ShippingError, type ErrorCode, type ErrorContext } from './base.error';

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

export interface TimeoutErrorOptions {
  message?: string;
  timeoutMs?: number;
}

export class TimeoutError extends NetworkError {
  readonly timeoutMs?: number;

  constructor(options?: TimeoutErrorOptions);
  constructor(message?: string, timeoutMs?: number);
  constructor(messageOrOptions?: string | TimeoutErrorOptions, timeoutMs?: number) {
    if (typeof messageOrOptions === 'object') {
      const opts = messageOrOptions;
      super(opts.message ?? 'Request timed out', 'TIMEOUT', {
        context: opts.timeoutMs ? { timeoutMs: opts.timeoutMs } : undefined,
      });
      this.timeoutMs = opts.timeoutMs;
    } else {
      super(messageOrOptions ?? 'Request timed out', 'TIMEOUT', {
        context: timeoutMs ? { timeoutMs } : undefined,
      });
      this.timeoutMs = timeoutMs;
    }
    this.name = 'TimeoutError';
  }
}

export interface RateLimitErrorOptions {
  message?: string;
  retryAfter?: number;
}

export class RateLimitError extends NetworkError {
  readonly retryAfter?: number;

  constructor(options?: RateLimitErrorOptions);
  constructor(message?: string, retryAfter?: number);
  constructor(messageOrOptions?: string | RateLimitErrorOptions, retryAfter?: number) {
    if (typeof messageOrOptions === 'object') {
      const opts = messageOrOptions;
      super(opts.message ?? 'Rate limit exceeded', 'RATE_LIMIT', {
        statusCode: 429,
        context: opts.retryAfter ? { retryAfter: opts.retryAfter } : undefined,
      });
      this.retryAfter = opts.retryAfter;
    } else {
      super(messageOrOptions ?? 'Rate limit exceeded', 'RATE_LIMIT', {
        statusCode: 429,
        context: retryAfter ? { retryAfter } : undefined,
      });
      this.retryAfter = retryAfter;
    }
    this.name = 'RateLimitError';
  }
}
