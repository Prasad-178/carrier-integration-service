import { z } from 'zod';
import { AddressSchema } from './address.schema.js';
import { PackageSchema } from './package.schema.js';

export const ServiceLevelSchema = z.enum([
  'GROUND',
  'EXPRESS',
  'EXPRESS_SAVER',
  'OVERNIGHT',
  'OVERNIGHT_EARLY',
  'TWO_DAY',
  'THREE_DAY',
  'INTERNATIONAL_ECONOMY',
  'INTERNATIONAL_PRIORITY',
]);

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const ShipmentSchema = z.object({
  origin: AddressSchema,
  destination: AddressSchema,
  packages: z
    .array(PackageSchema)
    .min(1, 'At least one package is required')
    .max(200, 'Maximum 200 packages allowed'),
  shipDate: z
    .string()
    .regex(isoDateRegex, 'Ship date must be in YYYY-MM-DD format')
    .optional(),
  serviceLevel: ServiceLevelSchema.optional(),
});

export type ShipmentInput = z.input<typeof ShipmentSchema>;
