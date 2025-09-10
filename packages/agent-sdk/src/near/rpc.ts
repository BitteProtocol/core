import { Account, providers } from "near-api-js";

export interface RpcParams {
  rpcUrl?: string;
}

export interface AccountParams extends RpcParams {
  accountId: string;
}
export interface FTParams extends AccountParams {
  contractId: string;
}

export async function getBalance({
  accountId,
  rpcUrl,
}: AccountParams): Promise<bigint> {
  const provider = new providers.JsonRpcProvider({
    url: rpcUrl || "https://rpc.mainnet.near.org",
  });
  const account = new Account(accountId, provider);
  const { balance } = await account.getState();
  return balance.available;
}

export async function ftBalance({
  contractId,
  accountId,
  rpcUrl,
}: FTParams): Promise<string> {
  const provider = new providers.JsonRpcProvider({
    url: rpcUrl || "https://rpc.mainnet.near.org",
  });
  const result = await provider.callFunction<string>(
    contractId,
    "ft_balance_of",
    { account_id: accountId },
  );
  if (!result) {
    throw new Error(
      `Could not read ftBalance of ${accountId} for ${contractId}`,
    );
  }
  return result;
}

export async function ftStorageBalance({
  contractId,
  accountId,
  rpcUrl,
}: FTParams): Promise<string | null> {
  const provider = new providers.JsonRpcProvider({
    url: rpcUrl || "https://rpc.mainnet.near.org",
  });
  try {
    const result = await provider.callFunction<string>(
      contractId,
      "storage_balance_of",
      { account_id: accountId },
    );
    return result || null;
  } catch (err) {
    console.warn(
      `Could not read ftBalance of ${accountId} for ${contractId}: ${(err as Error).message}`,
    );
    return null;
  }
}
