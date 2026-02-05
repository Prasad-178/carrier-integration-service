import type { ServiceLevel } from './shipment.js';

export interface Money {
  amount: number;
  currency: string;
}

export interface ChargeBreakdown {
  baseCharge: Money;
  fuelSurcharge?: Money;
  residentialSurcharge?: Money;
  deliveryAreaSurcharge?: Money;
  otherSurcharges?: Array<{
    name: string;
    charge: Money;
  }>;
}

export interface DeliveryEstimate {
  guaranteedDate?: string;
  businessDaysInTransit?: number;
  deliveryByTime?: string;
}

export interface RateQuote {
  carrierId: string;
  carrierName: string;
  serviceLevel: ServiceLevel;
  serviceName: string;
  serviceCode: string;
  totalCharge: Money;
  chargeBreakdown?: ChargeBreakdown;
  estimatedDelivery?: DeliveryEstimate;
  isNegotiatedRate: boolean;
  rawResponse?: unknown;
}

export interface RateRequest {
  shipment: {
    origin: import('./address.js').Address;
    destination: import('./address.js').Address;
    packages: import('./package.js').Package[];
    shipDate?: string;
  };
  serviceLevel?: ServiceLevel;
  requestNegotiatedRates?: boolean;
}

export interface RateResponse {
  success: boolean;
  quotes: RateQuote[];
  requestId: string;
  timestamp: string;
  warnings?: string[];
}
