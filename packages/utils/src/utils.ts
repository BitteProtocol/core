import type { ErrorObject } from "@scalar/openapi-parser";
import type { ZodError } from "zod";

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // Initial delay in milliseconds
const BACKOFF_FACTOR = 1.5; // Exponential backoff multiplier

// Attempts to fetch a spec from a URL with retry logic.  Returns the spec as a string or throws an error.
export async function fetchSpecWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
  delay = INITIAL_DELAY,
): Promise<string> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();

    // Only try to parse if content is JSON
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      JSON.parse(text); // Validate JSON
    }

    return text;
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Retry attempt ${MAX_RETRIES - retries + 1} of ${MAX_RETRIES}`,
      );

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry with increased delay
      return fetchSpecWithRetry(
        url,
        options,
        retries - 1,
        delay * BACKOFF_FACTOR,
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Add more context to the error
    throw new Error(
      `Failed to fetch ${url} after ${MAX_RETRIES} retries: ${errorMessage}`,
    );
  }
}

/**
 * Format a Zod error into a human-readable string.
 */
export const formatZodError = (error: ZodError): string => {
  const [firstIssue] = error.errors;
  if (!firstIssue) {
    return error.message;
  }
  const errorMessage = firstIssue.message;

  const path = firstIssue.path.join(".");

  switch (firstIssue.code) {
    case "invalid_type": {
      const expected = firstIssue.expected;
      const received = firstIssue.received;

      if (received === "undefined") {
        if (!path) {
          return "OpenAPI validation error.  Please check your OpenAPI spec for errors.";
        }
        return `Missing field ${path} expected ${expected}`;
      }
      return `Invalid type. Expected ${path} ${expected}, received ${received}`;
    }
    default:
      return `${errorMessage} ${path ? `for ${path}` : ""}`;
  }
};

/**
 * Format a single OpenAPI error into a human-readable string.
 */
export const formatOpenAPIError = (error: ErrorObject): string => {
  return `${error.code || "OPENAPI_ERROR"} ${error.message}`;
};

/**
 * Format a list of OpenAPI errors into a human-readable string.
 */
export const formatOpenAPIErrors = (errors: ErrorObject[]): string => {
  return errors.map((error) => formatOpenAPIError(error)).join("\n");
};
