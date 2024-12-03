import { isAddress } from "viem";
import { getTokenInfo } from "./erc20";
import { type TokenInfo } from "./types";

type SymbolMapping = Record<string, TokenInfo>;
type ChainId = number;
export type BlockchainMapping = Record<ChainId, SymbolMapping>;

const TOKEN_MAP_URL =
  "https://raw.githubusercontent.com/BitteProtocol/core/main/public/tokenMap.json";

// Add a variable to store the loaded token map
let loadedTokenMap: BlockchainMapping | null = null;

export async function loadTokenMap(): Promise<BlockchainMapping> {
  if (loadedTokenMap) {
    return loadedTokenMap;
  }

  try {
    const response = await fetch(TOKEN_MAP_URL);
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
): Promise<TokenInfo> {
  if (!tokenMap) {
    console.log(
      "Loading TokenMap... this should be stored in memory consider setting it with loadTokenMap() in your app and passing it here.",
    );
    tokenMap = await loadTokenMap();
  }
  if (isAddress(symbolOrAddress, { strict: false })) {
    return getTokenInfo(chainId, symbolOrAddress);
  }
  console.log("Seeking TokenMap for Symbol", symbolOrAddress);
  // TokenMap has lower cased (sanitized) symbols
  return tokenMap[chainId][symbolOrAddress.toLowerCase()];
}
