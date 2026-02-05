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

export type UPSConfigInput = z.input<typeof UPSConfigSchema>;

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

const UPSEnvSchema = z.object({
  UPS_CLIENT_ID: z.string().min(1, 'UPS_CLIENT_ID is required'),
  UPS_CLIENT_SECRET: z.string().min(1, 'UPS_CLIENT_SECRET is required'),
  UPS_BASE_URL: z.string().url().optional(),
  UPS_AUTH_URL: z.string().url().optional(),
  UPS_TRANSACTION_SRC: z.string().optional(),
  UPS_MERCHANT_ID: z.string().optional(),
  UPS_TIMEOUT_MS: z.string().regex(/^\d+$/, 'Must be a number').optional(),
  UPS_ACCOUNT_NUMBER: z.string().optional(),
});

export function createUPSConfigFromEnv(): Result<UPSConfig, ShippingError> {
  const envResult = UPSEnvSchema.safeParse(process.env);

  if (!envResult.success) {
    const issues = envResult.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    return err(
      new ShippingError(`Missing or invalid environment variables: ${issues}`, 'CONFIG_ERROR', {
        issues: envResult.error.issues,
      })
    );
  }

  const env = envResult.data;

  return createUPSConfig({
    clientId: env.UPS_CLIENT_ID,
    clientSecret: env.UPS_CLIENT_SECRET,
    baseUrl: env.UPS_BASE_URL,
    authBaseUrl: env.UPS_AUTH_URL,
    transactionSrc: env.UPS_TRANSACTION_SRC,
    merchantId: env.UPS_MERCHANT_ID,
    timeout: env.UPS_TIMEOUT_MS ? parseInt(env.UPS_TIMEOUT_MS, 10) : undefined,
    accountNumber: env.UPS_ACCOUNT_NUMBER,
  });
}
