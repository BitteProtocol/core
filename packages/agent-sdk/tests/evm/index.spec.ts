import { signRequestFor, createResponse, validateRequest } from "../../src/evm";
import { zeroAddress } from "viem";
import type { BaseRequest } from "../../src/evm";

// Mock external dependencies
jest.mock("viem", () => ({
  getAddress: jest.fn().mockImplementation((address) => address),
  zeroAddress: "0x0000000000000000000000000000000000000000",
}));

jest.mock("near-safe", () => ({
  NearSafe: {
    create: jest.fn().mockImplementation(async () => ({
      address: "0x123",
    })),
  },
}));

describe("evm/index", () => {
  describe("signRequestFor", () => {
    it("creates a sign request with default from address", () => {
      const metaTransactions = [{ to: "0x123", value: "0x0", data: "0xabc" }];

      const result = signRequestFor({
        chainId: 1,
        metaTransactions,
      });

      expect(result).toEqual({
        method: "eth_sendTransaction",
        chainId: 1,
        params: [
          {
            from: zeroAddress,
            to: "0x123",
            value: "0x0",
            data: "0xabc",
          },
        ],
      });
    });

    it("creates a sign request with specified from address", () => {
      const metaTransactions = [{ to: "0x123", value: "0x0", data: "0xabc" }];

      const result = signRequestFor({
        from: "0x456",
        chainId: 1,
        metaTransactions,
      });

      expect(result).toEqual({
        method: "eth_sendTransaction",
        chainId: 1,
        params: [
          {
            from: "0x456",
            to: "0x123",
            value: "0x0",
            data: "0xabc",
          },
        ],
      });
    });
  });

  describe("createResponse", () => {
    it("creates a response with default status", () => {
      const responseData = { message: "Success" };

      const response = createResponse(responseData);

      expect(response.json({}, {})).toEqual({
        data: responseData,
      });
    });

    it("creates a response with specified status", () => {
      const responseData = { message: "Error" };

      const response = createResponse(responseData, { status: 400 });
      expect(response.json({}, {})).toEqual({
        data: responseData,
        status: 400,
      });
    });
  });

  describe("validateRequest", () => {
    const mockAddress = "0x1111111111111111111111111111111111111111";
    const mockGetAdapterAddress = jest.fn();
    jest.mock("../../src/evm", () => ({
      ...jest.requireActual("../../src/evm"),
      getAdapterAddress: mockGetAdapterAddress,
    }));

    it("returns null for valid request", async () => {
      const req = {
        headers: {
          get: jest.fn().mockReturnValue(
            JSON.stringify({
              accountId: "testAccount",
              evmAddress: "0x123",
            }),
          ),
        },
      } as BaseRequest;

      mockGetAdapterAddress.mockResolvedValue("0x123");

      const result = await validateRequest(req, "safeSaltNonce");

      expect(result).toBeNull();
    });

    it("returns error response for missing accountId or evmAddress", async () => {
      const req = {
        headers: {
          get: jest.fn().mockReturnValue("{}"),
        },
      } as BaseRequest;

      const result = await validateRequest(req, "safeSaltNonce");

      expect(result).toEqual({
        json: expect.any(Function),
      });

      const jsonResponse = result?.json({}, {});
      expect(jsonResponse).toEqual({
        data: { error: "Missing accountId or evmAddress in metadata" },
        status: 400,
      });
    });

    it("returns error response for invalid safeAddress", async () => {
      const req = {
        headers: {
          get: jest.fn().mockReturnValue(
            JSON.stringify({
              accountId: "testAccount",
              evmAddress: mockAddress,
            }),
          ),
        },
      } as BaseRequest;

      mockGetAdapterAddress.mockResolvedValue(mockAddress);

      const result = await validateRequest(req, "0");
      expect(result).toEqual({
        json: expect.any(Function),
      });

      const jsonResponse = result?.json({}, {});
      expect(jsonResponse).toEqual({
        data: {
          error: `Invalid safeAddress in metadata: 0x123 !== ${mockAddress}`,
        },
        status: 401,
      });
    });
  });
});