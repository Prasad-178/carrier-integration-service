import {
  AddressSchema,
  PackageSchema,
  ShipmentSchema,
  RateRequestSchema,
  WeightSchema,
  DimensionsSchema,
} from '../../../src/domain/schemas/index';

describe('Domain Schemas', () => {
  describe('AddressSchema', () => {
    const validAddress = {
      name: 'John Doe',
      addressLines: ['123 Main St'],
      city: 'New York',
      stateProvince: 'NY',
      postalCode: '10001',
      countryCode: 'US',
    };

    it('should validate a valid US address', () => {
      const result = AddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should validate address with all optional fields', () => {
      const address = {
        ...validAddress,
        company: 'Acme Corp',
        addressLines: ['123 Main St', 'Suite 100'],
        phone: '+1-555-123-4567',
        email: 'john@acme.com',
        isResidential: false,
      };
      const result = AddressSchema.safeParse(address);
      expect(result.success).toBe(true);
    });

    it('should reject address without name', () => {
      const { name, ...addressWithoutName } = validAddress;
      const result = AddressSchema.safeParse(addressWithoutName);
      expect(result.success).toBe(false);
    });

    it('should reject address without country code', () => {
      const { countryCode, ...addressWithoutCountry } = validAddress;
      const result = AddressSchema.safeParse(addressWithoutCountry);
      expect(result.success).toBe(false);
    });

    it('should reject invalid country code length', () => {
      const result = AddressSchema.safeParse({
        ...validAddress,
        countryCode: 'USA', // should be 2 chars
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('2 characters');
      }
    });

    it('should reject invalid email format', () => {
      const result = AddressSchema.safeParse({
        ...validAddress,
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty address lines array', () => {
      const result = AddressSchema.safeParse({
        ...validAddress,
        addressLines: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 3 address lines', () => {
      const result = AddressSchema.safeParse({
        ...validAddress,
        addressLines: ['Line 1', 'Line 2', 'Line 3', 'Line 4'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('WeightSchema', () => {
    it('should validate positive weight in LB', () => {
      const result = WeightSchema.safeParse({ value: 5.5, unit: 'LB' });
      expect(result.success).toBe(true);
    });

    it('should validate weight in all supported units', () => {
      const units = ['LB', 'KG', 'OZ', 'G'] as const;
      for (const unit of units) {
        const result = WeightSchema.safeParse({ value: 1, unit });
        expect(result.success).toBe(true);
      }
    });

    it('should reject negative weight', () => {
      const result = WeightSchema.safeParse({ value: -1, unit: 'LB' });
      expect(result.success).toBe(false);
    });

    it('should reject zero weight', () => {
      const result = WeightSchema.safeParse({ value: 0, unit: 'LB' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid unit', () => {
      const result = WeightSchema.safeParse({ value: 5, unit: 'INVALID' });
      expect(result.success).toBe(false);
    });
  });

  describe('DimensionsSchema', () => {
    it('should validate positive dimensions in IN', () => {
      const result = DimensionsSchema.safeParse({
        length: 10,
        width: 8,
        height: 6,
        unit: 'IN',
      });
      expect(result.success).toBe(true);
    });

    it('should validate dimensions in CM', () => {
      const result = DimensionsSchema.safeParse({
        length: 25,
        width: 20,
        height: 15,
        unit: 'CM',
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative dimensions', () => {
      const result = DimensionsSchema.safeParse({
        length: -10,
        width: 8,
        height: 6,
        unit: 'IN',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('PackageSchema', () => {
    const validPackage = {
      weight: { value: 5, unit: 'LB' as const },
      dimensions: { length: 10, width: 8, height: 6, unit: 'IN' as const },
      packagingType: 'YOUR_PACKAGING' as const,
    };

    it('should validate package with dimensions', () => {
      const result = PackageSchema.safeParse(validPackage);
      expect(result.success).toBe(true);
    });

    it('should validate envelope without dimensions', () => {
      const pkg = {
        weight: { value: 0.5, unit: 'LB' as const },
        packagingType: 'CARRIER_ENVELOPE' as const,
      };
      const result = PackageSchema.safeParse(pkg);
      expect(result.success).toBe(true);
    });

    it('should validate all packaging types', () => {
      const types = [
        'YOUR_PACKAGING',
        'CARRIER_ENVELOPE',
        'CARRIER_PAK',
        'CARRIER_BOX_SMALL',
        'CARRIER_BOX_MEDIUM',
        'CARRIER_BOX_LARGE',
        'CARRIER_TUBE',
      ] as const;

      for (const packagingType of types) {
        const result = PackageSchema.safeParse({
          ...validPackage,
          packagingType,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should validate package with declared value', () => {
      const result = PackageSchema.safeParse({
        ...validPackage,
        declaredValue: { amount: 100, currency: 'USD' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid currency code length', () => {
      const result = PackageSchema.safeParse({
        ...validPackage,
        declaredValue: { amount: 100, currency: 'US' },
      });
      expect(result.success).toBe(false);
    });

    it('should validate package with reference', () => {
      const result = PackageSchema.safeParse({
        ...validPackage,
        reference: 'ORDER-12345',
      });
      expect(result.success).toBe(true);
    });

    it('should reject reference exceeding 35 characters', () => {
      const result = PackageSchema.safeParse({
        ...validPackage,
        reference: 'A'.repeat(36),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ShipmentSchema', () => {
    const validShipment = {
      origin: {
        name: 'Sender',
        addressLines: ['123 Origin St'],
        city: 'Los Angeles',
        stateProvince: 'CA',
        postalCode: '90001',
        countryCode: 'US',
      },
      destination: {
        name: 'Recipient',
        addressLines: ['456 Dest Ave'],
        city: 'New York',
        stateProvince: 'NY',
        postalCode: '10001',
        countryCode: 'US',
      },
      packages: [
        {
          weight: { value: 5, unit: 'LB' as const },
          packagingType: 'YOUR_PACKAGING' as const,
        },
      ],
    };

    it('should validate a valid domestic shipment', () => {
      const result = ShipmentSchema.safeParse(validShipment);
      expect(result.success).toBe(true);
    });

    it('should validate shipment with ship date', () => {
      const result = ShipmentSchema.safeParse({
        ...validShipment,
        shipDate: '2025-02-15',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid ship date format', () => {
      const result = ShipmentSchema.safeParse({
        ...validShipment,
        shipDate: '02/15/2025',
      });
      expect(result.success).toBe(false);
    });

    it('should validate shipment with service level', () => {
      const result = ShipmentSchema.safeParse({
        ...validShipment,
        serviceLevel: 'GROUND',
      });
      expect(result.success).toBe(true);
    });

    it('should validate all service levels', () => {
      const levels = [
        'GROUND',
        'EXPRESS',
        'EXPRESS_SAVER',
        'OVERNIGHT',
        'OVERNIGHT_EARLY',
        'TWO_DAY',
        'THREE_DAY',
        'INTERNATIONAL_ECONOMY',
        'INTERNATIONAL_PRIORITY',
      ] as const;

      for (const serviceLevel of levels) {
        const result = ShipmentSchema.safeParse({
          ...validShipment,
          serviceLevel,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject empty packages array', () => {
      const result = ShipmentSchema.safeParse({
        ...validShipment,
        packages: [],
      });
      expect(result.success).toBe(false);
    });

    it('should validate shipment with multiple packages', () => {
      const result = ShipmentSchema.safeParse({
        ...validShipment,
        packages: [
          { weight: { value: 5, unit: 'LB' as const }, packagingType: 'YOUR_PACKAGING' as const },
          { weight: { value: 10, unit: 'LB' as const }, packagingType: 'YOUR_PACKAGING' as const },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('RateRequestSchema', () => {
    const validRateRequest = {
      shipment: {
        origin: {
          name: 'Sender',
          addressLines: ['123 Origin St'],
          city: 'Los Angeles',
          stateProvince: 'CA',
          postalCode: '90001',
          countryCode: 'US',
        },
        destination: {
          name: 'Recipient',
          addressLines: ['456 Dest Ave'],
          city: 'New York',
          stateProvince: 'NY',
          postalCode: '10001',
          countryCode: 'US',
        },
        packages: [
          {
            weight: { value: 5, unit: 'LB' as const },
            packagingType: 'YOUR_PACKAGING' as const,
          },
        ],
      },
    };

    it('should validate a valid rate request', () => {
      const result = RateRequestSchema.safeParse(validRateRequest);
      expect(result.success).toBe(true);
    });

    it('should validate rate request with service level', () => {
      const result = RateRequestSchema.safeParse({
        ...validRateRequest,
        serviceLevel: 'OVERNIGHT',
      });
      expect(result.success).toBe(true);
    });

    it('should validate rate request with negotiated rates flag', () => {
      const result = RateRequestSchema.safeParse({
        ...validRateRequest,
        requestNegotiatedRates: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject rate request without shipment', () => {
      const result = RateRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
