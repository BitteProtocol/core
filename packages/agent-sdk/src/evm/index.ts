import { getAddress, isHex, toHex, toBytes, zeroAddress } from "viem";
import type { SignRequest, MetaTransaction } from "./types";
import type { Address, Hex } from "viem";

export * from "./types";
export * from "./erc20";
export * from "./weth";
export * from "./tokens";
export * from "./safe";
export * from "./chain";
export * from "./client";

export function hexifyValue(value: string): Hex {
  if (isHex(value)) {
    return value;
  }
  return toHex(toBytes(BigInt(value)));
}

export function signRequestFor({
  from,
  chainId,
  metaTransactions,
}: {
  from?: Address;
  chainId: number;
  metaTransactions: MetaTransaction[];
}): SignRequest {
  return {
    method: "eth_sendTransaction",
    chainId,
    params: metaTransactions.map((mt) => {
      return {
        from: from ?? zeroAddress,
        to: getAddress(mt.to),
        value: hexifyValue(mt.value),
        data: mt.data as Hex,
      };
    }),
  };
}

// Generic type that defines the minimum requirements
export interface BaseRequest {
  headers: {
    get(name: string): string | null;
  };
}

export interface BaseResponse {
  json(data: unknown, init?: { status?: number }): unknown;
}

export function fallbackResponder(
  responseData: object,
  init?: { status?: number },
): BaseResponse {
  return {
    json: (_data, responseInit) => ({
      data: responseData,
      ...init,
      ...responseInit,
    }),
  };
}

export async function validateRequest<
  TRequest extends BaseRequest,
  TResponse extends BaseResponse,
>(
  req: TRequest,
  responder?: (data: object, init?: { status?: number }) => TResponse,
): Promise<TResponse | null> {
  const createResponse = responder ? responder : fallbackResponder;
  const metadataHeader = req.headers.get("mb-metadata");
  const metadata = JSON.parse(metadataHeader ?? "{}");
  const { accountId, evmAddress } = metadata;
  if (!accountId && !evmAddress) {
    const error = "Missing accountId and evmAddress in metadata";
    console.error(error);
    return createResponse({ error }, { status: 400 }) as TResponse;
  }

  return null;
}
