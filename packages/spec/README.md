# bitte-ai-spec

A TypeScript library for validating OpenAPI specifications with Bitte AI extensions. This package provides schemas, validation utilities, and types for working with OpenAPI specs that include the `x-mb` extension for AI agent configurations.

## Installation

```bash
npm install bitte-ai-spec
# or
yarn add bitte-ai-spec
# or
pnpm add bitte-ai-spec
```

## Features

- Validation of Bitte OpenAPI specification (OpenAPI 3.0 and 3.1 with `x-mb` extension)
- Zod schemas for runtime validation
- JSON Schema for static validation
- TypeScript types for type safety
- Support for Bitte AI's `x-mb` extension
- Utility functions for error formatting and spec fetching

## Usage

### Basic Validation

```typescript
import { validateBittePluginSpec } from 'bitte-ai-spec';

// Validate an OpenAPI spec
const result = await validateBittePluginSpec(spec);
if (result.valid) {
  console.log('Spec is valid!', result.schema);
} else {
  console.error('Validation failed:', result.errorMessage);
}
```

### Using Types

```typescript
import { BitteOpenAPISpec, BitteExtensionSchema } from 'bitte-ai-spec';

// Type your OpenAPI spec
const mySpec: BitteOpenAPISpec = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0"
  },
  paths: {},
  "x-mb": {
    assistant: {
      name: "My Assistant",
      description: "An AI assistant",
      instructions: "Help users with tasks"
    }
  }
};
```

### Fetching Remote Specs

```typescript
import { fetchSpecWithRetry } from 'bitte-ai-spec';

// Fetch a remote spec with retry logic
const specContent = await fetchSpecWithRetry('https://api.example.com/openapi.json');
```

## API Reference

### Main Exports

- `validateBittePluginSpec`: Main validation function for OpenAPI specs
- `BitteOpenAPISpec`: TypeScript type for valid OpenAPI specs with x-mb extension
- `BitteExtensionSchema`: TypeScript type for the x-mb extension schema
- `EXAMPLE_BITTE_SPEC`: Reference example of a valid spec
- `fetchSpecWithRetry`: Utility for fetching remote specs with retry logic

### Schemas

- `bitteExtensionZodSchema`: Zod schema for x-mb extension
- `bitteOpenAPISpecZodSchema`: Zod schema for full OpenAPI spec
- `bitteExtensionJsonSchema`: JSON Schema for x-mb extension

### Utilities

- `formatZodError`: Format Zod validation errors
- `formatOpenAPIError`: Format OpenAPI validation errors
- `formatOpenAPIErrors`: Format multiple OpenAPI validation errors

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Type check
pnpm typecheck

# Development with watch mode
pnpm dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
