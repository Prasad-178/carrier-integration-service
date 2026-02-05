import type { RateRequest, RateResponse } from '../../domain/models/index';
import type { Result } from '../../utils/result';
import type { ShippingError } from '../errors/base.error';
import type { ICarrierOperation } from './carrier.interface';

export interface IRateProvider extends ICarrierOperation {
  readonly operationType: 'rate';

  getRates(request: RateRequest): Promise<Result<RateResponse, ShippingError>>;
}
