import { getAddress, parseAbi, Address, erc20Abi, formatUnits } from "viem";
import { getClientForChain } from "../evm/client";
import { computePoolAddress, FeeAmount } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { getTokenInfo } from "../evm";

// Constants
export const FACTORY_ADDRESSES: Record<number, Address> = {
  // Ethereum Mainnet
  1: getAddress("0x1F98431c8aD98523631AE4a59f267346ea31F984"),

  // Arbitrum
  42161: getAddress("0x1F98431c8aD98523631AE4a59f267346ea31F984"),

  // Optimism
  10: getAddress("0x1F98431c8aD98523631AE4a59f267346ea31F984"),

  // Polygon
  137: getAddress("0x1F98431c8aD98523631AE4a59f267346ea31F984"),

  // Base
  8453: getAddress("0x33128a8fC17869897dcE68Ed026d694621f6FDfD"),

  // Avalanche
  43114: getAddress("0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD"),

  // BNB Chain (Uniswap V3 is deployed here)
  56: getAddress("0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7"),

  // Gnosis — Uniswap V3 not officially deployed (check CowSwap or Swapr alternatives)
  // 100: undefined,
};
const FEE = FeeAmount.MEDIUM; // Most Common Fee: 0.3%

export const CHAIN_STABLES: Record<number, Token> = {
  // Ethereum Mainnet - USDC
  1: new Token(
    1,
    getAddress("0xA0b86991C6218B36c1d19D4a2e9Eb0cE3606eB48"),
    6,
    "USDC",
  ),

  // Optimism - USDC.e (bridged), or USDC (native) from Circle (check which is in the pool)
  10: new Token(
    10,
    getAddress("0x7F5c764cBc14f9669B88837ca1490cCa17c31607"),
    6,
    "USDC.e",
  ),

  // Arbitrum - USDC.e (bridged), or USDC (native)
  42161: new Token(
    42161,
    getAddress("0xFF970A61A04b1cA14834A43f5de4533eBDDB5CC8"),
    6,
    "USDC.e",
  ),

  // Polygon - USDC
  137: new Token(
    137,
    getAddress("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"),
    6,
    "USDC.e",
  ),

  // Base - USDC (native)
  8453: new Token(
    8453,
    getAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
    6,
    "USDC",
  ),

  // // Gnosis - XDAI (native stable)
  // 100: getAddress("0xE91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"),

  // Avalanche - USDC.e
  43114: new Token(
    43114,
    getAddress("0xA7D7079b0FEAD91F3e65f86E8915Cb59c1a4C664"),
    6,
    "USDC.e",
  ),

  // // BNB Chain - BUSD (deprecated), prefer USDT or USDC now
  // 56: getAddress("0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"), // USDC

  // // Fantom - USDC
  // 250: getAddress("0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"),
};

export async function getToken(
  chainId: number,
  address: Address,
): Promise<Token> {
  const { decimals, symbol, name } = await getTokenInfo(chainId, address);

  return new Token(chainId, address, decimals, symbol, name);
}

export async function getPoolAddress(
  chainId: number,
  tokenA: Token,
  tokenB: Token,
  fee: number = FEE,
): Promise<Address> {
  const factoryAddress = FACTORY_ADDRESSES[chainId];
  if (!factoryAddress) {
    throw new Error("No UniV3 Factory Supplied");
  }
  const poolAddress = getAddress(
    computePoolAddress({
      factoryAddress,
      tokenA,
      tokenB,
      fee,
    }),
  );

  const poolCode = await getClientForChain(chainId).getCode({
    address: poolAddress,
  });
  if (!poolCode) {
    throw new Error(`No code found at Pool Address ${poolAddress}`);
  }
  console.log(
    `Pool Address for ${tokenA.symbol}<>${tokenB.symbol}`,
    poolAddress,
  );
  return poolAddress;
}

export async function getTokenPrice(
  chainId: number,
  token: Address,
  poolFee: FeeAmount = FEE,
): Promise<number | null> {
  let targetToken = await getToken(chainId, token);
  let stableToken = CHAIN_STABLES[chainId];
  if (!stableToken) {
    throw new Error("No stable token provided for pair");
  }
  const [tokenA, tokenB] =
    targetToken < stableToken
      ? [targetToken, stableToken]
      : [stableToken, targetToken];
  const poolAddress = await getPoolAddress(chainId, tokenA, tokenB, poolFee);

  // Read slot0
  const poolAbi = parseAbi([
    "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)",
  ]);
  const client = getClientForChain(chainId);
  const [sqrtPriceX96] = await client.readContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: "slot0",
  });

  // Convert sqrtPriceX96 to price (Token/USD)
  const price =
    (Number(sqrtPriceX96) ** 2 / 2 ** 192) *
    10 ** (tokenA.decimals - tokenB.decimals);
  console.log(`${targetToken.symbol} Price: ${price} USD per Token`);
  const liquidity = await getPoolLiquidityUSD(
    chainId,
    poolAddress,
    stableToken,
  );
  if (liquidity < 1000) {
    console.warn("Low Liquidity detected, prices are weak", liquidity);
  }
  return price;
}

export async function getPoolLiquidityUSD(
  chainId: number,
  poolAddress: Address,
  token: Token,
  tokenPriceUsd: number = 1,
): Promise<number> {
  const client = getClientForChain(chainId);

  const balance = await client.readContract({
    address: token.address as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [poolAddress],
  });

  // You can price either of these from a trusted oracle (e.g., tokenB is USDC)
  const amount = Number(formatUnits(balance, token.decimals));

  // If tokenB is a stablecoin like USDC, you can assume 1 tokenB = $1
  return 2 * amount * tokenPriceUsd;
}
