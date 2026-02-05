import { z } from 'zod';
import type { Result } from '../../utils/result.js';
import { ok, err } from '../../utils/result.js';
import { ShippingError } from '../../core/errors/base.error.js';

export const UPSConfigSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client secret is required'),
  baseUrl: z.string().url().default('https://wwwcie.ups.com/api'),
  authBaseUrl: z.string().url().default('https://wwwcie.ups.com'),
  transactionSrc: z.string().default('cybership'),
  merchantId: z.string().optional(),
  timeout: z.number().positive().default(30000),
  accountNumber: z.string().optional(),
});

export type UPSConfig = z.infer<typeof UPSConfigSchema>;

export interface UPSConfigInput {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  authBaseUrl?: string;
  transactionSrc?: string;
  merchantId?: string;
  timeout?: number;
  accountNumber?: string;
}

export function createUPSConfig(input: UPSConfigInput): Result<UPSConfig, ShippingError> {
  const result = UPSConfigSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    return err(
      new ShippingError(`Invalid UPS configuration: ${issues}`, 'CONFIG_ERROR', {
        issues: result.error.issues,
      })
    );
  }

  return ok(result.data);
}

export function createUPSConfigFromEnv(): Result<UPSConfig, ShippingError> {
  return createUPSConfig({
    clientId: process.env['UPS_CLIENT_ID'] ?? '',
    clientSecret: process.env['UPS_CLIENT_SECRET'] ?? '',
    baseUrl: process.env['UPS_BASE_URL'],
    authBaseUrl: process.env['UPS_AUTH_URL'],
    transactionSrc: process.env['UPS_TRANSACTION_SRC'],
    merchantId: process.env['UPS_MERCHANT_ID'],
    timeout: process.env['UPS_TIMEOUT_MS']
      ? parseInt(process.env['UPS_TIMEOUT_MS'], 10)
      : undefined,
  });
}
