import { MockHttpClient } from '../../mocks/http-client.mock.js';
import { UPSCarrier } from '../../../src/carriers/ups/ups.carrier.js';
import type { UPSConfig } from '../../../src/carriers/ups/ups.config.js';
import type { IRateProvider } from '../../../src/core/interfaces/rate-provider.interface.js';
import { ADDRESSES, PACKAGES } from '../../fixtures/common/index.js';
import oauthResponseFixture from '../../fixtures/ups/oauth-response.json';
import rateResponseFixture from '../../fixtures/ups/rate-response.json';

describe('UPS Rate Shopping Integration', () => {
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

  beforeEach(async () => {
    mockHttp = new MockHttpClient();

    mockHttp.onSuccess('/security/v1/oauth/token', oauthResponseFixture);
    mockHttp.onSuccess('/rating/v2409/Shop', rateResponseFixture);

    carrier = new UPSCarrier(config, mockHttp);
    await carrier.initialize();

    const operationResult = carrier.getOperation<IRateProvider>('rate');
    expect(operationResult.success).toBe(true);
    if (operationResult.success) {
      rateProvider = operationResult.value;
    }
  });

  afterEach(async () => {
    await carrier.dispose();
    mockHttp.reset();
  });

  describe('getRates', () => {
    it('should return rate quotes for domestic shipment', async () => {
      const result = await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const response = result.value;
      expect(response.quotes).toHaveLength(4);
      expect(response.quotes[0]?.carrierId).toBe('ups');
      expect(response.quotes[0]?.totalCharge.currency).toBe('USD');
      expect(response.requestId).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });

    it('should sort quotes by price ascending', async () => {
      const result = await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const quotes = result.value.quotes;
      for (let i = 1; i < quotes.length; i++) {
        const prevAmount = quotes[i - 1]?.totalCharge.amount ?? 0;
        const currAmount = quotes[i]?.totalCharge.amount ?? 0;
        expect(currAmount).toBeGreaterThanOrEqual(prevAmount);
      }
    });

    it('should map UPS service codes to normalized service levels', async () => {
      const result = await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const quotes = result.value.quotes;

      const groundQuote = quotes.find((q) => q.serviceCode === '03');
      expect(groundQuote?.serviceLevel).toBe('GROUND');
      expect(groundQuote?.serviceName).toBe('UPS Ground');

      const overnightQuote = quotes.find((q) => q.serviceCode === '01');
      expect(overnightQuote?.serviceLevel).toBe('OVERNIGHT');
    });

    it('should include delivery estimates when available', async () => {
      const result = await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const overnightQuote = result.value.quotes.find(
        (q) => q.serviceLevel === 'OVERNIGHT'
      );

      expect(overnightQuote?.estimatedDelivery).toBeDefined();
      expect(overnightQuote?.estimatedDelivery?.guaranteedDate).toBe('20250207');
      expect(overnightQuote?.estimatedDelivery?.deliveryByTime).toBe('10:30:00');
    });

    it('should build correct UPS API request', async () => {
      await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
      });

      const ratingCalls = mockHttp.getCallsToUrl('/rating');
      expect(ratingCalls).toHaveLength(1);

      const lastCall = ratingCalls[0];
      expect(lastCall?.method).toBe('POST');
      expect(lastCall?.url).toContain('/rating/v2409/Shop');
      expect(lastCall?.headers?.['Authorization']).toMatch(/^Bearer /);
      expect(lastCall?.headers?.['transId']).toBeDefined();
      expect(lastCall?.headers?.['transactionSrc']).toBe('test-app');

      const body = lastCall?.body as Record<string, unknown>;
      expect(body).toHaveProperty('RateRequest');
    });

    it('should set residential indicator for residential addresses', async () => {
      await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_COMMERCIAL,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
      });

      const lastCall = mockHttp.getLastCall();
      const body = lastCall?.body as {
        RateRequest: {
          Shipment: {
            ShipTo: { Address: { ResidentialAddressIndicator?: string } };
          };
        };
      };

      expect(
        body.RateRequest.Shipment.ShipTo.Address.ResidentialAddressIndicator
      ).toBe('');
    });

    it('should use Rate endpoint when service level specified', async () => {
      mockHttp.onSuccess('/rating/v2409/Rate', rateResponseFixture);

      await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
        serviceLevel: 'GROUND',
      });

      const rateCalls = mockHttp.getCallsToUrl('/rating/v2409/Rate');
      expect(rateCalls).toHaveLength(1);
    });

    it('should include service code when service level specified', async () => {
      mockHttp.onSuccess('/rating/v2409/Rate', rateResponseFixture);

      await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
        },
        serviceLevel: 'GROUND',
      });

      const lastCall = mockHttp.getLastCall();
      const body = lastCall?.body as {
        RateRequest: { Shipment: { Service?: { Code: string } } };
      };

      expect(body.RateRequest.Shipment.Service?.Code).toBe('03');
    });

    it('should handle multiple packages', async () => {
      await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX, PACKAGES.MEDIUM_BOX],
        },
      });

      const lastCall = mockHttp.getLastCall();
      const body = lastCall?.body as {
        RateRequest: { Shipment: { Package: unknown[] } };
      };

      expect(body.RateRequest.Shipment.Package).toHaveLength(2);
    });

    it('should include ship date when provided', async () => {
      await rateProvider.getRates({
        shipment: {
          origin: ADDRESSES.US_ORIGIN,
          destination: ADDRESSES.US_RESIDENTIAL,
          packages: [PACKAGES.SMALL_BOX],
          shipDate: '2025-02-10',
        },
      });

      const lastCall = mockHttp.getLastCall();
      const body = lastCall?.body as {
        RateRequest: {
          DeliveryTimeInformation?: { Pickup?: { Date?: string } };
        };
      };

      expect(body.RateRequest.DeliveryTimeInformation?.Pickup?.Date).toBe(
        '20250210'
      );
    });
  });
});
