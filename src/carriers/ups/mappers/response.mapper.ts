import dayjs from 'dayjs';
import type {
  RateResponse,
  RateQuote,
  Money,
  ChargeBreakdown,
  DeliveryEstimate,
} from '../../../domain/models/index.js';
import { ServiceLevel } from '../../../domain/models/index.js';
import type { UPSRateResponse, UPSRatedShipment, UPSCharges } from '../types/api.types.js';
import { UPS_SERVICE_CODES, UPS_CARRIER_ID, UPS_CARRIER_NAME } from '../ups.constants.js';

export class UPSResponseMapper {
  toDomainResponse(upsResponse: UPSRateResponse, requestId: string): RateResponse {
    const ratedShipment = upsResponse.RateResponse.RatedShipment;

    const shipments = Array.isArray(ratedShipment)
      ? ratedShipment
      : [ratedShipment];

    const quotes: RateQuote[] = shipments.map((rated) =>
      this.mapRatedShipment(rated)
    );

    quotes.sort((a, b) => a.totalCharge.amount - b.totalCharge.amount);

    return {
      success: true,
      quotes,
      requestId,
      timestamp: dayjs().toISOString(),
      warnings: this.extractWarnings(upsResponse),
    };
  }

  private mapRatedShipment(rated: UPSRatedShipment): RateQuote {
    const serviceCode = rated.Service.Code;
    const serviceInfo = UPS_SERVICE_CODES[serviceCode] || {
      code: serviceCode,
      name: rated.Service.Description || 'Unknown Service',
      serviceLevel: ServiceLevel.GROUND,
    };

    const totalCharge = this.mapMoney(rated.TotalCharges);

    return {
      carrierId: UPS_CARRIER_ID,
      carrierName: UPS_CARRIER_NAME,
      serviceLevel: serviceInfo.serviceLevel,
      serviceName: serviceInfo.name,
      serviceCode: serviceCode,
      totalCharge,
      chargeBreakdown: this.mapChargeBreakdown(rated),
      estimatedDelivery: this.mapDeliveryEstimate(rated),
      isNegotiatedRate: !!rated.NegotiatedRateCharges,
      rawResponse: rated,
    };
  }

  private mapMoney(charges: UPSCharges): Money {
    return {
      amount: parseFloat(charges.MonetaryValue),
      currency: charges.CurrencyCode,
    };
  }

  private mapChargeBreakdown(rated: UPSRatedShipment): ChargeBreakdown {
    const breakdown: ChargeBreakdown = {
      baseCharge: this.mapMoney(
        rated.TransportationCharges || rated.TotalCharges
      ),
    };

    if (rated.ItemizedCharges && rated.ItemizedCharges.length > 0) {
      breakdown.otherSurcharges = rated.ItemizedCharges.map((charge) => ({
        name: charge.Description || charge.Code || 'Surcharge',
        charge: this.mapMoney(charge),
      }));
    }

    return breakdown;
  }

  private mapDeliveryEstimate(
    rated: UPSRatedShipment
  ): DeliveryEstimate | undefined {
    if (!rated.GuaranteedDelivery && !rated.TimeInTransit) {
      return undefined;
    }

    const estimate: DeliveryEstimate = {};

    if (rated.GuaranteedDelivery) {
      estimate.guaranteedDate = rated.GuaranteedDelivery.Date;
      estimate.deliveryByTime = rated.GuaranteedDelivery.Time;

      if (rated.GuaranteedDelivery.BusinessDaysInTransit) {
        estimate.businessDaysInTransit = parseInt(
          rated.GuaranteedDelivery.BusinessDaysInTransit,
          10
        );
      }
    }

    if (rated.TimeInTransit?.ServiceSummary?.EstimatedArrival?.BusinessDaysInTransit) {
      estimate.businessDaysInTransit = parseInt(
        rated.TimeInTransit.ServiceSummary.EstimatedArrival.BusinessDaysInTransit,
        10
      );
    }

    return Object.keys(estimate).length > 0 ? estimate : undefined;
  }

  private extractWarnings(response: UPSRateResponse): string[] | undefined {
    const alerts = response.RateResponse.Response?.Alert;
    if (!alerts) return undefined;

    const alertArray = Array.isArray(alerts) ? alerts : [alerts];
    const warnings = alertArray.map((alert) => alert.Description);

    return warnings.length > 0 ? warnings : undefined;
  }
}
