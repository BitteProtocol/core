export function errorString(error: unknown): string {
  // intentional == to check for null or undefined
  if (error == null) {
    return `unknown error: ${error}`;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}
