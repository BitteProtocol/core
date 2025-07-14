import { isAddress, PublicClient } from "viem";
import { getTokenInfo } from "./erc20";
import { type TokenInfo } from "./types";

type SymbolMapping = Record<string, TokenInfo | undefined>;
type ChainId = number;
export type BlockchainMapping = Record<ChainId, SymbolMapping>;

const TOKEN_MAP_URL =
  "https://raw.githubusercontent.com/BitteProtocol/core/main/public/tokenMap.json";

// Add a variable to store the loaded token map
let loadedTokenMap: BlockchainMapping | null = null;

export async function loadTokenMap(
  url: string = TOKEN_MAP_URL,
): Promise<BlockchainMapping> {
  if (loadedTokenMap) {
    return loadedTokenMap;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load tokenMap.json: ${response.statusText}`);
    }
    loadedTokenMap = await response.json();
    return loadedTokenMap as BlockchainMapping;
  } catch (error) {
    console.error("Error loading tokenMap:", error);
    throw error;
  }
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
    tokenMap = await loadTokenMap();
  }
  // TokenMap has lower cased (sanitized) symbols
  return tokenMap[chainId][symbolOrAddress.toLowerCase()];
}
