import { z } from 'zod';

export const WeightUnitSchema = z.enum(['LB', 'KG', 'OZ', 'G']);
export const DimensionUnitSchema = z.enum(['IN', 'CM']);

export const WeightSchema = z.object({
  value: z.number().positive('Weight must be positive'),
  unit: WeightUnitSchema,
});

export const DimensionsSchema = z.object({
  length: z.number().positive('Length must be positive'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  unit: DimensionUnitSchema,
});

export const PackagingTypeSchema = z.enum([
  'YOUR_PACKAGING',
  'CARRIER_ENVELOPE',
  'CARRIER_PAK',
  'CARRIER_BOX_SMALL',
  'CARRIER_BOX_MEDIUM',
  'CARRIER_BOX_LARGE',
  'CARRIER_TUBE',
]);

export const DeclaredValueSchema = z.object({
  amount: z.number().nonnegative('Declared value must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters (ISO 4217)'),
});

export const PackageSchema = z.object({
  weight: WeightSchema,
  dimensions: DimensionsSchema.optional(),
  packagingType: PackagingTypeSchema,
  declaredValue: DeclaredValueSchema.optional(),
  reference: z.string().max(35, 'Reference max 35 characters').optional(),
});

export type WeightInput = z.input<typeof WeightSchema>;
export type DimensionsInput = z.input<typeof DimensionsSchema>;
export type PackageInput = z.input<typeof PackageSchema>;
