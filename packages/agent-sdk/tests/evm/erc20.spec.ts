import { type Address, erc20Abi } from "viem";
import { getClient } from "near-safe";
import {
  erc20Transfer,
  erc20Approve,
  checkAllowance,
  getTokenInfo,
  getTokenDecimals,
  getTokenSymbol,
} from "../../src";

// Mock the external dependencies
jest.mock("near-safe");

describe("ERC20 Utilities", () => {
  const mockAddress = "0x1234567890123456789012345678901234567890" as Address;
  const mockChainId = 1;
  const mockAmount = 1000n;

  describe("erc20Transfer", () => {
    it("creates correct transfer transaction", async () => {
      const params = {
        token: mockAddress,
        to: mockAddress,
        amount: mockAmount,
      };

      const tx = await erc20Transfer(params);

      expect(tx).toEqual({
        data: "0xa9059cbb000000000000000000000000123456789012345678901234567890123456789000000000000000000000000000000000000000000000000000000000000003e8",
        to: "0x1234567890123456789012345678901234567890",
        value: "0x0",
      });
    });
  });

  describe("erc20Approve", () => {
    it("creates approval transaction with specific amount", async () => {
      const params = {
        token: mockAddress,
        spender: mockAddress,
        amount: mockAmount,
      };

      const tx = await erc20Approve(params);

      expect(tx).toEqual({
        data: "0x095ea7b3000000000000000000000000123456789012345678901234567890123456789000000000000000000000000000000000000000000000000000000000000003e8",
        to: "0x1234567890123456789012345678901234567890",
        value: "0x0",
      });
    });

    it("creates approval transaction with max amount when amount not specified", async () => {
      const params = {
        token: mockAddress,
        spender: mockAddress,
      };

      const tx = await erc20Approve(params);

      expect(tx).toEqual({
        data: "0x095ea7b30000000000000000000000001234567890123456789012345678901234567890ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        to: "0x1234567890123456789012345678901234567890",
        value: "0x0",
      });
    });
  });

  describe("checkAllowance", () => {
    it("reads allowance correctly", async () => {
      const mockClient = {
        readContract: jest.fn().mockResolvedValue(BigInt(1000)),
      };
      (getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await checkAllowance(
        mockAddress,
        mockAddress,
        mockAddress,
        mockChainId,
      );

      expect(result).toBe(BigInt(1000));
      expect(mockClient.readContract).toHaveBeenCalledWith({
        address: mockAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [mockAddress, mockAddress],
      });
    });
  });

  describe("getTokenInfo", () => {
    it("fetches token info correctly", async () => {
      const mockClient = {
        readContract: jest
          .fn()
          .mockResolvedValueOnce(18) // decimals
          .mockResolvedValueOnce("TEST"), // symbol
      };
      (getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await getTokenInfo(mockChainId, mockAddress);

      expect(result).toEqual({
        decimals: 18,
        symbol: "TEST",
      });
    });
  });

  describe("getTokenDecimals", () => {
    it("fetches decimals correctly", async () => {
      const mockClient = {
        readContract: jest.fn().mockResolvedValue(18),
      };
      (getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await getTokenDecimals(mockChainId, mockAddress);

      expect(result).toBe(18);
    });

    it("handles errors appropriately", async () => {
      const mockClient = {
        readContract: jest.fn().mockRejectedValue(new Error("Test error")),
      };
      (getClient as jest.Mock).mockReturnValue(mockClient);

      await expect(getTokenDecimals(mockChainId, mockAddress)).rejects.toThrow(
        "Error fetching token decimals: Error: Test error",
      );
    });
  });

  describe("getTokenSymbol", () => {
    it("fetches symbol correctly", async () => {
      const mockClient = {
        readContract: jest.fn().mockResolvedValue("TEST"),
      };
      (getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await getTokenSymbol(mockChainId, mockAddress);

      expect(result).toBe("TEST");
    });

    it("handles errors appropriately", async () => {
      const mockClient = {
        readContract: jest.fn().mockRejectedValue(new Error("Test error")),
      };
      (getClient as jest.Mock).mockReturnValue(mockClient);

      await expect(getTokenSymbol(mockChainId, mockAddress)).rejects.toThrow(
        "Error fetching token decimals: Error: Test error",
      );
    });
  });
});
