export enum WeightUnit {
  LB = 'LB',
  KG = 'KG',
  OZ = 'OZ',
  G = 'G',
}

export enum DimensionUnit {
  IN = 'IN',
  CM = 'CM',
}

export enum PackagingType {
  YOUR_PACKAGING = 'YOUR_PACKAGING',
  CARRIER_ENVELOPE = 'CARRIER_ENVELOPE',
  CARRIER_PAK = 'CARRIER_PAK',
  CARRIER_BOX_SMALL = 'CARRIER_BOX_SMALL',
  CARRIER_BOX_MEDIUM = 'CARRIER_BOX_MEDIUM',
  CARRIER_BOX_LARGE = 'CARRIER_BOX_LARGE',
  CARRIER_TUBE = 'CARRIER_TUBE',
}

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface Package {
  weight: Weight;
  dimensions?: Dimensions;
  packagingType: PackagingType;
  declaredValue?: {
    amount: number;
    currency: string;
  };
  reference?: string;
}
