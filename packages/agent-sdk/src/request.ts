
import { SignRequestData } from "near-safe";
import { errorString } from "./error";

export interface TxData {
  transaction?: SignRequestData;
  meta?: unknown;
}

export async function handleRequest<X, T, R>(
  input: X,
  logic: (input: X) => Promise<T>,
  responseTransformer: (result: T | { meta: { message: string } }) => R,
): Promise<R> {
  try {
    const result = await logic(input);
    console.log("Responding with", JSON.stringify(result, null, 2));
    return responseTransformer(result);
  } catch (err: unknown) {
    const message = errorString(err);
    console.error(message);
    return responseTransformer({ meta: { message } });
  }
}
