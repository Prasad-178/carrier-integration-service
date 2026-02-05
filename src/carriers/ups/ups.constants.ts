import {
  ServiceLevel,
  PackagingType,
  WeightUnit,
  DimensionUnit,
} from '../../domain/models/index';

export interface UPSServiceInfo {
  code: string;
  name: string;
  serviceLevel: ServiceLevel;
}

export const UPS_SERVICE_CODES: Record<string, UPSServiceInfo> = {
  '01': { code: '01', name: 'UPS Next Day Air', serviceLevel: ServiceLevel.OVERNIGHT },
  '02': { code: '02', name: 'UPS 2nd Day Air', serviceLevel: ServiceLevel.TWO_DAY },
  '03': { code: '03', name: 'UPS Ground', serviceLevel: ServiceLevel.GROUND },
  '07': { code: '07', name: 'UPS Worldwide Express', serviceLevel: ServiceLevel.INTERNATIONAL_PRIORITY },
  '08': { code: '08', name: 'UPS Worldwide Expedited', serviceLevel: ServiceLevel.EXPRESS },
  '11': { code: '11', name: 'UPS Standard', serviceLevel: ServiceLevel.GROUND },
  '12': { code: '12', name: 'UPS 3 Day Select', serviceLevel: ServiceLevel.THREE_DAY },
  '13': { code: '13', name: 'UPS Next Day Air Saver', serviceLevel: ServiceLevel.OVERNIGHT },
  '14': { code: '14', name: 'UPS Next Day Air Early', serviceLevel: ServiceLevel.OVERNIGHT_EARLY },
  '54': { code: '54', name: 'UPS Worldwide Express Plus', serviceLevel: ServiceLevel.INTERNATIONAL_PRIORITY },
  '59': { code: '59', name: 'UPS 2nd Day Air A.M.', serviceLevel: ServiceLevel.TWO_DAY },
  '65': { code: '65', name: 'UPS Saver', serviceLevel: ServiceLevel.EXPRESS_SAVER },
  '72': { code: '72', name: 'UPS Worldwide Economy DDP', serviceLevel: ServiceLevel.INTERNATIONAL_ECONOMY },
};

export const SERVICE_LEVEL_TO_UPS: Record<ServiceLevel, string> = {
  [ServiceLevel.GROUND]: '03',
  [ServiceLevel.EXPRESS]: '08',
  [ServiceLevel.EXPRESS_SAVER]: '65',
  [ServiceLevel.OVERNIGHT]: '01',
  [ServiceLevel.OVERNIGHT_EARLY]: '14',
  [ServiceLevel.TWO_DAY]: '02',
  [ServiceLevel.THREE_DAY]: '12',
  [ServiceLevel.INTERNATIONAL_ECONOMY]: '72',
  [ServiceLevel.INTERNATIONAL_PRIORITY]: '07',
};

export const UPS_PACKAGING_CODES: Record<PackagingType, string> = {
  [PackagingType.YOUR_PACKAGING]: '02',
  [PackagingType.CARRIER_ENVELOPE]: '01',
  [PackagingType.CARRIER_PAK]: '04',
  [PackagingType.CARRIER_BOX_SMALL]: '2a',
  [PackagingType.CARRIER_BOX_MEDIUM]: '2b',
  [PackagingType.CARRIER_BOX_LARGE]: '2c',
  [PackagingType.CARRIER_TUBE]: '03',
};

export const UPS_WEIGHT_UNIT_CODES: Record<WeightUnit, string> = {
  [WeightUnit.LB]: 'LBS',
  [WeightUnit.KG]: 'KGS',
  [WeightUnit.OZ]: 'LBS',
  [WeightUnit.G]: 'KGS',
};

export const UPS_DIMENSION_UNIT_CODES: Record<DimensionUnit, string> = {
  [DimensionUnit.IN]: 'IN',
  [DimensionUnit.CM]: 'CM',
};

export const UPS_API_VERSION = 'v2409';

export const UPS_CARRIER_ID = 'ups';
export const UPS_CARRIER_NAME = 'United Parcel Service';
