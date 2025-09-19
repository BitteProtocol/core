import type { Address, Hex } from "viem";

export interface TokenInfo {
  address: Address;
  decimals: number;
  symbol: string;
  name: string;
}

export interface MetaTransaction {
  to: Address;
  data: Hex;
  value: Hex;
  from?: Address;
}
export interface EthSendTransactionRequest {
  method: "eth_sendTransaction";
  chainId: number;
  params: MetaTransaction[];
}
export interface PersonalSignRequest {
  method: "personal_sign";
  chainId: number;
  params: [Hex, Address];
}
export interface EthSignRequest {
  method: "eth_sign";
  chainId: number;
  params: [Address, Hex];
}
export interface EthSignTypedDataRequest {
  method: "eth_signTypedData" | "eth_signTypedData_v4";
  chainId: number;
  params: [Address, string];
}
export type SignRequest =
  | EthSendTransactionRequest
  | PersonalSignRequest
  | EthSignRequest
  | EthSignTypedDataRequest;
