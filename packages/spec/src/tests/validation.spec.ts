import { bittePrimitiveToolNamesZodSchema, type BitteExtensionSchema, type BitteOpenAPISpec } from "../schemas.js";
import { validateBittePluginSpec } from "../validation.js";
import cowSpec from "./cow_spec.json"

const bittePrimitiveOptionsString =
  bittePrimitiveToolNamesZodSchema.options.join("' | '");

const spec: BitteOpenAPISpec = {
  openapi: "3.0.0",
  info: {
    title: "assistantName",
    description: "assistantDescription",
    version: "1.0.0",
  },
  paths: {},
  "x-mb": {
    assistant: {
      name: "assistantName",
      description: "assistantDescription",
      instructions: "assistantInstructions",
    },
  },
};

type ArbitraryObject = { [key: string]: unknown };

const assistant: ArbitraryObject = {};

describe("src/config", () => {
  it("validateBittePluginSpec complete flow", async () => {
    await expect(
      validateBittePluginSpec(null as unknown as string),
    ).resolves.toMatchObject({
      valid: false,
      errorMessage: "Invalid url or spec provided. Exiting before validation.",
    });

    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    spec["x-mb"].assistant = assistant as BitteExtensionSchema["assistant"]
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage: "Missing field x-mb.assistant.name expected string",
    });

    assistant.name = "assistantName";
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage: "Missing field x-mb.assistant.description expected string",
    });

    assistant.description = "assistantDescription";
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage: "Missing field x-mb.assistant.instructions expected string",
    });

    assistant.instructions = "assistantInstructions";

    // Checkpoint Valid XMbSpec
    expect(spec["x-mb"]).toStrictEqual({
      assistant: {
        name: "assistantName",
        description: "assistantDescription",
        instructions: "assistantInstructions",
      },
    });
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    // Optional fields
    assistant.tools = null;
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage:
        "Invalid type. Expected x-mb.assistant.tools array, received null",
    });

    assistant.tools = [];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    assistant.tools = [1];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage:
        "Invalid type. Expected x-mb.assistant.tools.0 object, received number",
    });

    assistant.tools = [{}];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage: `Missing field x-mb.assistant.tools.0.type expected '${bittePrimitiveOptionsString}'`,
    });

    assistant.tools = [{ type: 1 }];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage: `Invalid type. Expected x-mb.assistant.tools.0.type '${bittePrimitiveOptionsString}', received number`,
    });

    assistant.tools = [{ type: "function" }];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage: `Invalid enum value. Expected '${bittePrimitiveOptionsString}', received 'function' for x-mb.assistant.tools.0.type`,
    });

    assistant.tools = [
      {
        type: "generate-evm-tx",
      },
    ];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    assistant.chainIds = null;
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage:
        "Invalid type. Expected x-mb.assistant.chainIds array, received null",
    });

    assistant.chainIds = ["ethereum"];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage:
        "Invalid type. Expected x-mb.assistant.chainIds.0 number, received string",
    });

    assistant.chainIds = [1, 2];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    assistant.categories = null;
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage:
        "Invalid type. Expected x-mb.assistant.categories array, received null",
    });

    assistant.categories = [null];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage:
        "Invalid type. Expected x-mb.assistant.categories.0 string, received null",
    });

    assistant.categories = ["ethereum", "solana"];
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    assistant.version = null;
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage:
        "Invalid type. Expected x-mb.assistant.version string, received null",
    });

    assistant.version = "1.0.0";
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    assistant.repo = null;
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage:
        "Invalid type. Expected x-mb.assistant.repo string, received null",
    });

    assistant.repo = "https://github.com/example/repo";
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    spec["x-mb"].email = 123 as unknown as string;
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: false,
      errorMessage: "Invalid type. Expected x-mb.email string, received number",
    });

    spec["x-mb"].email = "test@example.com";
    await expect(validateBittePluginSpec(spec)).resolves.toMatchObject({
      valid: true,
    });

    // Full Example Spec:
    expect(spec).toStrictEqual({
      openapi: "3.0.0",
      info: {
        title: "assistantName",
        description: "assistantDescription",
        version: "1.0.0",
      },
      paths: {},
      "x-mb": {
        assistant: {
          name: "assistantName",
          description: "assistantDescription",
          instructions: "assistantInstructions",
          tools: [{ type: "generate-evm-tx" }],
          chainIds: [1, 2],
          categories: ["ethereum", "solana"],
          version: "1.0.0",
          repo: "https://github.com/example/repo",
        },
        email: "test@example.com",
      },
    });
  });

  it("validateBittePluginSpec real example (CoW Agent)", async () => {
    await expect(validateBittePluginSpec(cowSpec)).resolves.toMatchObject({
      valid: true,
    });
  });
});
