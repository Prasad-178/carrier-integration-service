export type WeightUnit = 'LB' | 'KG' | 'OZ' | 'G';
export type DimensionUnit = 'IN' | 'CM';

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

export type PackagingType =
  | 'YOUR_PACKAGING'
  | 'CARRIER_ENVELOPE'
  | 'CARRIER_PAK'
  | 'CARRIER_BOX_SMALL'
  | 'CARRIER_BOX_MEDIUM'
  | 'CARRIER_BOX_LARGE'
  | 'CARRIER_TUBE';

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
