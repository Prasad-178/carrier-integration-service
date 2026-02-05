import type { Result } from '../../utils/result';
import type { AuthenticationError } from '../errors/auth.error';

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
