import type { RateRequest, Address, Package, Weight } from '../../../domain/models/index';
import { WeightUnit } from '../../../domain/models/index';
import type { UPSRateRequest, UPSShipper, UPSShipTo, UPSShipFrom, UPSPackage, UPSAddress } from '../types/api.types';
import {
  SERVICE_LEVEL_TO_UPS,
  UPS_PACKAGING_CODES,
  UPS_WEIGHT_UNIT_CODES,
  UPS_DIMENSION_UNIT_CODES,
  UPS_API_VERSION,
} from '../ups.constants';

export class UPSRequestMapper {
  toUPSRequest(request: RateRequest): UPSRateRequest {
    const { shipment } = request;

    const upsRequest: UPSRateRequest = {
      RateRequest: {
        Request: {
          SubVersion: UPS_API_VERSION,
          TransactionReference: {
            CustomerContext: 'Rate Request',
          },
        },
        Shipment: {
          Shipper: this.mapShipper(shipment.origin),
          ShipTo: this.mapShipTo(shipment.destination),
          ShipFrom: this.mapShipFrom(shipment.origin),
          Package: shipment.packages.map((pkg) => this.mapPackage(pkg)),
        },
      },
    };

    if (request.serviceLevel) {
      upsRequest.RateRequest.Shipment.Service = {
        Code: SERVICE_LEVEL_TO_UPS[request.serviceLevel],
      };
    }

    if (request.requestNegotiatedRates) {
      upsRequest.RateRequest.Shipment.ShipmentRatingOptions = {
        NegotiatedRatesIndicator: '',
      };
    }

    if (shipment.shipDate) {
      upsRequest.RateRequest.DeliveryTimeInformation = {
        PackageBillType: '03',
        Pickup: {
          Date: shipment.shipDate.replace(/-/g, ''),
        },
      };
    }

    return upsRequest;
  }

  private mapShipper(address: Address): UPSShipper {
    return {
      Name: address.name,
      AttentionName: address.company || address.name,
      Address: this.mapAddress(address),
    };
  }

  private mapShipTo(address: Address): UPSShipTo {
    const mapped: UPSShipTo = {
      Name: address.name,
      AttentionName: address.company || address.name,
      Address: this.mapAddress(address),
    };

    if (address.isResidential) {
      mapped.Address.ResidentialAddressIndicator = '';
    }

    return mapped;
  }

  private mapShipFrom(address: Address): UPSShipFrom {
    return {
      Name: address.name,
      AttentionName: address.company || address.name,
      Address: this.mapAddress(address),
    };
  }

  private mapAddress(address: Address): UPSAddress {
    const upsAddress: UPSAddress = {
      AddressLine: address.addressLines,
      City: address.city,
      PostalCode: address.postalCode,
      CountryCode: address.countryCode,
    };

    if (address.stateProvince) {
      upsAddress.StateProvinceCode = address.stateProvince;
    }

    return upsAddress;
  }

  private mapPackage(pkg: Package): UPSPackage {
    const upsPackage: UPSPackage = {
      PackagingType: {
        Code: UPS_PACKAGING_CODES[pkg.packagingType] || '02',
      },
      PackageWeight: {
        UnitOfMeasurement: {
          Code: UPS_WEIGHT_UNIT_CODES[pkg.weight.unit],
        },
        Weight: String(this.normalizeWeight(pkg.weight)),
      },
    };

    if (pkg.dimensions) {
      upsPackage.Dimensions = {
        UnitOfMeasurement: {
          Code: UPS_DIMENSION_UNIT_CODES[pkg.dimensions.unit],
        },
        Length: String(pkg.dimensions.length),
        Width: String(pkg.dimensions.width),
        Height: String(pkg.dimensions.height),
      };
    }

    if (pkg.declaredValue) {
      upsPackage.PackageServiceOptions = {
        DeclaredValue: {
          CurrencyCode: pkg.declaredValue.currency,
          MonetaryValue: String(pkg.declaredValue.amount),
        },
      };
    }

    return upsPackage;
  }

  private normalizeWeight(weight: Weight): number {
    if (weight.unit === WeightUnit.OZ) return weight.value / 16;
    if (weight.unit === WeightUnit.G) return weight.value / 1000;
    return weight.value;
  }
}
