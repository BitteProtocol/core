import { type Address, checksumAddress, parseUnits } from "viem";
import { type UserToken, ZerionAPI } from "zerion-sdk";

export interface TokenBalance {
  tokenAddress: string | null; // null for native token
  token: {
    name: string;
    symbol: string;
    decimals: number;
    logoUri: string;
  } | null;
  balance: string;
  fiatBalance: string;
  fiatConversion: string;
}

const SAFE_NETWORKS: { [chainId: number]: string } = {
  1: "mainnet",
  10: "optimism",
  56: "binance",
  100: "gnosis-chain",
  137: "polygon",
  8453: "base",
  42161: "arbitrum",
  43114: "avalanche",
  11155111: "sepolia",
};

export function safeTxServiceUrlFor(chainId: number): string | undefined {
  const network = SAFE_NETWORKS[chainId];
  if (!network) {
    console.warn(`Unsupported Safe Transaction Service chainId=${chainId}`);
    return undefined;
  }
  return `https://safe-transaction-${network}.safe.global`;
}

export type TokenBalanceMap = { [symbol: string]: TokenBalance };

interface BalancesResponse {
  balances: {
    token: string | null;
    balance: string;
    symbol: string | null;
    decimals: number;
    logoUri: string | null;
  }[];
}

export async function getSafeBalances(
  chainId: number,
  address: Address,
  zerionKey?: string,
): Promise<TokenBalance[]> {
  const baseUrl = safeTxServiceUrlFor(chainId);
  console.log(baseUrl);
  if (!baseUrl) {
    console.warn(
      `Chain ID ${chainId} not supported by Safe Transaction Service`,
    );
    return [];
  }
  const trusted = false; // Avalanche USDC not trusted: 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
  const exclude_spam = chainId === 11155111 ? false : true;
  const url = `${baseUrl}/api/v1/safes/${checksumAddress(address)}/balances/?trusted=${trusted}&exclude_spam=${exclude_spam}`;

  try {
    console.log(`Fetching Safe balances for ${address} from ${url}`);
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Safe not found for ${address}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: TokenBalance[] = await response.json();
    console.log(`Retrieved ${data.length} balances`);
    return data;
  } catch (error) {
    console.warn("Error fetching Safe balances:", error);
    return getZerionBalances(chainId, address, zerionKey);
  }
}

async function getZerionBalances(
  chainId: number,
  address: Address,
  zerionKey?: string,
): Promise<TokenBalance[]> {
  if (!zerionKey) {
    return [];
  }
  console.info("Zerion Key provided - using Zerion");
  // Not a Safe, try Zerion
  try {
    const zerion = new ZerionAPI(zerionKey);
    // TODO(bh2smith): This is not super efficient, but it works for now.
    // Zerion API has its own network filter (but its not by chainID).
    const balances = await zerion.ui.getUserBalances(address, {
      options: { supportedChains: [chainId] },
    });
    return zerionToTokenBalances(balances.tokens);
  } catch (error) {
    console.error("Error fetching Zerion balances:", error);
    return [];
  }
}

export async function flatSafeBalances(
  chainId: number,
  address: Address,
): Promise<BalancesResponse> {
  const balances = await getSafeBalances(chainId, address);
  // Flatten the balance Response
  return {
    balances: balances.map((b) => ({
      token: b.tokenAddress,
      balance: b.balance,
      symbol: b.token?.symbol || null,
      decimals: b.token?.decimals || 18,
      logoUri: b.token?.logoUri || null,
    })),
  };
}

// TODO(bh2smith): Move this into Zerion SDK
export function zerionToTokenBalance(userToken: UserToken): TokenBalance {
  const { meta, balances } = userToken;
  return {
    tokenAddress: meta.contractAddress || null,
    token: {
      name: meta.name,
      symbol: meta.symbol,
      decimals: meta.decimals,
      logoUri: meta.tokenIcon || "",
    },
    balance: parseUnits(balances.balance.toFixed(), meta.decimals).toString(), // Convert number to string
    fiatBalance: balances.usdBalance.toFixed(2),
    fiatConversion: (balances.price || 0).toFixed(2),
  };
}

// Helper function to convert array of UserTokens to TokenBalances
export function zerionToTokenBalances(userTokens: UserToken[]): TokenBalance[] {
  return userTokens
    .filter((token) => !token.meta.isSpam) // Filter out spam tokens
    .map(zerionToTokenBalance);
}
