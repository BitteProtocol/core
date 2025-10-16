import { z } from "zod";

type Logger = (...args: unknown[]) => void;

export type ValidationResult<T> =
  | { ok: true; query: T }
  | { ok: false; error: object };

export function validateQuery<T extends z.ZodType>(
  req: {
    // url used for GET requests.
    url: string;
    // TODO: Parse Body.
  },
  schema: T,
  opts: {
    log?: Logger;
  } = {},
): ValidationResult<z.infer<T>> {
  const log = opts.log ?? (() => {}); // default no-op
  log("Raw request", req.url);
  if (req.url.startsWith("/?")) {
    req.url = req.url.slice(2);
  }
  const params = new URLSearchParams(req.url);
  log("params", params);
  const result = schema.safeParse(Object.fromEntries(params.entries()));
  log("parsed query", result);
  if (!result.success) {
    return { ok: false as const, error: z.treeifyError(result.error) };
  }
  return { ok: true as const, query: result.data };
}

export function isInvalid<T>(
  result: ValidationResult<T>,
): result is { ok: false; error: object } {
  return result.ok === false;
}
