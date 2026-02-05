import type { Result } from '../../utils/result.js';
import type { AuthenticationError } from '../errors/auth.error.js';

export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresAt: Date;
  scope?: string;
}

export interface IAuthProvider {
  getToken(): Promise<Result<AuthToken, AuthenticationError>>;

  refreshToken(): Promise<Result<AuthToken, AuthenticationError>>;

  invalidateToken(): void;

  hasValidToken(): boolean;
}
