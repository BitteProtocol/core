import { erc20Abi, zeroAddress } from "viem";
import { encodeFunctionData, type Address } from "viem";
import type { MetaTransaction } from "@bitte-ai/types";
import type { TokenInfo } from "./types";
import { getClientForChain } from "./client";

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
    from: zeroAddress,
    to: token,
    value: "0x00",
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
    from: zeroAddress,
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
  return getClientForChain(chainId).readContract({
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
  if (address.toLowerCase() === NATIVE_ASSET.toLowerCase()) {
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
  const client = getClientForChain(chainId);
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
  const client = getClientForChain(chainId);
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
