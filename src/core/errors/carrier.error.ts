import { ShippingError, type ErrorContext } from './base.error';

export class CarrierError extends ShippingError {
  readonly carrierId: string;
  readonly carrierErrorCode?: string;

  constructor(
    carrierId: string,
    message: string,
    carrierErrorCode?: string,
    context?: ErrorContext
  ) {
    super(message, 'CARRIER_ERROR', {
      ...context,
      carrierId,
      carrierErrorCode,
    });
    this.name = 'CarrierError';
    this.carrierId = carrierId;
    this.carrierErrorCode = carrierErrorCode;
  }

  override toJSON(): object {
    return {
      ...super.toJSON(),
      carrierId: this.carrierId,
      carrierErrorCode: this.carrierErrorCode,
    };
  }
}

export class CarrierNotFoundError extends ShippingError {
  readonly carrierId: string;

  constructor(carrierId: string) {
    super(
      `Carrier "${carrierId}" is not registered`,
      'CARRIER_NOT_FOUND',
      { carrierId }
    );
    this.name = 'CarrierNotFoundError';
    this.carrierId = carrierId;
  }
}
