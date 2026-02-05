import { v4 as uuidv4 } from 'uuid';
import type { IRateProvider } from '../../core/interfaces/rate-provider.interface.js';
import type { IHttpClient } from '../../core/interfaces/http-client.interface.js';
import type { RateRequest, RateResponse } from '../../domain/models/index.js';
import type { UPSConfig } from './ups.config.js';
import type { UPSAuthProvider } from './ups.auth-provider.js';
import { UPSRequestMapper } from './mappers/request.mapper.js';
import { UPSResponseMapper } from './mappers/response.mapper.js';
import { UPSRateResponseSchema } from './schemas/rate-response.schema.js';
import { RateRequestSchema } from '../../domain/schemas/rate-request.schema.js';
import type { Result } from '../../utils/result.js';
import { ok, err } from '../../utils/result.js';
import { ShippingError } from '../../core/errors/base.error.js';
import { ValidationError } from '../../core/errors/validation.error.js';
import { CarrierError } from '../../core/errors/carrier.error.js';
import { UPS_API_VERSION, UPS_CARRIER_ID } from './ups.constants.js';

export class UPSRateProvider implements IRateProvider {
  readonly operationType = 'rate' as const;

  private config: UPSConfig;
  private httpClient: IHttpClient;
  private authProvider: UPSAuthProvider;
  private requestMapper: UPSRequestMapper;
  private responseMapper: UPSResponseMapper;

  constructor(
    config: UPSConfig,
    httpClient: IHttpClient,
    authProvider: UPSAuthProvider
  ) {
    this.config = config;
    this.httpClient = httpClient;
    this.authProvider = authProvider;
    this.requestMapper = new UPSRequestMapper();
    this.responseMapper = new UPSResponseMapper();
  }

  async getRates(request: RateRequest): Promise<Result<RateResponse, ShippingError>> {
    const requestId = uuidv4();

    const inputValidation = RateRequestSchema.safeParse(request);
    if (!inputValidation.success) {
      return err(
        new ValidationError('Invalid rate request', inputValidation.error.issues)
      );
    }

    const tokenResult = await this.authProvider.getToken();
    if (!tokenResult.success) {
      return err(tokenResult.error);
    }

    const upsRequest = this.requestMapper.toUPSRequest(request);

    const requestOption = request.serviceLevel ? 'Rate' : 'Shop';
    const endpoint = `${this.config.baseUrl}/rating/${UPS_API_VERSION}/${requestOption}`;

    const httpResult = await this.httpClient.request<unknown>({
      method: 'POST',
      url: endpoint,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenResult.value.accessToken}`,
        transId: requestId,
        transactionSrc: this.config.transactionSrc,
      },
      body: upsRequest,
      timeout: this.config.timeout,
    });

    if (!httpResult.success) {
      if (httpResult.error.statusCode === 401) {
        this.authProvider.invalidateToken();
      }
      return err(httpResult.error);
    }

    const responseValidation = UPSRateResponseSchema.safeParse(httpResult.value.data);
    if (!responseValidation.success) {
      return err(
        new ValidationError(
          'Invalid UPS rate response',
          responseValidation.error.issues
        )
      );
    }

    const upsResponse = responseValidation.data;

    if (upsResponse.RateResponse.Response.ResponseStatus.Code !== '1') {
      const error = upsResponse.RateResponse.Response.Error;
      return err(
        new CarrierError(
          UPS_CARRIER_ID,
          error?.ErrorDescription || 'UPS rate request failed',
          error?.ErrorCode
        )
      );
    }

    const domainResponse = this.responseMapper.toDomainResponse(
      upsResponse,
      requestId
    );

    return ok(domainResponse);
  }
}
