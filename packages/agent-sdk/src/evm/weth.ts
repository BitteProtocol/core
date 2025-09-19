import type { MetaTransaction } from "./types";
import {
  type Address,
  encodeFunctionData,
  getAddress,
  parseAbi,
  parseEther,
  toHex,
} from "viem";
import { CHAIN_INFO } from "./constants";
import { getChainById } from "./chain";

type WrappedAsset = {
  address: Address;
  symbol: string;
  scanUrl: string;
  decimals: number;
};

export function validateWethInput(params: URLSearchParams): {
  chainId: number;
  amount: bigint;
  nativeAsset: WrappedAsset;
} {
  const chainIdStr = params.get("chainId");
  const amountStr = params.get("amount");

  // Ensure required fields
  if (!chainIdStr) {
    throw new Error("Missing required parameter: chainId");
  }
  if (!amountStr) {
    throw new Error("Missing required parameter: amount");
  }

  // Validate chainId
  const chainId = parseInt(chainIdStr);
  if (isNaN(chainId)) {
    throw new Error("Invalid chainId, must be a number");
  }

  // Validate amount
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount, must be a positive float");
  }

  return {
    chainId,
    amount: parseEther(amount.toString()),
    nativeAsset: getNativeAsset(chainId),
  };
}

export const unwrapMetaTransaction = (
  chainId: number,
  amount: bigint,
): MetaTransaction => {
  return {
    to: getNativeAsset(chainId).address,
    value: "0x0",
    data: encodeFunctionData({
      abi: parseAbi(["function withdraw(uint wad)"]),
      functionName: "withdraw",
      args: [amount],
    }),
  };
};

export const wrapMetaTransaction = (
  chainId: number,
  amount: bigint,
): MetaTransaction => {
  return {
    to: getNativeAsset(chainId).address,
    value: toHex(amount),
    // methodId for weth.deposit
    data: "0xd0e30db0",
  };
};

export function getNativeAsset(chainId: number): WrappedAsset {
  const wethAddress = CHAIN_INFO[chainId];
  if (!wethAddress) {
    throw new Error(`Couldn't find wrapped address for chainId=${chainId}`);
  }
  const chain = getChainById(chainId);
  return {
    address: getAddress(wethAddress),
    symbol: chain.nativeCurrency.symbol,
    scanUrl: `${chain.blockExplorers?.default.url}/address/${wethAddress}`,
    decimals: chain.nativeCurrency.decimals,
  };
}
