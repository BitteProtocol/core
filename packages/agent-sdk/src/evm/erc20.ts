import { erc20Abi, PublicClient } from "viem";
import { encodeFunctionData, type Address } from "viem";
import type { TokenInfo, MetaTransaction } from "./types";
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
  chainId: number,
  owner: Address,
  token: Address,
  spender: Address,
  client?: PublicClient,
): Promise<bigint> {
  let rpc = client || getClientForChain(chainId);
  return rpc.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender],
  });
}

// const NON_ETH_NATIVES: Record<number, { symbol: string; name: string }> = {
//   100: { symbol: "xDAI", name: "xDAI" },
//   137: { symbol: "MATIC", name: "MATIC" },
//   43114: { symbol: "AVAX", name: "AVAX" },
// };

// const ETHER_NATIVE = {
//   decimals: 18,
//   // Not all Native Assets are ETH, but enough are.
//   symbol: "ETH",
//   name: "Ether",
// };

export async function getTokenInfo(
  chainId: number,
  address?: Address,
  client?: PublicClient,
): Promise<TokenInfo> {
  let rpc = client || getClientForChain(chainId);
  if (!address || address.toLowerCase() === NATIVE_ASSET.toLowerCase()) {
    const chainId = rpc.chain?.id;
    return {
      address: NATIVE_ASSET,
      decimals: 18,
      symbol: `Unknown Native Symbol chainId=${chainId}`,
      name: "Unknown Native Name",
      ...rpc.chain?.nativeCurrency,
    };
  }
  const [decimals, symbol, name] = await rpc.multicall({
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
    console.error(decimals, symbol, name);
    throw new Error("Failed to get token info");
  }
  return {
    address,
    decimals: decimals.result,
    symbol: symbol.result,
    name: name.result,
  };
}
