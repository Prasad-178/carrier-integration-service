export { ShippingClient, type ShippingClientOptions } from './client.js';

export type {
  Address,
  Package,
  Weight,
  Dimensions,
  Shipment,
  ServiceLevel,
  WeightUnit,
  DimensionUnit,
  PackagingType,
  RateRequest,
  RateResponse,
  RateQuote,
  Money,
  ChargeBreakdown,
  DeliveryEstimate,
} from './domain/models/index.js';

export {
  AddressSchema,
  PackageSchema,
  ShipmentSchema,
  RateRequestSchema,
  RateResponseSchema,
  ServiceLevelSchema,
} from './domain/schemas/index.js';

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
} from './core/interfaces/index.js';

export { CarrierRegistry } from './core/registry/carrier-registry.js';

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
} from './core/errors/index.js';

export { type Result, ok, err, isOk, isErr, unwrap, unwrapOr } from './utils/result.js';

export { AxiosHttpClient, type AxiosClientOptions } from './http/axios-client.js';

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
} from './carriers/ups/index.js';
