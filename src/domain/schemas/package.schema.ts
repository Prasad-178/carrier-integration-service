import { z } from 'zod';
import { WeightUnit, DimensionUnit, PackagingType } from '../models/package';

export const WeightUnitSchema = z.nativeEnum(WeightUnit);
export const DimensionUnitSchema = z.nativeEnum(DimensionUnit);
export const PackagingTypeSchema = z.nativeEnum(PackagingType);

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
