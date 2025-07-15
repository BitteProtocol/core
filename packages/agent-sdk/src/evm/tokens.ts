import { isAddress, PublicClient } from "viem";
import { getTokenInfo } from "./erc20";
import { type TokenInfo } from "./types";

type SymbolMapping = Record<string, TokenInfo | undefined>;
type ChainId = number;
export type BlockchainMapping = Record<ChainId, SymbolMapping>;

const TOKEN_MAP_BASE_URL =
  "https://raw.githubusercontent.com/BitteProtocol/core/main/public";

let loadedSymbolMap: SymbolMapping | null = null;

export async function loadSymbolMap(url: string): Promise<SymbolMapping> {
  if (loadedSymbolMap) {
    return loadedSymbolMap;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load tokens at: ${response.statusText}`);
    }
    loadedSymbolMap = await response.json();
    return loadedSymbolMap as SymbolMapping;
  } catch (error) {
    console.error("Error loading symbolMap:", error);
    throw error;
  }
}
const defaultChainList = [1, 10, 56, 100, 137, 1868, 8453, 4261, 43114];

function tokenMapUrl(
  chainId: number,
  baseUrl: string = TOKEN_MAP_BASE_URL,
): string {
  return `${baseUrl}/tokens_${chainId}.json`;
}

export async function loadTokenMap(
  chainIds: number[] = defaultChainList,
): Promise<BlockchainMapping> {
  const mapping: BlockchainMapping = {};
  await Promise.all(
    chainIds.map(async (chainId) => {
      try {
        mapping[chainId] = await loadSymbolMap(tokenMapUrl(chainId));
      } catch (error) {
        console.error(`Error loading token map for chain ${chainId}:`, error);
        mapping[chainId] = {};
      }
    }),
  );
  return mapping;
}

export async function getTokenDetails(
  chainId: number,
  symbolOrAddress: string,
  tokenMap?: BlockchainMapping,
  // Optionally Provide your own RPC.
  client?: PublicClient,
): Promise<TokenInfo | undefined> {
  if (isAddress(symbolOrAddress, { strict: false })) {
    return getTokenInfo(chainId, symbolOrAddress, client);
  }

  if (!tokenMap) {
    const symbolMap = await loadSymbolMap(tokenMapUrl(chainId));
    return symbolMap[symbolOrAddress.toLowerCase()];
  }
  // TokenMap has lower cased (sanitized) symbols
  return tokenMap[chainId][symbolOrAddress.toLowerCase()];
}
