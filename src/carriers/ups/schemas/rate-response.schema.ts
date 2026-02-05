import { z } from 'zod';

const UPSChargesSchema = z.object({
  CurrencyCode: z.string(),
  MonetaryValue: z.string(),
});

const UPSUnitOfMeasurementSchema = z.object({
  Code: z.string(),
  Description: z.string().optional(),
});

const UPSServiceSchema = z.object({
  Code: z.string(),
  Description: z.string().optional(),
});

const UPSAlertSchema = z.object({
  Code: z.string(),
  Description: z.string(),
});

const UPSGuaranteedDeliverySchema = z.object({
  BusinessDaysInTransit: z.string().optional(),
  Date: z.string().optional(),
  Time: z.string().optional(),
});

const UPSRatedPackageSchema = z.object({
  TransportationCharges: UPSChargesSchema.optional(),
  ServiceOptionsCharges: UPSChargesSchema.optional(),
  TotalCharges: UPSChargesSchema.optional(),
  Weight: z.string().optional(),
});

const UPSItemizedChargeSchema = UPSChargesSchema.extend({
  Code: z.string().optional(),
  Description: z.string().optional(),
});

const UPSNegotiatedRateChargesSchema = z.object({
  TotalCharge: UPSChargesSchema.optional(),
});

const UPSTimeInTransitSchema = z.object({
  ServiceSummary: z
    .object({
      EstimatedArrival: z
        .object({
          BusinessDaysInTransit: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

const UPSRatedShipmentSchema = z.object({
  Service: UPSServiceSchema,
  RatedShipmentAlert: z.array(UPSAlertSchema).optional(),
  BillingWeight: z
    .object({
      UnitOfMeasurement: UPSUnitOfMeasurementSchema,
      Weight: z.string(),
    })
    .optional(),
  TransportationCharges: UPSChargesSchema.optional(),
  ServiceOptionsCharges: UPSChargesSchema.optional(),
  TotalCharges: UPSChargesSchema,
  GuaranteedDelivery: UPSGuaranteedDeliverySchema.optional(),
  RatedPackage: z.array(UPSRatedPackageSchema).optional(),
  ItemizedCharges: z.array(UPSItemizedChargeSchema).optional(),
  NegotiatedRateCharges: UPSNegotiatedRateChargesSchema.optional(),
  TimeInTransit: UPSTimeInTransitSchema.optional(),
});

const UPSResponseStatusSchema = z.object({
  Code: z.string(),
  Description: z.string(),
});

const UPSErrorSchema = z.object({
  ErrorSeverity: z.string().optional(),
  ErrorCode: z.string().optional(),
  ErrorDescription: z.string().optional(),
});

const UPSResponseSchema = z.object({
  ResponseStatus: UPSResponseStatusSchema,
  Alert: z.union([UPSAlertSchema, z.array(UPSAlertSchema)]).optional(),
  Error: UPSErrorSchema.optional(),
});

export const UPSRateResponseSchema = z.object({
  RateResponse: z.object({
    Response: UPSResponseSchema,
    RatedShipment: z.union([
      UPSRatedShipmentSchema,
      z.array(UPSRatedShipmentSchema),
    ]),
  }),
});

export type UPSRateResponseType = z.infer<typeof UPSRateResponseSchema>;
export type UPSRatedShipmentType = z.infer<typeof UPSRatedShipmentSchema>;
