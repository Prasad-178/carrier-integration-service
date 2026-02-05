import type { Address } from './address.js';
import type { Package } from './package.js';

export type ServiceLevel =
  | 'GROUND'
  | 'EXPRESS'
  | 'EXPRESS_SAVER'
  | 'OVERNIGHT'
  | 'OVERNIGHT_EARLY'
  | 'TWO_DAY'
  | 'THREE_DAY'
  | 'INTERNATIONAL_ECONOMY'
  | 'INTERNATIONAL_PRIORITY';

export interface Shipment {
  origin: Address;
  destination: Address;
  packages: Package[];
  shipDate?: string;
  serviceLevel?: ServiceLevel;
}
