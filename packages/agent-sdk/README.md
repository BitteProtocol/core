# Bitte Protocol agent-sdk

This is a TypeScript SDK for building agents on the Bitte Protocol.

## Usage

Define and validate Agent input parameters by example:

Suppose we want to build an agent that transfers an amount of a token to a recipient (i.e. an ERC20 transfer).

```ts
// Declare Route Input
interface Input {
  chainId: number;
  amount: number;
  token: string;
  recipient: Address;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  // Note that this is a float (i.e. token units)
  amount: floatField,
  token: addressOrSymbolField,
  recipient: addressField,
};
```

Then the route could be implemented as in [examples/erc20transfer.ts](./examples/erc20transfer.ts) - which utilizes other utils from this package.

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.33. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
