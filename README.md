# Cybership - Carrier Integration Service

A TypeScript shipping carrier integration service with extensible architecture for fetching shipping rates from multiple carriers.

## Features

- **Extensible Architecture**: Plugin-based carrier system - add new carriers without modifying existing code
- **Type-Safe**: Full TypeScript with strict mode and Zod runtime validation
- **Production-Ready Auth**: OAuth 2.0 token management with caching and automatic refresh
- **Structured Errors**: Typed error hierarchy with retry hints
- **Fully Tested**: Comprehensive integration tests with stubbed HTTP responses

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure your UPS credentials:

```bash
cp .env.example .env
```

### Running Tests

```bash
npm test
```

## Usage Example

```typescript
import {
  ShippingClient,
  UPSCarrier,
  createUPSConfig,
  createHttpClient,
  WeightUnit,
  DimensionUnit,
  PackagingType,
} from 'cybership';

// Create HTTP client with optional baseURL
const httpClient = createHttpClient({ timeout: 30000 });

// Create UPS configuration
const configResult = createUPSConfig({
  clientId: process.env.UPS_CLIENT_ID!,
  clientSecret: process.env.UPS_CLIENT_SECRET!,
});

if (!configResult.success) {
  throw configResult.error;
}

// Initialize carrier
const upsCarrier = new UPSCarrier(configResult.value, httpClient);

// Create shipping client and register carrier
const client = new ShippingClient();
await client.registerCarrier(upsCarrier);

// Get rates
const rateResult = await client.getRates('ups', {
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
      addressLines: ['456 Destination Ave'],
      city: 'New York',
      stateProvince: 'NY',
      postalCode: '10001',
      countryCode: 'US',
      isResidential: true,
    },
    packages: [
      {
        weight: { value: 5, unit: WeightUnit.LB },
        dimensions: { length: 10, width: 8, height: 6, unit: DimensionUnit.IN },
        packagingType: PackagingType.YOUR_PACKAGING,
      },
    ],
  },
});

if (rateResult.success) {
  console.log('Available rates:');
  for (const quote of rateResult.value.quotes) {
    console.log(`${quote.serviceName}: $${quote.totalCharge.amount} ${quote.totalCharge.currency}`);
  }
} else {
  console.error('Error:', rateResult.error.message);
}

// Cleanup
await client.dispose();
```

## Architecture

### Project Structure

```
src/
├── core/                    # Core abstractions
│   ├── interfaces/          # ICarrier, IRateProvider, etc.
│   ├── errors/              # Error hierarchy
│   └── registry/            # CarrierRegistry
├── domain/                  # Domain models (carrier-agnostic)
│   ├── models/              # Address, Package, RateQuote
│   └── schemas/             # Zod validation schemas
├── carriers/                # Carrier implementations
│   └── ups/                 # UPS implementation
│       ├── mappers/         # Request/Response mappers
│       ├── schemas/         # UPS-specific Zod schemas
│       └── types/           # UPS API types
├── http/                    # HTTP infrastructure
└── config/                  # Configuration management
```

### Key Design Decisions

1. **Strategy Pattern for Carriers**: Each carrier implements `ICarrier` interface. Adding FedEx requires zero changes to UPS code.

2. **Separate Domain and API Types**: Internal domain models are carrier-agnostic. Mappers translate to/from carrier-specific formats.

3. **Result<T, E> for Error Handling**: Explicit error handling without exceptions - better TypeScript inference.

4. **Interface-based HTTP Client**: `IHttpClient` abstraction enables injecting mock clients for testing.

5. **Token Manager with Concurrency Handling**: Single-flight pattern prevents duplicate token requests.

## Adding a New Carrier

To add a new carrier (e.g., FedEx):

1. Create `src/carriers/fedex/` directory
2. Implement `ICarrier` interface in `fedex.carrier.ts`
3. Implement `IRateProvider` in `fedex.rate-provider.ts`
4. Create mappers for request/response translation
5. Add Zod schemas for API validation

The existing code requires no modifications.

## Error Handling

All errors extend `ShippingError` with:
- `code`: Error type identifier
- `isRetryable`: Whether the caller should retry
- `context`: Additional debugging information

```typescript
const result = await client.getRates('ups', request);

if (!result.success) {
  if (result.error.isRetryable) {
    // Implement retry logic
  }

  switch (result.error.code) {
    case 'INVALID_CREDENTIALS':
      // Handle auth error
      break;
    case 'RATE_LIMIT':
      // Wait and retry
      break;
    case 'VALIDATION_ERROR':
      // Fix request
      break;
  }
}
```

## Testing

The test suite uses a mock HTTP client to simulate API responses without network calls:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

- **Unit Tests**: Zod schema validation (34 tests)
- **Integration Tests**: Full flow with mocked HTTP
  - Rate shopping (10 tests)
  - Error handling (8 tests)
  - Auth flow (9 tests)

## Improvements with More Time

- **Retry Logic**: Add configurable retry with exponential backoff
- **Caching**: Add rate quote caching with TTL
- **More Carriers**: FedEx, USPS, DHL implementations
- **More Operations**: Label generation, tracking, address validation
- **Logging**: Structured logging with correlation IDs
- **Metrics**: Request timing, error rates, cache hit rates
- **Rate Limiting**: Client-side rate limiting per carrier

## Technical Notes

### ESM Import Extensions

The source code uses `.js` extensions in TypeScript imports (e.g., `import { foo } from './bar.js'`). This is the [recommended pattern](https://www.typescriptlang.org/docs/handbook/modules/reference.html#file-extension-substitution) for Node.js ESM projects - TypeScript compiles `.ts` → `.js` but doesn't rewrite import paths, so imports must reference the output extension.

The project uses [tsup](https://tsup.egoist.dev/) as a bundler, which produces a clean single-file ESM output.

### TypeScript Enums with Zod

Domain types (ServiceLevel, WeightUnit, etc.) are TypeScript enums, validated at runtime using Zod's `z.nativeEnum()`:

```typescript
// TypeScript enum
export enum ServiceLevel {
  GROUND = 'GROUND',
  EXPRESS = 'EXPRESS',
  // ...
}

// Zod schema using the enum
export const ServiceLevelSchema = z.nativeEnum(ServiceLevel);
```

This provides both compile-time type safety and runtime validation.

## License

MIT
