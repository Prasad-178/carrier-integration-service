import { MockHttpClient } from '../../mocks/http-client.mock.js';
import { UPSCarrier } from '../../../src/carriers/ups/ups.carrier.js';
import type { UPSConfig } from '../../../src/carriers/ups/ups.config.js';
import type { IRateProvider } from '../../../src/core/interfaces/rate-provider.interface.js';
import { ADDRESSES, PACKAGES } from '../../fixtures/common/index.js';
import oauthResponseFixture from '../../fixtures/ups/oauth-response.json';
import carrierErrorFixture from '../../fixtures/ups/error-responses/carrier-error.json';

describe('UPS Error Handling', () => {
  let mockHttp: MockHttpClient;
  let carrier: UPSCarrier;
  let rateProvider: IRateProvider;

  const config: UPSConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    baseUrl: 'https://wwwcie.ups.com/api',
    authBaseUrl: 'https://wwwcie.ups.com',
    transactionSrc: 'test-app',
    timeout: 30000,
  };

  const validShipment = {
    origin: ADDRESSES.US_ORIGIN,
    destination: ADDRESSES.US_RESIDENTIAL,
    packages: [PACKAGES.SMALL_BOX],
  };

  beforeEach(async () => {
    mockHttp = new MockHttpClient();
    mockHttp.onSuccess('/security/v1/oauth/token', oauthResponseFixture);

    carrier = new UPSCarrier(config, mockHttp);
    await carrier.initialize();

    const operationResult = carrier.getOperation<IRateProvider>('rate');
    if (operationResult.success) {
      rateProvider = operationResult.value;
    }
  });

  afterEach(async () => {
    await carrier.dispose();
    mockHttp.reset();
  });

  describe('Authentication Errors', () => {
    it('should return InvalidCredentialsError on 401 from OAuth', async () => {
      mockHttp.reset();
      mockHttp.onError('/security/v1/oauth/token', 401, {
        error: 'invalid_client',
        error_description: 'Invalid client credentials',
      });

      carrier = new UPSCarrier(config, mockHttp);
      await carrier.initialize();
      const newProvider = carrier.getOperation<IRateProvider>('rate');
      if (!newProvider.success) return;

      const result = await newProvider.value.getRates({ shipment: validShipment });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.name).toBe('InvalidCredentialsError');
      expect(result.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should invalidate token on 401 from API', async () => {
      mockHttp.onError('/rating/v2409/Shop', 401, {
        error: 'Unauthorized',
      });

      const authProvider = carrier.getAuthProvider();

      await rateProvider.getRates({ shipment: validShipment });
      await rateProvider.getRates({ shipment: validShipment });

      expect(authProvider.hasValidToken()).toBe(false);
    });
  });

  describe('Network Errors', () => {
    it('should return TimeoutError on request timeout', async () => {
      mockHttp.onTimeout('/rating/v2409/Shop');

      const result = await rateProvider.getRates({ shipment: validShipment });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.name).toBe('TimeoutError');
      expect(result.error.code).toBe('TIMEOUT');
      expect(result.error.isRetryable).toBe(true);
    });

    it('should return RateLimitError on 429', async () => {
      mockHttp.onRateLimit('/rating/v2409/Shop', 60);

      const result = await rateProvider.getRates({ shipment: validShipment });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.name).toBe('RateLimitError');
      expect(result.error.code).toBe('RATE_LIMIT');
      expect(result.error.isRetryable).toBe(true);
    });

    it('should return NetworkError on server error', async () => {
      mockHttp.onError('/rating/v2409/Shop', 500, {
        error: 'Internal Server Error',
      });

      const result = await rateProvider.getRates({ shipment: validShipment });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.name).toBe('NetworkError');
      expect(result.error.isRetryable).toBe(true);
    });
  });

  describe('Validation Errors', () => {
    it('should return ValidationError for invalid input', async () => {
      const result = await rateProvider.getRates({
        shipment: {
          origin: {
            ...ADDRESSES.US_ORIGIN,
            countryCode: 'INVALID',
          },
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.name).toBe('ValidationError');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return ValidationError on malformed API response', async () => {
      mockHttp.onSuccess('/rating/v2409/Shop', {
        invalid: 'response',
      });

      const result = await rateProvider.getRates({ shipment: validShipment });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.name).toBe('ValidationError');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Carrier Errors', () => {
    it('should handle UPS-specific error responses', async () => {
      mockHttp.onSuccess('/rating/v2409/Shop', carrierErrorFixture);

      const result = await rateProvider.getRates({ shipment: validShipment });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.name).toBe('CarrierError');
      expect(result.error.code).toBe('CARRIER_ERROR');
    });
  });
});
