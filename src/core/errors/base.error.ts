export type ErrorCode =
  | 'UNKNOWN_ERROR'
  | 'CONFIG_ERROR'
  | 'OPERATION_NOT_SUPPORTED'
  | 'CARRIER_NOT_FOUND'
  // Auth errors
  | 'AUTH_FAILED'
  | 'TOKEN_EXPIRED'
  | 'INVALID_CREDENTIALS'
  // Network errors
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'CONNECTION_REFUSED'
  | 'RATE_LIMIT'
  // Validation errors
  | 'VALIDATION_ERROR'
  | 'SCHEMA_ERROR'
  // Carrier errors
  | 'CARRIER_ERROR'
  | 'CARRIER_UNAVAILABLE';

export interface ErrorContext {
  [key: string]: unknown;
}

export class ShippingError extends Error {
  readonly code: ErrorCode;
  readonly context?: ErrorContext;
  override readonly cause?: Error;
  readonly timestamp: Date;
  readonly isRetryable: boolean;

  constructor(
    message: string,
    code: ErrorCode = 'UNKNOWN_ERROR',
    context?: ErrorContext,
    options?: { cause?: Error; isRetryable?: boolean }
  ) {
    super(message);
    this.name = 'ShippingError';
    this.code = code;
    this.context = context;
    this.cause = options?.cause;
    this.timestamp = new Date();
    this.isRetryable = options?.isRetryable ?? false;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      isRetryable: this.isRetryable,
      stack: this.stack,
    };
  }
}
