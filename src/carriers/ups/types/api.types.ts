export interface UPSAddress {
  AddressLine?: string[];
  City?: string;
  StateProvinceCode?: string;
  PostalCode?: string;
  CountryCode: string;
  ResidentialAddressIndicator?: string;
}

export interface UPSShipper {
  Name?: string;
  AttentionName?: string;
  ShipperNumber?: string;
  Address: UPSAddress;
}

export interface UPSShipTo {
  Name?: string;
  AttentionName?: string;
  Address: UPSAddress;
}

export interface UPSShipFrom {
  Name?: string;
  AttentionName?: string;
  Address: UPSAddress;
}

export interface UPSService {
  Code: string;
  Description?: string;
}

export interface UPSUnitOfMeasurement {
  Code: string;
  Description?: string;
}

export interface UPSDimensions {
  UnitOfMeasurement: UPSUnitOfMeasurement;
  Length: string;
  Width: string;
  Height: string;
}

export interface UPSPackageWeight {
  UnitOfMeasurement: UPSUnitOfMeasurement;
  Weight: string;
}

export interface UPSDeclaredValue {
  CurrencyCode: string;
  MonetaryValue: string;
}

export interface UPSPackageServiceOptions {
  DeclaredValue?: UPSDeclaredValue;
}

export interface UPSPackage {
  PackagingType: { Code: string; Description?: string };
  Dimensions?: UPSDimensions;
  PackageWeight: UPSPackageWeight;
  PackageServiceOptions?: UPSPackageServiceOptions;
}

export interface UPSShipmentRatingOptions {
  NegotiatedRatesIndicator?: string;
  RateChartIndicator?: string;
}

export interface UPSShipment {
  Shipper: UPSShipper;
  ShipTo: UPSShipTo;
  ShipFrom?: UPSShipFrom;
  Service?: UPSService;
  Package: UPSPackage[];
  ShipmentRatingOptions?: UPSShipmentRatingOptions;
  NumOfPieces?: string;
}

export interface UPSTransactionReference {
  CustomerContext?: string;
}

export interface UPSRequest {
  SubVersion?: string;
  TransactionReference?: UPSTransactionReference;
}

export interface UPSRateRequest {
  RateRequest: {
    Request?: UPSRequest;
    Shipment: UPSShipment;
    DeliveryTimeInformation?: {
      PackageBillType?: string;
      Pickup?: {
        Date?: string;
      };
    };
  };
}

export interface UPSCharges {
  CurrencyCode: string;
  MonetaryValue: string;
}

export interface UPSGuaranteedDelivery {
  BusinessDaysInTransit?: string;
  Date?: string;
  Time?: string;
}

export interface UPSRatedPackage {
  TransportationCharges?: UPSCharges;
  ServiceOptionsCharges?: UPSCharges;
  TotalCharges?: UPSCharges;
  Weight?: string;
}

export interface UPSItemizedCharge extends UPSCharges {
  Code?: string;
  Description?: string;
}

export interface UPSNegotiatedRateCharges {
  TotalCharge?: UPSCharges;
}

export interface UPSRatedShipment {
  Service: UPSService;
  RatedShipmentAlert?: Array<{ Code: string; Description: string }>;
  BillingWeight?: {
    UnitOfMeasurement: UPSUnitOfMeasurement;
    Weight: string;
  };
  TransportationCharges?: UPSCharges;
  ServiceOptionsCharges?: UPSCharges;
  TotalCharges: UPSCharges;
  GuaranteedDelivery?: UPSGuaranteedDelivery;
  RatedPackage?: UPSRatedPackage[];
  ItemizedCharges?: UPSItemizedCharge[];
  NegotiatedRateCharges?: UPSNegotiatedRateCharges;
  TimeInTransit?: {
    ServiceSummary?: {
      EstimatedArrival?: {
        BusinessDaysInTransit?: string;
      };
    };
  };
}

export interface UPSResponseStatus {
  Code: string;
  Description: string;
}

export interface UPSAlert {
  Code: string;
  Description: string;
}

export interface UPSError {
  ErrorSeverity?: string;
  ErrorCode?: string;
  ErrorDescription?: string;
}

export interface UPSResponse {
  ResponseStatus: UPSResponseStatus;
  Alert?: UPSAlert | UPSAlert[];
  Error?: UPSError;
}

export interface UPSRateResponse {
  RateResponse: {
    Response: UPSResponse;
    RatedShipment: UPSRatedShipment | UPSRatedShipment[];
  };
}

export interface UPSOAuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
  issued_at?: string;
  client_id?: string;
  scope?: string;
  refresh_count?: string;
  status?: string;
}
