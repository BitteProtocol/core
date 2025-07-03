import { erc20Abi } from "viem";
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
    to: token,
    value: "0x00",
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

const NON_ETH_NATIVES: Record<number, { symbol: string; name: string }> = {
  100: { symbol: "xDAI", name: "xDAI" },
  137: { symbol: "MATIC", name: "MATIC" },
  43114: { symbol: "AVAX", name: "AVAX" },
};

const ETHER_NATIVE = {
  decimals: 18,
  // Not all Native Assets are ETH, but enough are.
  symbol: "ETH",
  name: "Ether",
};

export async function getTokenInfo(
  chainId: number,
  address?: Address,
): Promise<TokenInfo> {
  if (!address || address.toLowerCase() === NATIVE_ASSET.toLowerCase()) {
    const native = NON_ETH_NATIVES[chainId] || ETHER_NATIVE;
    return {
      address: NATIVE_ASSET,
      decimals: 18,
      ...native,
    };
  }
  const client = getClientForChain(chainId);
  const [decimals, symbol, name] = await client.multicall({
    contracts: [
      {
        abi: erc20Abi,
        address,
        functionName: "decimals",
      },
      {
        abi: erc20Abi,
        address,
        functionName: "symbol",
      },
      {
        abi: erc20Abi,
        address,
        functionName: "name",
      },
    ],
  });
  if (decimals.error || symbol.error || name.error) {
    throw new Error("Failed to get token info");
  }

  return {
    address,
    decimals: decimals.result,
    symbol: symbol.result,
    name: name.result,
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

export async function getTokenName(
  chainId: number,
  address: Address,
): Promise<string> {
  const client = getClientForChain(chainId);
  try {
    return await client.readContract({
      address,
      abi: erc20Abi,
      functionName: "name",
    });
  } catch (error: unknown) {
    throw new Error(`Error fetching token name: ${error}`);
  }
}
