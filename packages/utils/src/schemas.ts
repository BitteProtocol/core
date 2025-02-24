import type { IJsonSchema, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { z } from "zod";

/**
 * Literal key for the "x-mb" extension.
 */
export const xMbKeyZodSchema = z.literal("x-mb");
export const xMbKey: z.infer<typeof xMbKeyZodSchema> = "x-mb";

export const bittePrimitiveToolNamesZodSchema = z.enum([
  "transfer-ft",
  "generate-transaction",
  "submit-query",
  "generate-image",
  "create-drop",
  "getSwapTransactions",
  "getTokenMetadata",
  "generate-evm-tx",
  "render-chart",
  "share-twitter",
  "sign-message",
]);

export const openApiVersionZodSchema = z.union([
  z.literal("3.0.0"),
  z.literal("3.0.1"),
  z.literal("3.0.2"),
  z.literal("3.0.3"),
  z.literal("3.0.4"),
  z.literal("3.1.0"),
  z.literal("3.1.1"),
]);

export type OpenApiVersion = z.infer<typeof openApiVersionZodSchema>;

/**
 * Zod schema for the "x-mb" extension as used at runtime
 * (more direct than the JSON Schema version).
 */
export const bitteExtensionZodSchema = z.object({
  "account-id": z.string().optional(),
  email: z.string().optional(),
  assistant: z.object({
    name: z.string(),
    description: z.string(),
    instructions: z.string(),
    image: z.string().optional(),
    tools: z
      .array(z.object({ type: bittePrimitiveToolNamesZodSchema }))
      .optional(),
    categories: z.array(z.string()).optional(),
    chainIds: z.array(z.number()).optional(),
    version: z.string().optional(),
    repo: z.string().optional(),
  }),
});

/**
 * A specialized OpenAPI.Document type that *must* have "x-mb" as an extension,
 * typed as `BitteExtensionSchema`. Allows OpenAPI v3.0 or v3.1 specs.
 */
export type BitteOpenAPISpec = (
  | NonNullable<OpenAPIV3_1.Document>
  | NonNullable<OpenAPIV3.Document>
) & {
  openapi: OpenApiVersion;
  [xMbKey]: BitteExtensionSchema;
};

/**
 * Zod schema for an entire OpenAPI + "x-mb" extension object.
 * Uses `extensionZodSchema` nested under the "x-mb" key.
 */
export const bitteOpenAPISpecZodSchema: z.ZodType<
  BitteOpenAPISpec & { paths: OpenAPIV3.PathsObject }
> = z.object({
  openapi: openApiVersionZodSchema,
  info: z.object({
    title: z.string().describe("The title of the API"),
    description: z.string().describe("A description of the API").optional(),
    version: z.string().describe("The version of the API"),
    license: z
      .object({
        name: z.string().describe("The name of the license"),
        url: z.string().describe("The URL of the license").optional(),
      })
      .optional(),
  }),
  paths: z
    .record(z.string(), z.record(z.string(), z.any()))
    .describe("The paths of the API"),
  // Use xMbKey in bracket notation to assign `extensionZodSchema`
  [xMbKey]: bitteExtensionZodSchema,
  servers: z
    .array(
      z.object({
        url: z.string().describe("The URL of the server"),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

export type BitteExtensionSchema = z.infer<typeof bitteExtensionZodSchema>;

export type BittePrimitiveToolName = z.infer<
  typeof bittePrimitiveToolNamesZodSchema
>;

/**
 * The JSON Schema object to be used as a $ref or inline
 * in the "x-mb" extension property.
 */
export const bitteExtensionJsonSchema = {
  type: "object",
  title: "Bitte Extension Schema",
  description: "Additional metadata for the Bitte plugin extension",
  required: ["assistant"],
  properties: {
    "account-id": {
      type: "string",
      description:
        "Specifies the NEAR blockchain account ID associated with the plugin",
    },
    email: {
      type: "string",
      description: "Specifies the email address associated with this plugin",
    },
    assistant: {
      type: "object",
      title: "Agent Configuration",
      description: "Configuration for the agent",
      required: ["name", "description", "instructions"],
      properties: {
        name: {
          type: "string",
          description: "The name of the agent. Example: 'Weather Agent'",
        },
        description: {
          type: "string",
          description: "A summary of the agent's functionalities",
        },
        instructions: {
          type: "string",
          description: "Instructions defining the agent's role",
        },
        image: {
          type: "string",
          description: "URL to an image representing the agent",
        },
        categories: {
          type: "array",
          description: "Tags that categorize your agent",
          items: { type: "string" },
        },
        chainIds: {
          type: "array",
          description: "Array of EVM chain IDs the agent operates on",
          items: { type: "number" },
        },
        version: {
          type: "string",
          description: "Version of the agent",
        },
        repo: {
          type: "string",
          description: "Link to the code repository for the agent",
        },
        tools: {
          type: "array",
          description: "List of tools the agent can use",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: [
                  "transfer-ft",
                  "generate-transaction",
                  "submit-query",
                  "generate-image",
                  "create-drop",
                  "getSwapTransactions",
                  "getTokenMetadata",
                  "generate-evm-tx",
                  "render-chart",
                  "share-twitter",
                  "sign-message",
                ],
                description: "Provider-specific tool executable by the runtime",
              },
            },
          },
        },
      },
    },
  },
} satisfies IJsonSchema;

/**
 * A reference spec you might want to expose as a base example for other code.
 */
export const EXAMPLE_BITTE_SPEC: BitteOpenAPISpec = {
  openapi: "3.1.1",
  info: {
    title: "Bitte OpenAPI Agent Specification",
    description:
      "Reference spec for Bitte OpenAPI Agent Plugins and 'x-mb' extension",
    version: "1.0.0",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  paths: {
    "/generate-evm-tx": {
      post: {
        summary: "Generate an EVM transaction",
        description: "Generate an EVM transaction",
        responses: {
          200: {
            description: "A successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  [xMbKey]: {
    "account-id": "example-account-id",
    email: "example@example.com",
    assistant: {
      name: "Example Agent",
      description:
        "An example agent using the Bitte OpenAPI Agent Specification",
      instructions:
        "This agent can generate EVM transactions and generate images",
      tools: [{ type: "generate-evm-tx" }, { type: "generate-image" }],
      categories: ["evm", "image"],
      chainIds: [1, 137],
      version: "1.0.0",
      repo: "https://github.com/BitteProtocol/agent-next-boilerplate",
      image: "https://example.com/example-agent.png",
    },
  },
  servers: [
    {
      url: "https://docs.bitte.ai",
      description: "Placeholder, replace with API endpoint for your plugin",
    },
  ],
};
