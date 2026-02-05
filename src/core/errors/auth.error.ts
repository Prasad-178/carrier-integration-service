import { ShippingError, type ErrorCode, type ErrorContext } from './base.error';

export class AuthenticationError extends ShippingError {
  constructor(
    message: string,
    code: ErrorCode = 'AUTH_FAILED',
    context?: ErrorContext
  ) {
    super(message, code, context, { isRetryable: code === 'RATE_LIMIT' });
    this.name = 'AuthenticationError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Authentication token has expired') {
    super(message, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message = 'Invalid credentials provided') {
    super(message, 'INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}
