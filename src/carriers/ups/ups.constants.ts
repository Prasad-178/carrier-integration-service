import type { ServiceLevel, PackagingType } from '../../domain/models/index.js';

export interface UPSServiceInfo {
  code: string;
  name: string;
  serviceLevel: ServiceLevel;
}

export const UPS_SERVICE_CODES: Record<string, UPSServiceInfo> = {
  '01': { code: '01', name: 'UPS Next Day Air', serviceLevel: 'OVERNIGHT' },
  '02': { code: '02', name: 'UPS 2nd Day Air', serviceLevel: 'TWO_DAY' },
  '03': { code: '03', name: 'UPS Ground', serviceLevel: 'GROUND' },
  '07': { code: '07', name: 'UPS Worldwide Express', serviceLevel: 'INTERNATIONAL_PRIORITY' },
  '08': { code: '08', name: 'UPS Worldwide Expedited', serviceLevel: 'EXPRESS' },
  '11': { code: '11', name: 'UPS Standard', serviceLevel: 'GROUND' },
  '12': { code: '12', name: 'UPS 3 Day Select', serviceLevel: 'THREE_DAY' },
  '13': { code: '13', name: 'UPS Next Day Air Saver', serviceLevel: 'OVERNIGHT' },
  '14': { code: '14', name: 'UPS Next Day Air Early', serviceLevel: 'OVERNIGHT_EARLY' },
  '54': { code: '54', name: 'UPS Worldwide Express Plus', serviceLevel: 'INTERNATIONAL_PRIORITY' },
  '59': { code: '59', name: 'UPS 2nd Day Air A.M.', serviceLevel: 'TWO_DAY' },
  '65': { code: '65', name: 'UPS Saver', serviceLevel: 'EXPRESS_SAVER' },
  '72': { code: '72', name: 'UPS Worldwide Economy DDP', serviceLevel: 'INTERNATIONAL_ECONOMY' },
};

export const SERVICE_LEVEL_TO_UPS: Record<ServiceLevel, string> = {
  GROUND: '03',
  EXPRESS: '08',
  EXPRESS_SAVER: '65',
  OVERNIGHT: '01',
  OVERNIGHT_EARLY: '14',
  TWO_DAY: '02',
  THREE_DAY: '12',
  INTERNATIONAL_ECONOMY: '72',
  INTERNATIONAL_PRIORITY: '07',
};

export const UPS_PACKAGING_CODES: Record<PackagingType, string> = {
  YOUR_PACKAGING: '02',
  CARRIER_ENVELOPE: '01',
  CARRIER_PAK: '04',
  CARRIER_BOX_SMALL: '2a',
  CARRIER_BOX_MEDIUM: '2b',
  CARRIER_BOX_LARGE: '2c',
  CARRIER_TUBE: '03',
};

export const UPS_WEIGHT_UNIT_CODES = {
  LB: 'LBS',
  KG: 'KGS',
  OZ: 'LBS',
  G: 'KGS',
} as const;

export const UPS_DIMENSION_UNIT_CODES = {
  IN: 'IN',
  CM: 'CM',
} as const;

export const UPS_API_VERSION = 'v2409';

export const UPS_CARRIER_ID = 'ups';
export const UPS_CARRIER_NAME = 'United Parcel Service';
