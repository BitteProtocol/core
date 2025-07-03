const CHAIN_MAPPING: Record<number, string> = {
  1: "ethereum",
  10: "optimism",
  56: "bsc",
  137: "polygon",
  42161: "arbitrum",
  43114: "avax",
  100: "xdai",
  8453: "base",
};

export async function getTokenPrice(
  chainId: number,
  tokenAddress: string,
): Promise<number | null> {
  const platform = CHAIN_MAPPING[chainId];
  if (!platform) throw new Error(`Unsupported chainId: ${chainId}`);

  const url = `https://coins.llama.fi/prices/current/${platform}:${tokenAddress}`;
  const res = await fetch(url);
  const data = await res.json();

  const key = `${platform}:${tokenAddress.toLowerCase()}`;
  return data.coins?.[key]?.price ?? null;
}
