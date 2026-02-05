import { z } from 'zod';
import { ServiceLevelSchema } from './shipment.schema.js';

export const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string().length(3),
});

export const ChargeBreakdownSchema = z.object({
  baseCharge: MoneySchema,
  fuelSurcharge: MoneySchema.optional(),
  residentialSurcharge: MoneySchema.optional(),
  deliveryAreaSurcharge: MoneySchema.optional(),
  otherSurcharges: z
    .array(
      z.object({
        name: z.string(),
        charge: MoneySchema,
      })
    )
    .optional(),
});

export const DeliveryEstimateSchema = z.object({
  guaranteedDate: z.string().optional(),
  businessDaysInTransit: z.number().int().positive().optional(),
  deliveryByTime: z.string().optional(),
});

export const RateQuoteSchema = z.object({
  carrierId: z.string(),
  carrierName: z.string(),
  serviceLevel: ServiceLevelSchema,
  serviceName: z.string(),
  serviceCode: z.string(),
  totalCharge: MoneySchema,
  chargeBreakdown: ChargeBreakdownSchema.optional(),
  estimatedDelivery: DeliveryEstimateSchema.optional(),
  isNegotiatedRate: z.boolean(),
  rawResponse: z.unknown().optional(),
});

export const RateResponseSchema = z.object({
  success: z.boolean(),
  quotes: z.array(RateQuoteSchema),
  requestId: z.string().uuid(),
  timestamp: z.string().datetime(),
  warnings: z.array(z.string()).optional(),
});

export type RateQuoteOutput = z.output<typeof RateQuoteSchema>;
export type RateResponseOutput = z.output<typeof RateResponseSchema>;
