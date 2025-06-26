export const SignRequestResponse200 = {
  description: "Successful signing request",
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["transaction"],
        properties: {
          transaction: { $ref: "#/components/schemas/SignRequest" },
          meta: {
            type: "object",
            additionalProperties: true,
            example: { message: "Submitted" },
          },
        },
      },
    },
  },
};
