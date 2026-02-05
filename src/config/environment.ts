import { z } from 'zod';

const EnvironmentSchema = z.object({
  UPS_CLIENT_ID: z.string().min(1, 'UPS_CLIENT_ID is required'),
  UPS_CLIENT_SECRET: z.string().min(1, 'UPS_CLIENT_SECRET is required'),
  UPS_BASE_URL: z.string().url().default('https://wwwcie.ups.com/api'),
  UPS_AUTH_URL: z.string().url().default('https://wwwcie.ups.com'),
  UPS_TRANSACTION_SRC: z.string().default('cybership'),
  UPS_MERCHANT_ID: z.string().optional(),
  UPS_TIMEOUT_MS: z.coerce.number().positive().default(30000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

let cachedEnv: Environment | null = null;

export function loadEnvironment(): Environment {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = EnvironmentSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function getEnvironment(): Environment {
  if (!cachedEnv) {
    return loadEnvironment();
  }
  return cachedEnv;
}

export function clearEnvironmentCache(): void {
  cachedEnv = null;
}
