import { z } from 'zod';

export const AddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  addressLines: z
    .array(z.string().min(1))
    .min(1, 'At least one address line is required')
    .max(3, 'Maximum 3 address lines allowed'),
  city: z.string().min(1, 'City is required'),
  stateProvince: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  countryCode: z
    .string()
    .length(2, 'Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  isResidential: z.boolean().optional(),
});

export type AddressInput = z.input<typeof AddressSchema>;
export type AddressOutput = z.output<typeof AddressSchema>;
