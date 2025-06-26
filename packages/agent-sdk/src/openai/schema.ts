export const AddressSchema = {
  description: "20 byte Ethereum address encoded as a hex with `0x` prefix.",
  type: "string",
  example: "0x6810e776880c02933d47db1b9fc05908e5386b96",
};

export const MetaTransactionSchema = {
  type: "object",
  description: "Sufficient data representing an EVM transaction",
  properties: {
    to: { $ref: "#/components/schemas/Address" },
    data: {
      type: "string",
      description: "Transaction calldata",
      example: "0xd0e30db0",
    },
    value: {
      type: "string",
      description: "Transaction value",
      example: "0x1b4fbd92b5f8000",
    },
  },
  required: ["to", "data", "value"],
};

export const SignRequestSchema = {
  type: "object",
  required: ["method", "chainId", "params"],
  properties: {
    method: {
      type: "string",
      enum: [
        "eth_sign",
        "personal_sign",
        "eth_sendTransaction",
        "eth_signTypedData",
        "eth_signTypedData_v4",
      ],
      description: "The signing method to be used.",
    },
    chainId: {
      type: "integer",
      description: "The ID of the Ethereum chain.",
    },
    params: {
      oneOf: [
        {
          type: "array",
          items: { $ref: "#/components/schemas/MetaTransaction" },
        },
        {
          type: "array",
          items: { type: "string" },
        },
      ],
    },
  },
};
