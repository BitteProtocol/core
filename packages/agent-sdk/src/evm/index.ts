import type { MetaTransaction, SignRequestData } from "near-safe";
import { NearSafe } from "near-safe";
import { getAddress, type Hex, zeroAddress, type Address } from "viem";

export * from "./types";
export * from "./erc20";
export * from "./weth";
export * from "./tokens";
export * from "./safe";

export function signRequestFor({
  from,
  chainId,
  metaTransactions,
}: {
  from?: Address;
  chainId: number;
  metaTransactions: MetaTransaction[];
}): SignRequestData {
  return {
    method: "eth_sendTransaction",
    chainId,
    params: metaTransactions.map((mt) => ({
      from: from ?? zeroAddress,
      to: getAddress(mt.to),
      value: mt.value as Hex,
      data: mt.data as Hex,
    })),
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

export async function getAdapterAddress(
  accountId: string,
  safeSaltNonce: string,
): Promise<Address> {
  const adapter = await NearSafe.create({
    mpc: {
      accountId,
      mpcContractId: accountId.includes(".testnet")
        ? "v1.signer-prod.testnet"
        : "v1.signer",
    },
    pimlicoKey: "", // This is a readonly adapter Instance!
    safeSaltNonce,
  });
  return getAddress(adapter.address);
}
