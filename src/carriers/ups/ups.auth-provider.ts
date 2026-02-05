import dayjs from 'dayjs';
import type { IAuthProvider, AuthToken } from '../../core/interfaces/auth-provider.interface.js';
import type { IHttpClient } from '../../core/interfaces/http-client.interface.js';
import type { UPSConfig } from './ups.config.js';
import { UPSOAuthResponseSchema } from './schemas/oauth.schema.js';
import type { Result } from '../../utils/result.js';
import { ok, err } from '../../utils/result.js';
import {
  AuthenticationError,
  InvalidCredentialsError,
} from '../../core/errors/auth.error.js';

const TOKEN_REFRESH_BUFFER_SECONDS = 60;

export class UPSAuthProvider implements IAuthProvider {
  private config: UPSConfig;
  private httpClient: IHttpClient;
  private cachedToken: AuthToken | null = null;
  private refreshPromise: Promise<Result<AuthToken, AuthenticationError>> | null = null;

  constructor(config: UPSConfig, httpClient: IHttpClient) {
    this.config = config;
    this.httpClient = httpClient;
  }

  async getToken(): Promise<Result<AuthToken, AuthenticationError>> {
    if (this.hasValidToken()) {
      return ok(this.cachedToken!);
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    return this.refreshToken();
  }

  async refreshToken(): Promise<Result<AuthToken, AuthenticationError>> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.acquireToken();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async acquireToken(): Promise<Result<AuthToken, AuthenticationError>> {
    const authEndpoint = `${this.config.authBaseUrl}/security/v1/oauth/token`;

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    };

    if (this.config.merchantId) {
      headers['x-merchant-id'] = this.config.merchantId;
    }

    const httpResult = await this.httpClient.request<unknown>({
      method: 'POST',
      url: authEndpoint,
      headers,
      body: 'grant_type=client_credentials',
      timeout: 10_000,
    });

    if (!httpResult.success) {
      const statusCode = httpResult.error.statusCode;

      if (statusCode === 401) {
        return err(new InvalidCredentialsError('Invalid UPS client credentials'));
      }
      if (statusCode === 429) {
        return err(
          new AuthenticationError(
            'UPS OAuth rate limit exceeded',
            'RATE_LIMIT'
          )
        );
      }

      return err(
        new AuthenticationError(
          `Failed to acquire UPS token: ${httpResult.error.message}`,
          'AUTH_FAILED'
        )
      );
    }

    const validation = UPSOAuthResponseSchema.safeParse(httpResult.value.data);
    if (!validation.success) {
      return err(
        new AuthenticationError(
          'Invalid OAuth response from UPS',
          'AUTH_FAILED',
          { issues: validation.error.issues }
        )
      );
    }

    const oauthData = validation.data;

    const expiresAt = dayjs()
      .add(oauthData.expires_in, 'seconds')
      .subtract(TOKEN_REFRESH_BUFFER_SECONDS, 'seconds')
      .toDate();

    this.cachedToken = {
      accessToken: oauthData.access_token,
      tokenType: oauthData.token_type,
      expiresAt,
      scope: oauthData.scope,
    };

    return ok(this.cachedToken);
  }

  invalidateToken(): void {
    this.cachedToken = null;
  }

  hasValidToken(): boolean {
    if (!this.cachedToken) return false;
    return dayjs(this.cachedToken.expiresAt).isAfter(dayjs());
  }
}
