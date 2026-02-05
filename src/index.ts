export { ShippingClient, type ShippingClientOptions } from './client';

export {
  ServiceLevel,
  WeightUnit,
  DimensionUnit,
  PackagingType,
} from './domain/models/index';

export type {
  Address,
  Package,
  Weight,
  Dimensions,
  Shipment,
  RateRequest,
  RateResponse,
  RateQuote,
  Money,
  ChargeBreakdown,
  DeliveryEstimate,
} from './domain/models/index';

export {
  AddressSchema,
  PackageSchema,
  ShipmentSchema,
  RateRequestSchema,
  RateResponseSchema,
  ServiceLevelSchema,
} from './domain/schemas/index';

export type {
  ICarrier,
  ICarrierOperation,
  IRateProvider,
  IAuthProvider,
  IHttpClient,
  AuthToken,
  HttpRequest,
  HttpResponse,
  OperationType,
} from './core/interfaces/index';

export { CarrierRegistry } from './core/registry/carrier-registry';

export {
  ShippingError,
  AuthenticationError,
  TokenExpiredError,
  InvalidCredentialsError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  ValidationError,
  CarrierError,
  CarrierNotFoundError,
  type ErrorCode,
  type ErrorContext,
} from './core/errors/index';

export { type Result, ok, err, isOk, isErr, unwrap, unwrapOr } from './utils/result';

export { AxiosHttpClient, createHttpClient, type AxiosClientOptions } from './http/axios-client';

export {
  UPSCarrier,
  UPSRateProvider,
  UPSAuthProvider,
  createUPSConfig,
  createUPSConfigFromEnv,
  type UPSConfig,
  type UPSConfigInput,
  UPS_SERVICE_CODES,
  UPS_CARRIER_ID,
  UPS_CARRIER_NAME,
} from './carriers/ups/index';
