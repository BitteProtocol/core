import { type Address } from "viem";

export interface TokenInfo {
  address: Address;
  decimals: number;
  symbol: string;
}
