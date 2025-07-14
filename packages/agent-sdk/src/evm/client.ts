import { createPublicClient, http, PublicClient } from "viem";
import * as chains from "viem/chains";

type Chain = chains.Chain;

const CHAINS_BY_CHAIN_ID = Object.fromEntries(
  Object.values(chains).map((chain) => [chain.id, chain]),
);

const getChainById = (chainId: number): Chain | undefined => {
  return CHAINS_BY_CHAIN_ID[chainId];
};

export function getClientForChain(
  chainId: number,
  alchemyKey?: string,
): PublicClient {
  if (alchemyKey) {
    const alchemyClient = getAlchemyClient(chainId, alchemyKey);
    if (alchemyClient) {
      return alchemyClient;
    }
  }
  const chain = getChainById(chainId);
  if (!chain) {
    throw new Error(`Chain with ID ${chainId} not found`);
  }
  return createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
}

// Alchemy RPC endpoints for different chains
const ALCHEMY_RPC_ENDPOINTS: Record<number, string> = {
  1: "https://eth-mainnet.g.alchemy.com/v2",
  10: "https://opt-mainnet.g.alchemy.com/v2",
  56: "https://bsc-mainnet.g.alchemy.com/v2",
  137: "https://polygon-mainnet.g.alchemy.com/v2",
  1868: "https://soneium-mainnet.g.alchemy.com/v2",
  8453: "https://base-mainnet.g.alchemy.com/v2",
  42161: "https://arb-mainnet.g.alchemy.com/v2",
  42220: "https://celo-mainnet.g.alchemy.com/v2",
  43114: "https://avax-mainnet.g.alchemy.com/v2",
  81457: "https://blast-mainnet.g.alchemy.com/v2",
};

export const getAlchemyClient = (
  chainId: number,
  alchemyKey: string,
): PublicClient | undefined => {
  const alchemyRpcBase = ALCHEMY_RPC_ENDPOINTS[chainId];
  if (alchemyRpcBase) {
    return createPublicClient({
      chain: getChainById(chainId),
      transport: http(`${alchemyRpcBase}/${alchemyKey}`),
    });
  }
  console.warn("No Alchemy Base URL available");
};
