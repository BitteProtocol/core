import * as chains from "viem/chains";

export const getShortDateTime = (): string => {
  return new Date().toISOString().slice(0, 16);
};

type Chain = chains.Chain;

const CHAINS_BY_CHAIN_ID = Object.fromEntries(
  Object.values(chains).map((chain) => [chain.id, chain]),
);

export function getChainById(chainId: number): Chain {
  const chain = CHAINS_BY_CHAIN_ID[chainId];
  if (!chain) {
    throw new Error(`Could not find chain with ID: ${chainId}`);
  }
  return chain;
}
