import type { Result } from '../../utils/result';
import type { ShippingError } from '../errors/base.error';

export type OperationType =
  | 'rate'
  | 'label'
  | 'track'
  | 'validate'
  | 'pickup';

export interface ICarrierOperation {
  readonly operationType: OperationType;
}

export interface ICarrier {
  readonly id: string;
  readonly name: string;
  readonly supportedOperations: OperationType[];

  supportsOperation(operation: OperationType): boolean;

  getOperation<T extends ICarrierOperation>(
    operation: OperationType
  ): Result<T, ShippingError>;

  initialize(): Promise<Result<void, ShippingError>>;

  dispose(): Promise<void>;
}
