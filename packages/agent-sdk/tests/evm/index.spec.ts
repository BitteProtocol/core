import {
  signRequestFor,
  fallbackResponder,
  validateRequest,
} from "../../src/evm";
import { getAddress, zeroAddress } from "viem";
import { NextRequest, NextResponse } from "next/server";
import type { BaseRequest } from "../../src/evm";

const address = (i: number): `0x${string}` =>
  getAddress(`0x${i.toString(16).padStart(40, "0")}`);

const to = address(123);
const from = address(456);

jest.mock("near-safe", () => ({
  NearSafe: {
    create: jest.fn().mockImplementation(async () => ({
      address: to,
    })),
  },
}));

describe("evm/index", () => {
  describe("signRequestFor", () => {
    it("creates a sign request with default from address", () => {
      const metaTransactions = [{ to, value: "0x00", data: "0xabc" }];

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
            to,
            value: "0x00",
            data: "0xabc",
          },
        ],
      });
    });

    it("creates a sign request with specified from address", () => {
      const metaTransactions = [{ to, value: "0x0", data: "0xabc" }];

      const result = signRequestFor({
        from,
        chainId: 1,
        metaTransactions,
      });

      expect(result).toEqual({
        method: "eth_sendTransaction",
        chainId: 1,
        params: [
          {
            from,
            to,
            value: "0x0",
            data: "0xabc",
          },
        ],
      });
    });
    it("parses Hex and non-hex value fields", () => {
      const hexValue = "0x0";
      const input = {
        chainId: 1,
        metaTransactions: [
          { to: address(123), value: hexValue, data: "0xabc" },
        ],
      };
      expect(signRequestFor(input).params).toEqual([
        {
          ...input.metaTransactions[0],
          from: zeroAddress,
        },
      ]);
      input.metaTransactions[0].value = "16";

      expect(signRequestFor(input).params).toEqual([
        {
          ...input.metaTransactions[0],
          from: zeroAddress,
          value: "0x10",
        },
      ]);
    });
  });

  describe("fallbackResponder", () => {
    it("creates a response with default status", () => {
      const responseData = { message: "Success" };

      const response = fallbackResponder(responseData);

      expect(response.json({}, {})).toEqual({
        data: responseData,
      });
    });

    it("creates a response with specified status", () => {
      const responseData = { message: "Error" };

      const response = fallbackResponder(responseData, { status: 400 });
      expect(response.json({}, {})).toEqual({
        data: responseData,
        status: 400,
      });
    });
  });

  describe("validateRequest", () => {
    it("returns error response for missing accountId and evmAddress", async () => {
      const req = {
        headers: {
          get: jest.fn().mockReturnValue("{}"),
        },
      } as BaseRequest;

      const result = await validateRequest(req);

      expect(result).toEqual({
        json: expect.any(Function),
      });

      const jsonResponse = result?.json({}, {});
      expect(jsonResponse).toEqual({
        data: { error: "Missing accountId and evmAddress in metadata" },
        status: 400,
      });
    });

    it("returns null for valid request with accountId", async () => {
      const req = {
        headers: {
          get: jest.fn().mockReturnValue(
            JSON.stringify({
              accountId: "testAccount",
            }),
          ),
        },
      } as BaseRequest;

      const result = await validateRequest(req);
      expect(result).toBeNull();
    });

    it("returns null for valid request with evmAddress", async () => {
      const req = {
        headers: {
          get: jest.fn().mockReturnValue(
            JSON.stringify({
              evmAddress: address(123),
            }),
          ),
        },
      } as BaseRequest;

      const result = await validateRequest(req);
      expect(result).toBeNull();
    });
  });

  describe("validateNextRequest", () => {
    it("should validate a real request", async () => {
      const request = new NextRequest(
        new Request("https://example.com", {
          method: "POST",
          headers: new Headers({
            "mb-metadata": JSON.stringify({
              accountId: "max-normal.near",
              evmAddress: zeroAddress,
            }),
          }),
          body: JSON.stringify({ test: "data" }),
        }),
      );

      const result = await validateNextRequest(request);
      expect(result).toBeNull();
    });
  });
});

// TODO: Use in Next Agents.
export async function validateNextRequest(
  req: NextRequest,
): Promise<NextResponse | null> {
  const result = await validateRequest<NextRequest, NextResponse>(
    req,
    (data: unknown, init?: { status?: number }) =>
      NextResponse.json(data, init),
  );

  return result;
}
