import { parseUnits, type Address } from "viem";
import {
  erc20Transfer,
  getTokenDecimals,
  addressField,
  floatField,
  numberField,
  validateInput,
  type FieldParser,
} from "../src";

interface Input {
  chainId: number;
  amount: number;
  token: Address;
  recipient: Address;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  // Note that this is a float (i.e. token units)
  amount: floatField,
  token: addressField,
  recipient: addressField,
};

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const search = url.searchParams;
  console.log("erc20/", search);
  try {
    const { chainId, amount, token, recipient } = validateInput<Input>(
      search,
      parsers,
    );
    const decimals = await getTokenDecimals(chainId, token);
    return Response.json(
      {
        transaction: erc20Transfer({
          chainId,
          token,
          to: recipient,
          amount: parseUnits(amount.toString(), decimals),
        }),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : `Unknown error occurred ${String(error)}`;
    return Response.json({ ok: false, message }, { status: 400 });
  }
}
