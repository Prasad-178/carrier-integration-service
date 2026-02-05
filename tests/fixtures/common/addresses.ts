import type { Address } from '../../../src/domain/models/index.js';

export const ADDRESSES = {
  US_RESIDENTIAL: {
    name: 'John Doe',
    addressLines: ['123 Main Street', 'Apt 4B'],
    city: 'New York',
    stateProvince: 'NY',
    postalCode: '10001',
    countryCode: 'US',
    isResidential: true,
  } satisfies Address,

  US_COMMERCIAL: {
    name: 'Acme Corp',
    company: 'Acme Corporation',
    addressLines: ['456 Business Ave'],
    city: 'Los Angeles',
    stateProvince: 'CA',
    postalCode: '90001',
    countryCode: 'US',
    isResidential: false,
  } satisfies Address,

  US_ORIGIN: {
    name: 'Warehouse',
    company: 'Cybership Fulfillment',
    addressLines: ['789 Warehouse Blvd'],
    city: 'Timonium',
    stateProvince: 'MD',
    postalCode: '21093',
    countryCode: 'US',
    isResidential: false,
  } satisfies Address,

  CANADA: {
    name: 'Jane Smith',
    addressLines: ['789 Maple Road'],
    city: 'Toronto',
    stateProvince: 'ON',
    postalCode: 'M5V 2N8',
    countryCode: 'CA',
  } satisfies Address,
};
