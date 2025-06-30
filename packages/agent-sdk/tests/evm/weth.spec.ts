import { Network } from "near-safe";
import { parseEther, zeroAddress } from "viem";
import {
  validateWethInput,
  getNativeAsset,
  unwrapMetaTransaction,
  wrapMetaTransaction,
} from "../../src/evm/weth";

// Mock the external dependencies
jest.mock("../../src", () => ({
  signRequestFor: jest.fn().mockImplementation((args) => args),
}));

describe("evm/weth", () => {
  // Existing tests
  it("unwrapMetaTransaction", async () => {
    expect(unwrapMetaTransaction(100, 25n)).toStrictEqual({
      from: zeroAddress,
      to: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
      value: "0x0",
      data: "0x2e1a7d4d0000000000000000000000000000000000000000000000000000000000000019",
    });
  });

  it("wrapMetaTransaction", async () => {
    expect(wrapMetaTransaction(100, 25n)).toStrictEqual({
      from: zeroAddress,
      to: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
      value: "0x19",
      data: "0xd0e30db0",
    });
  });

  // New tests
  describe("validateWethInput", () => {
    it("validates correct input parameters", () => {
      const params = new URLSearchParams({
        chainId: "100",
        amount: "1.5",
      });

      const result = validateWethInput(params);
      expect(result).toEqual({
        chainId: 100,
        amount: parseEther("1.5"),
        nativeAsset: expect.objectContaining({
          address: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
          symbol: "XDAI",
          decimals: 18,
        }),
      });
    });

    it("throws error for missing chainId", () => {
      const params = new URLSearchParams({
        amount: "1.5",
      });

      expect(() => validateWethInput(params)).toThrow(
        "Missing required parameter: chainId",
      );
    });

    it("throws error for missing amount", () => {
      const params = new URLSearchParams({
        chainId: "100",
      });

      expect(() => validateWethInput(params)).toThrow(
        "Missing required parameter: amount",
      );
    });

    it("throws error for invalid chainId", () => {
      const params = new URLSearchParams({
        chainId: "invalid",
        amount: "1.5",
      });

      expect(() => validateWethInput(params)).toThrow(
        "Invalid chainId, must be a number",
      );
    });

    it("throws error for invalid amount", () => {
      const params = new URLSearchParams({
        chainId: "100",
        amount: "-1.5",
      });

      expect(() => validateWethInput(params)).toThrow(
        "Invalid amount, must be a positive float",
      );
    });
  });

  describe("getNativeAsset", () => {
    it("returns correct native asset info for known/gnosis chain", () => {
      const result = getNativeAsset(100);

      expect(result).toEqual({
        address: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
        symbol: "XDAI",
        scanUrl:
          "https://gnosisscan.io/address/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
        decimals: 18,
      });
    });

    it("returns correct native asset info for Avalanche chain", () => {
      const result = getNativeAsset(43114);
      const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
      expect(result).toEqual({
        address: WAVAX,
        symbol: "AVAX",
        scanUrl: `https://snowtrace.io/address/${WAVAX}`,
        decimals: 18,
      });
    });

    it("throws error for chain without wrapped address", () => {
      // Mock a network without wrapped address
      jest.spyOn(Network, "fromChainId").mockImplementationOnce(
        () =>
          ({
            name: "TestNet",
            nativeCurrency: {
              wrappedAddress: null,
              symbol: "TEST",
              decimals: 18,
            },
          }) as unknown as Network,
      );

      expect(() => getNativeAsset(999)).toThrow(
        "Couldn't find wrapped address for Network TestNet (chainId=999)",
      );
    });
  });
});
