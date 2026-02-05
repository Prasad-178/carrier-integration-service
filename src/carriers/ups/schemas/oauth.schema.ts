import { z } from 'zod';

export const UPSOAuthResponseSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  expires_in: z.number(),
  issued_at: z.string().optional(),
  client_id: z.string().optional(),
  scope: z.string().optional(),
  refresh_count: z.string().optional(),
  status: z.string().optional(),
});

export type UPSOAuthResponseType = z.infer<typeof UPSOAuthResponseSchema>;
