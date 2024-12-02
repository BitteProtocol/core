import { erc20Abi } from "viem";
import { encodeFunctionData, type Address } from "viem";
import { signRequestFor } from "..";
import { getClient, type SignRequestData } from "near-safe";
import type { TokenInfo } from "./types";

const MAX_APPROVAL = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);

export async function erc20Transfer(params: {
  chainId: number;
  token: Address;
  to: Address;
  amount: bigint;
}): Promise<SignRequestData> {
  const { chainId, token, to, amount } = params;
  return signRequestFor({
    chainId,
    metaTransactions: [
      {
        to: token,
        value: "0x",
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [to, amount],
        }),
      },
    ],
  });
}

export async function erc20Approve(params: {
  chainId: number;
  token: Address;
  spender: Address;
  // If not provided, the maximum amount will be approved.
  amount?: bigint;
}): Promise<SignRequestData> {
  const { chainId, token, spender, amount } = params;
  return signRequestFor({
    chainId,
    metaTransactions: [
      {
        to: token,
        value: "0x",
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, amount ?? MAX_APPROVAL],
        }),
      },
    ],
  });
}

export async function checkAllowance(
  owner: Address,
  token: Address,
  spender: Address,
  chainId: number,
): Promise<bigint> {
  return getClient(chainId).readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender],
  });
}

export async function getTokenInfo(
  chainId: number,
  address: Address,
): Promise<TokenInfo> {
  const [decimals, symbol] = await Promise.all([
    getTokenDecimals(chainId, address),
    getTokenSymbol(chainId, address),
  ]);
  return {
    decimals,
    symbol,
  };
}

export async function getTokenDecimals(
  chainId: number,
  address: Address,
): Promise<number> {
  const client = getClient(chainId);
  try {
    return await client.readContract({
      address,
      abi: erc20Abi,
      functionName: "decimals",
    });
  } catch (error: unknown) {
    throw new Error(`Error fetching token decimals: ${error}`);
  }
}

export async function getTokenSymbol(
  chainId: number,
  address: Address,
): Promise<string> {
  const client = getClient(chainId);
  try {
    return await client.readContract({
      address,
      abi: erc20Abi,
      functionName: "symbol",
    });
  } catch (error: unknown) {
    throw new Error(`Error fetching token decimals: ${error}`);
  }
}
