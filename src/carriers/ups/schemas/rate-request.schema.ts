import { z } from 'zod';

const UPSAddressSchema = z.object({
  AddressLine: z.array(z.string()).optional(),
  City: z.string().optional(),
  StateProvinceCode: z.string().optional(),
  PostalCode: z.string().optional(),
  CountryCode: z.string(),
  ResidentialAddressIndicator: z.string().optional(),
});

const UPSShipperSchema = z.object({
  Name: z.string().optional(),
  AttentionName: z.string().optional(),
  ShipperNumber: z.string().optional(),
  Address: UPSAddressSchema,
});

const UPSShipToSchema = z.object({
  Name: z.string().optional(),
  AttentionName: z.string().optional(),
  Address: UPSAddressSchema,
});

const UPSShipFromSchema = z.object({
  Name: z.string().optional(),
  AttentionName: z.string().optional(),
  Address: UPSAddressSchema,
});

const UPSServiceSchema = z.object({
  Code: z.string(),
  Description: z.string().optional(),
});

const UPSUnitOfMeasurementSchema = z.object({
  Code: z.string(),
  Description: z.string().optional(),
});

const UPSDimensionsSchema = z.object({
  UnitOfMeasurement: UPSUnitOfMeasurementSchema,
  Length: z.string(),
  Width: z.string(),
  Height: z.string(),
});

const UPSPackageWeightSchema = z.object({
  UnitOfMeasurement: UPSUnitOfMeasurementSchema,
  Weight: z.string(),
});

const UPSDeclaredValueSchema = z.object({
  CurrencyCode: z.string(),
  MonetaryValue: z.string(),
});

const UPSPackageServiceOptionsSchema = z.object({
  DeclaredValue: UPSDeclaredValueSchema.optional(),
});

const UPSPackageSchema = z.object({
  PackagingType: z.object({
    Code: z.string(),
    Description: z.string().optional(),
  }),
  Dimensions: UPSDimensionsSchema.optional(),
  PackageWeight: UPSPackageWeightSchema,
  PackageServiceOptions: UPSPackageServiceOptionsSchema.optional(),
});

const UPSShipmentRatingOptionsSchema = z.object({
  NegotiatedRatesIndicator: z.string().optional(),
  RateChartIndicator: z.string().optional(),
});

const UPSShipmentSchema = z.object({
  Shipper: UPSShipperSchema,
  ShipTo: UPSShipToSchema,
  ShipFrom: UPSShipFromSchema.optional(),
  Service: UPSServiceSchema.optional(),
  Package: z.array(UPSPackageSchema),
  ShipmentRatingOptions: UPSShipmentRatingOptionsSchema.optional(),
  NumOfPieces: z.string().optional(),
});

const UPSRequestSchema = z.object({
  SubVersion: z.string().optional(),
  TransactionReference: z
    .object({
      CustomerContext: z.string().optional(),
    })
    .optional(),
});

const UPSDeliveryTimeInformationSchema = z.object({
  PackageBillType: z.string().optional(),
  Pickup: z
    .object({
      Date: z.string().optional(),
    })
    .optional(),
});

export const UPSRateRequestSchema = z.object({
  RateRequest: z.object({
    Request: UPSRequestSchema.optional(),
    Shipment: UPSShipmentSchema,
    DeliveryTimeInformation: UPSDeliveryTimeInformationSchema.optional(),
  }),
});

export type UPSRateRequestType = z.infer<typeof UPSRateRequestSchema>;
