import { isAddress } from "viem";
// TODO: Move outside of src folder.
import tokenMap from "./tokenMap.json";
import { getTokenInfo } from "./erc20";
import { type TokenInfo } from "./types";

type SymbolMapping = Record<string, TokenInfo>;
type ChainId = number;
export type BlockchainMapping = Record<ChainId, SymbolMapping>;

export async function getTokenDetails(
  chainId: number,
  symbolOrAddress: string,
): Promise<TokenInfo> {
  if (isAddress(symbolOrAddress, { strict: false })) {
    return getTokenInfo(chainId, symbolOrAddress);
  }
  console.log("Seeking TokenMap for Symbol", symbolOrAddress);
  return (tokenMap as BlockchainMapping)[chainId][
    // TokenMap has lower cased (sanitized) symbols
    symbolOrAddress.toLowerCase()
  ];
}
