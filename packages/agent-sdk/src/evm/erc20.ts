import { erc20Abi } from "viem";
import { encodeFunctionData, type Address } from "viem";
import { getClient, type MetaTransaction } from "near-safe";
import type { TokenInfo } from "./types";

const NATIVE_ASSET = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const MAX_APPROVAL = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);

export function erc20Transfer(params: {
  token: Address;
  to: Address;
  amount: bigint;
}): MetaTransaction {
  const { token, to, amount } = params;
  return {
    to: token,
    value: "0x0",
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, amount],
    }),
  };
}

export function erc20Approve(params: {
  token: Address;
  spender: Address;
  // If not provided, the maximum amount will be approved.
  amount?: bigint;
}): MetaTransaction {
  const { token, spender, amount } = params;
  return {
    to: token,
    value: "0x0",
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount ?? MAX_APPROVAL],
    }),
  };
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
  if (address === NATIVE_ASSET) {
    return {
      address: NATIVE_ASSET,
      decimals: 18,
      // Not all Native Assets are ETH, but enough are.
      symbol: "ETH",
    };
  }

  const [decimals, symbol] = await Promise.all([
    getTokenDecimals(chainId, address),
    getTokenSymbol(chainId, address),
  ]);
  return {
    address,
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
