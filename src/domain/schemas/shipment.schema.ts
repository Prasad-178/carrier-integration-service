import { z } from 'zod';
import { AddressSchema } from './address.schema';
import { PackageSchema } from './package.schema';
import { ServiceLevel } from '../models/shipment';

export const ServiceLevelSchema = z.nativeEnum(ServiceLevel);

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
