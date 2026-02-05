import type { Address } from './address';
import type { Package } from './package';

export enum ServiceLevel {
  GROUND = 'GROUND',
  EXPRESS = 'EXPRESS',
  EXPRESS_SAVER = 'EXPRESS_SAVER',
  OVERNIGHT = 'OVERNIGHT',
  OVERNIGHT_EARLY = 'OVERNIGHT_EARLY',
  TWO_DAY = 'TWO_DAY',
  THREE_DAY = 'THREE_DAY',
  INTERNATIONAL_ECONOMY = 'INTERNATIONAL_ECONOMY',
  INTERNATIONAL_PRIORITY = 'INTERNATIONAL_PRIORITY',
}

export interface Shipment {
  origin: Address;
  destination: Address;
  packages: Package[];
  shipDate?: string;
  serviceLevel?: ServiceLevel;
}
