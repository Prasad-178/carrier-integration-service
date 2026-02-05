import dayjs from 'dayjs';

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

export interface ShippingErrorOptions {
  code?: ErrorCode;
  context?: ErrorContext;
  cause?: Error;
  isRetryable?: boolean;
}

export class ShippingError extends Error {
  readonly code: ErrorCode;
  readonly context?: ErrorContext;
  override readonly cause?: Error;
  readonly timestamp: Date;
  readonly isRetryable: boolean;

  constructor(message: string, options?: ShippingErrorOptions);
  constructor(
    message: string,
    code?: ErrorCode,
    context?: ErrorContext,
    options?: { cause?: Error; isRetryable?: boolean }
  );
  constructor(
    message: string,
    codeOrOptions?: ErrorCode | ShippingErrorOptions,
    context?: ErrorContext,
    options?: { cause?: Error; isRetryable?: boolean }
  ) {
    super(message);
    this.name = 'ShippingError';

    // Handle both calling conventions
    if (typeof codeOrOptions === 'object') {
      // New style: named parameters
      this.code = codeOrOptions.code ?? 'UNKNOWN_ERROR';
      this.context = codeOrOptions.context;
      this.cause = codeOrOptions.cause;
      this.isRetryable = codeOrOptions.isRetryable ?? false;
    } else {
      // Legacy style: positional parameters
      this.code = codeOrOptions ?? 'UNKNOWN_ERROR';
      this.context = context;
      this.cause = options?.cause;
      this.isRetryable = options?.isRetryable ?? false;
    }

    this.timestamp = dayjs().toDate();

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
