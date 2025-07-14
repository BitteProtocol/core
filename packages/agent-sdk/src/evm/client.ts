import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  soneiumMainnet,
} from "@account-kit/infra";
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

const ALCHEMY_CHAINS = [
  mainnet,
  base,
  polygon,
  arbitrum,
  optimism,
  soneiumMainnet,
];

export const getAlchemyClient = (
  chainId: number,
  alchemyKey: string,
): PublicClient | undefined => {
  const alchemyChain = ALCHEMY_CHAINS.find((c) => c.id === chainId);
  const alchemyRpcBase = alchemyChain?.rpcUrls?.alchemy?.http?.[0];
  if (alchemyRpcBase) {
    return createPublicClient({
      transport: http(`${alchemyRpcBase}/${alchemyKey}`),
    });
  }
  console.warn("No Alchemy Base URL available");
};
