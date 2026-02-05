import { MockHttpClient } from '../../mocks/http-client.mock.js';
import { UPSAuthProvider } from '../../../src/carriers/ups/ups.auth-provider.js';
import type { UPSConfig } from '../../../src/carriers/ups/ups.config.js';

describe('UPS Auth Flow', () => {
  let mockHttp: MockHttpClient;
  let authProvider: UPSAuthProvider;

  const config: UPSConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    baseUrl: 'https://wwwcie.ups.com/api',
    authBaseUrl: 'https://wwwcie.ups.com',
    transactionSrc: 'test-app',
    timeout: 30000,
  };

  beforeEach(() => {
    mockHttp = new MockHttpClient();
    authProvider = new UPSAuthProvider(config, mockHttp);
  });

  afterEach(() => {
    authProvider.invalidateToken();
    mockHttp.reset();
  });

  describe('getToken', () => {
    it('should acquire token on first call', async () => {
      mockHttp.onSuccess('/security/v1/oauth/token', {
        token_type: 'Bearer',
        access_token: 'test-token-123',
        expires_in: 3600,
        issued_at: new Date().toISOString(),
      });

      const result = await authProvider.getToken();

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.accessToken).toBe('test-token-123');
      expect(result.value.tokenType).toBe('Bearer');
    });

    it('should return cached token on subsequent calls', async () => {
      mockHttp.onSuccess('/security/v1/oauth/token', {
        token_type: 'Bearer',
        access_token: 'test-token-123',
        expires_in: 3600,
      });

      await authProvider.getToken();
      const callCountBefore = mockHttp.getCallCount();

      const result = await authProvider.getToken();
      const callCountAfter = mockHttp.getCallCount();

      expect(result.success).toBe(true);
      expect(callCountAfter).toBe(callCountBefore);
    });

    it('should handle concurrent token requests with single HTTP call', async () => {
      let callCount = 0;
      mockHttp.onRequest('/security/v1/oauth/token', async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          data: {
            token_type: 'Bearer',
            access_token: `token-${callCount}`,
            expires_in: 3600,
          },
        };
      });

      const promises = Array(5)
        .fill(null)
        .map(() => authProvider.getToken());
      const results = await Promise.all(promises);

      expect(results.every((r) => r.success)).toBe(true);

      const tokens = results
        .filter((r) => r.success)
        .map((r) => (r as { success: true; value: { accessToken: string } }).value.accessToken);
      expect(new Set(tokens).size).toBe(1);

      expect(callCount).toBe(1);
    });

    it('should send correct Basic auth header', async () => {
      mockHttp.onSuccess('/security/v1/oauth/token', {
        token_type: 'Bearer',
        access_token: 'test-token',
        expires_in: 3600,
      });

      await authProvider.getToken();

      const call = mockHttp.getLastCall();
      expect(call).toBeDefined();

      const expectedAuth = Buffer.from(
        `${config.clientId}:${config.clientSecret}`
      ).toString('base64');

      expect(call?.headers?.['Authorization']).toBe(`Basic ${expectedAuth}`);
      expect(call?.headers?.['Content-Type']).toBe(
        'application/x-www-form-urlencoded'
      );
      expect(call?.body).toBe('grant_type=client_credentials');
    });
  });

  describe('token expiration', () => {
    it('should consider token invalid when expired', async () => {
      mockHttp.onSuccess('/security/v1/oauth/token', {
        token_type: 'Bearer',
        access_token: 'expired-token',
        expires_in: -1,
      });

      await authProvider.getToken();

      expect(authProvider.hasValidToken()).toBe(false);
    });

    it('should acquire fresh token when previous expired', async () => {
      mockHttp.onSuccess('/security/v1/oauth/token', {
        token_type: 'Bearer',
        access_token: 'expired-token',
        expires_in: -1,
      });

      await authProvider.getToken();
      mockHttp.clearCalls();

      mockHttp.onSuccess('/security/v1/oauth/token', {
        token_type: 'Bearer',
        access_token: 'fresh-token',
        expires_in: 3600,
      });

      const result = await authProvider.getToken();

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.accessToken).toBe('fresh-token');
      expect(mockHttp.getCallCount()).toBe(1);
    });
  });

  describe('invalidateToken', () => {
    it('should clear cached token', async () => {
      mockHttp.onSuccess('/security/v1/oauth/token', {
        token_type: 'Bearer',
        access_token: 'test-token',
        expires_in: 3600,
      });

      await authProvider.getToken();
      expect(authProvider.hasValidToken()).toBe(true);

      authProvider.invalidateToken();
      expect(authProvider.hasValidToken()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should return InvalidCredentialsError on 401', async () => {
      mockHttp.onError('/security/v1/oauth/token', 401, {
        error: 'invalid_client',
      });

      const result = await authProvider.getToken();

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.name).toBe('InvalidCredentialsError');
    });

    it('should return AuthenticationError on rate limit', async () => {
      mockHttp.onRateLimit('/security/v1/oauth/token', 60);

      const result = await authProvider.getToken();

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe('RATE_LIMIT');
    });
  });
});
