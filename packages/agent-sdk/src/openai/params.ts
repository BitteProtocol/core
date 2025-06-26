export const chainIdParam = {
  name: "chainId",
  in: "query",
  required: true,
  description: "EVM Network (aka chain ID)",
  schema: { type: "number" },
  example: 100,
};

export const addressParam = {
  name: "address",
  in: "query",
  required: true,
  description: "20 byte Ethereum address with 0x prefix",
  schema: { type: "string" },
};

export const addressOrSymbolParam = {
  name: "address",
  in: "query",
  required: true,
  description:
    "The ERC-20 token symbol or address to be sold, if provided with the symbol do not try to infer the address.",
  schema: { type: "string" },
  example: "0x6810e776880c02933d47db1b9fc05908e5386b96",
};

export const amountParam = {
  name: "amount",
  in: "query",
  required: true,
  description: "Amount in human-readable units (not wei)",
  schema: { type: "number" },
  example: 0.123,
};
