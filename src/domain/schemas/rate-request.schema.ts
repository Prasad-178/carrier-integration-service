import { z } from 'zod';
import { AddressSchema } from './address.schema.js';
import { PackageSchema } from './package.schema.js';
import { ServiceLevelSchema } from './shipment.schema.js';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const RateRequestSchema = z.object({
  shipment: z.object({
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
  }),
  serviceLevel: ServiceLevelSchema.optional(),
  requestNegotiatedRates: z.boolean().optional(),
});

export type RateRequestInput = z.input<typeof RateRequestSchema>;
