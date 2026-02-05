import type { RateRequest, RateResponse } from '../../domain/models/index.js';
import type { Result } from '../../utils/result.js';
import type { ShippingError } from '../errors/base.error.js';
import type { ICarrierOperation } from './carrier.interface.js';

export interface IRateProvider extends ICarrierOperation {
  readonly operationType: 'rate';

  getRates(request: RateRequest): Promise<Result<RateResponse, ShippingError>>;
}
