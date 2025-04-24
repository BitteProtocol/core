import {
  signRequestFor,
  fallbackResponder,
  validateRequest,
} from "../../src/evm";
import { getAddress, zeroAddress } from "viem";
import type { BaseRequest } from "../../src/evm";
import { hexifyValue } from "../../src/evm";

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
  describe("hexifyValue", () => {
    it("does the thing", () => {
      expect(hexifyValue("0x00")).toEqual("0x00");

      expect(hexifyValue("0")).toEqual("0x00");
      expect(hexifyValue("1")).toEqual("0x01");
      expect(hexifyValue("15")).toEqual("0x0f");
      expect(hexifyValue("16")).toEqual("0x10");
      expect(hexifyValue("17")).toEqual("0x11");
      expect(hexifyValue("255")).toEqual("0xff");
      expect(hexifyValue("256")).toEqual("0x0100");
      expect(hexifyValue("257")).toEqual("0x0101");
      expect(hexifyValue("256")).toEqual("0x0100");
    });
  });
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
});
