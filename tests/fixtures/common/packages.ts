import type { Package } from '../../../src/domain/models/index.js';

export const PACKAGES = {
  SMALL_BOX: {
    weight: { value: 2, unit: 'LB' },
    dimensions: { length: 10, width: 8, height: 6, unit: 'IN' },
    packagingType: 'YOUR_PACKAGING',
  } satisfies Package,

  MEDIUM_BOX: {
    weight: { value: 5, unit: 'LB' },
    dimensions: { length: 15, width: 12, height: 10, unit: 'IN' },
    packagingType: 'YOUR_PACKAGING',
  } satisfies Package,

  LARGE_BOX: {
    weight: { value: 15, unit: 'LB' },
    dimensions: { length: 24, width: 18, height: 12, unit: 'IN' },
    packagingType: 'YOUR_PACKAGING',
  } satisfies Package,

  ENVELOPE: {
    weight: { value: 0.5, unit: 'LB' },
    packagingType: 'CARRIER_ENVELOPE',
  } satisfies Package,

  HEAVY_PACKAGE: {
    weight: { value: 50, unit: 'LB' },
    dimensions: { length: 30, width: 24, height: 20, unit: 'IN' },
    packagingType: 'YOUR_PACKAGING',
    declaredValue: { amount: 500, currency: 'USD' },
  } satisfies Package,
};
