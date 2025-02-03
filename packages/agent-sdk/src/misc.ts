import { MetaTransaction } from "near-safe";

export const NULL_TRANSACTION: MetaTransaction = {
  to: "0x0000000000000000000000000000000000000000",
  value: "0x00",
  data: "0x",
};

export function scientificToDecimal(num: number): string {
  // If not in scientific notation, return as is
  if (!/^\d+\.?\d*e[+-]*\d+$/i.test(num.toString())) {
    return num.toString();
  }

  const parts = num.toString().toLowerCase().split("e");
  const mantissa = parts[0];
  const exponent = parseInt(parts[1], 10);

  // Remove decimal point from mantissa if exists
  const [whole = "", decimal = ""] = mantissa.split(".");
  const mantissaWithoutPoint = whole + decimal;

  if (exponent > 0) {
    const zerosToAdd = exponent - decimal.length;
    return mantissaWithoutPoint + "0".repeat(Math.max(0, zerosToAdd));
  } else {
    const absExponent = Math.abs(exponent);
    return `0.${"0".repeat(absExponent - 1)}${mantissaWithoutPoint}`;
  }
}
