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
  100: "https://gnosis-mainnet.g.alchemy.com/v2",
  130: "https://unichain-mainnet.g.alchemy.com/v2",
  137: "https://polygon-mainnet.g.alchemy.com/v2",
  146: "https://sonic-mainnet.g.alchemy.com/v2",
  232: "https://lens-mainnet.g.alchemy.com/v2",
  250: "https://fantom-mainnet.g.alchemy.com/v2",
  252: "https://frax-mainnet.g.alchemy.com/v2",
  592: "https://astar-mainnet.g.alchemy.com/v2",
  1868: "https://soneium-mainnet.g.alchemy.com/v2",
  8453: "https://base-mainnet.g.alchemy.com/v2",
  42161: "https://arb-mainnet.g.alchemy.com/v2",
  42220: "https://celo-mainnet.g.alchemy.com/v2",
  43114: "https://avax-mainnet.g.alchemy.com/v2",
  59144: "https://linea-mainnet.g.alchemy.com/v2",
  80094: "https://berachain-mainnet.g.alchemy.com/v2",
  81457: "https://blast-mainnet.g.alchemy.com/v2",
  7777777: "https://zora-mainnet.g.alchemy.com/v2",
  // Testnets
  10200: "https://gnosis-chiado.g.alchemy.com/v2/",
  84532: "https://base-sepolia.g.alchemy.com/v2/",
  11155111: "https://eth-sepolia.g.alchemy.com/v2/",
  11155420: "https://opt-sepolia.g.alchemy.com/v2/",
};

export function getAlchemyClient(
  chainId: number,
  alchemyKey: string,
): PublicClient | undefined {
  const alchemyRpcBase = ALCHEMY_RPC_ENDPOINTS[chainId];
  if (alchemyRpcBase) {
    return createPublicClient({
      chain: getChainById(chainId),
      transport: http(`${alchemyRpcBase}/${alchemyKey}`),
    });
  }
  console.warn("No Alchemy Base URL available");
}
