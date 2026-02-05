import type {
  ICarrier,
  ICarrierOperation,
  OperationType,
} from '../../core/interfaces/carrier.interface';
import type { IHttpClient } from '../../core/interfaces/http-client.interface';
import type { Result } from '../../utils/result';
import { ok, err } from '../../utils/result';
import { ShippingError } from '../../core/errors/base.error';
import type { UPSConfig } from './ups.config';
import { UPSAuthProvider } from './ups.auth-provider';
import { UPSRateProvider } from './ups.rate-provider';
import { UPS_CARRIER_ID, UPS_CARRIER_NAME } from './ups.constants';

export class UPSCarrier implements ICarrier {
  readonly id = UPS_CARRIER_ID;
  readonly name = UPS_CARRIER_NAME;

  private config: UPSConfig;
  private httpClient: IHttpClient;
  private authProvider: UPSAuthProvider;
  private operations: Map<OperationType, ICarrierOperation> = new Map();
  private initialized = false;

  constructor(config: UPSConfig, httpClient: IHttpClient) {
    this.config = config;
    this.httpClient = httpClient;
    this.authProvider = new UPSAuthProvider(config, httpClient);
  }

  get supportedOperations(): OperationType[] {
    return Array.from(this.operations.keys());
  }

  supportsOperation(operation: OperationType): boolean {
    return this.operations.has(operation);
  }

  getOperation<T extends ICarrierOperation>(
    operation: OperationType
  ): Result<T, ShippingError> {
    if (!this.initialized) {
      return err(
        new ShippingError(
          'Carrier not initialized. Call initialize() first.',
          'CONFIG_ERROR'
        )
      );
    }

    const op = this.operations.get(operation);
    if (!op) {
      return err(
        new ShippingError(
          `Carrier "${this.id}" does not support operation "${operation}"`,
          'OPERATION_NOT_SUPPORTED'
        )
      );
    }
    return ok(op as T);
  }

  async initialize(): Promise<Result<void, ShippingError>> {
    if (this.initialized) {
      return ok(undefined);
    }

    const rateProvider = new UPSRateProvider(
      this.config,
      this.httpClient,
      this.authProvider
    );
    this.operations.set('rate', rateProvider);

    this.initialized = true;
    return ok(undefined);
  }

  async dispose(): Promise<void> {
    this.authProvider.invalidateToken();
    this.operations.clear();
    this.initialized = false;
  }

  getAuthProvider(): UPSAuthProvider {
    return this.authProvider;
  }
}
