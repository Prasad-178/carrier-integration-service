import type { ICarrier, IRateProvider, OperationType } from './core/interfaces/index';
import { CarrierRegistry } from './core/registry/carrier-registry';
import type { RateRequest, RateResponse, RateQuote } from './domain/models/index';
import type { Result } from './utils/result';
import { ok, err } from './utils/result';
import { ShippingError } from './core/errors/base.error';

export interface ShippingClientOptions {
  carriers?: ICarrier[];
}

export class ShippingClient {
  private registry: CarrierRegistry;
  private initialized = false;

  constructor() {
    this.registry = CarrierRegistry.getInstance();
  }

  async registerCarrier(carrier: ICarrier): Promise<Result<void, ShippingError>> {
    const initResult = await carrier.initialize();
    if (!initResult.success) {
      return initResult;
    }

    this.registry.register(carrier);
    this.initialized = true;
    return ok(undefined);
  }

  getCarrier(carrierId: string): Result<ICarrier, ShippingError> {
    return this.registry.get(carrierId);
  }

  getCarriers(): ICarrier[] {
    return this.registry.getAll();
  }

  getCarriersByOperation(operation: OperationType): ICarrier[] {
    return this.registry.getByOperation(operation);
  }

  async getRates(
    carrierId: string,
    request: RateRequest
  ): Promise<Result<RateResponse, ShippingError>> {
    const carrierResult = this.registry.get(carrierId);
    if (!carrierResult.success) {
      return err(carrierResult.error);
    }

    const rateProviderResult = carrierResult.value.getOperation<IRateProvider>('rate');
    if (!rateProviderResult.success) {
      return err(rateProviderResult.error);
    }

    return rateProviderResult.value.getRates(request);
  }

  async getRatesFromAllCarriers(
    request: RateRequest
  ): Promise<Result<RateQuote[], ShippingError>> {
    const rateCarriers = this.registry.getByOperation('rate');

    if (rateCarriers.length === 0) {
      return err(
        new ShippingError(
          'No carriers registered that support rate shopping',
          'CARRIER_NOT_FOUND'
        )
      );
    }

    const allQuotes: RateQuote[] = [];
    const errors: ShippingError[] = [];

    await Promise.all(
      rateCarriers.map(async (carrier) => {
        const rateProviderResult = carrier.getOperation<IRateProvider>('rate');
        if (!rateProviderResult.success) {
          errors.push(rateProviderResult.error);
          return;
        }

        const rateResult = await rateProviderResult.value.getRates(request);
        if (rateResult.success) {
          allQuotes.push(...rateResult.value.quotes);
        } else {
          errors.push(rateResult.error);
        }
      })
    );

    if (allQuotes.length === 0 && errors.length > 0) {
      return err(errors[0]!);
    }

    allQuotes.sort((a, b) => a.totalCharge.amount - b.totalCharge.amount);

    return ok(allQuotes);
  }

  async dispose(): Promise<void> {
    const carriers = this.registry.getAll();
    await Promise.all(carriers.map((carrier) => carrier.dispose()));
    this.registry.clear();
    this.initialized = false;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }
}
