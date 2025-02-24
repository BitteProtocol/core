import { validate, type ErrorObject } from "@scalar/openapi-parser";
import { bitteOpenAPISpecZodSchema, type BitteOpenAPISpec } from "./schemas.js";
import {
  fetchSpecWithRetry,
  formatOpenAPIErrors,
  formatZodError,
} from "./utils.js";

/**
 * Validation function for Bitte OpenAPI spec with "x-mb" extension.
 */
export async function validateBittePluginSpec(
  spec: string | object | URL | null | undefined,
): Promise<{
  valid: boolean;
  errors?: ErrorObject[];
  errorMessage?: string;
  schema?: BitteOpenAPISpec;
}> {
  try {
    if (spec == null) {
      return {
        valid: false,
        errorMessage:
          "Invalid url or spec provided. Exiting before validation.",
      };
    }

    let specContent: object;
    const isUrl =
      spec instanceof URL ||
      (typeof spec === "string" && spec.startsWith("http"));

    try {
      if (isUrl) {
        const specUrl = spec.toString();
        const fetchedContent = await fetchSpecWithRetry(specUrl);
        specContent = JSON.parse(fetchedContent);
      } else if (typeof spec === "string") {
        specContent = JSON.parse(spec);
      } else {
        specContent = spec;
      }
    } catch {
      const errorMessage = isUrl
        ? `Unable to fetch/parse spec at url: ${spec}`
        : "Invalid spec format. Must be valid JSON string or object.";
      return {
        valid: false,
        errors: [
          {
            message: errorMessage,
            code: "INVALID_SPEC_FORMAT",
          },
        ],
        errorMessage,
      };
    }

    // First validate OpenAPI structure using @scalar/openapi-parser
    const {
      valid: openAPIValid,
      errors: openAPIErrors,
      schema: openAPISchema,
    } = await validate(specContent, {
      throwOnError: false,
    });

    // Parse with zod for detailed validation and 'x-mb' extension validation
    const {
      success: schemaParseSuccess,
      error: schemaParseError,
      data: parsedSchema,
    } = bitteOpenAPISpecZodSchema.safeParse(openAPISchema);

    if (
      !openAPIValid ||
      !openAPISchema ||
      !schemaParseSuccess ||
      !parsedSchema
    ) {
      const combinedErrors = [
        ...(openAPIErrors ?? []),
        ...(schemaParseError?.errors ?? []),
      ];

      const combinedErrorMessages = [];
      if (openAPIErrors?.length) {
        combinedErrorMessages.push(formatOpenAPIErrors(openAPIErrors));
      }
      if (schemaParseError) {
        combinedErrorMessages.push(formatZodError(schemaParseError));
      }

      return {
        valid: false,
        errors: combinedErrors,
        errorMessage: combinedErrorMessages.join("\n"),
      };
    }

    return {
      valid: true,
      schema: parsedSchema,
    };
  } catch (error) {
    const errorString = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      errors: [
        {
          message: errorString,
          code: "UNKNOWN_ERROR",
        },
      ],
      errorMessage: `Unknown error: ${errorString}`,
    };
  }
}
