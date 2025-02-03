import { scientificToDecimal } from "../src";

describe("scientificToDecimal", () => {
  const testCases = [
    // Very small numbers
    { input: 2.22047152096e-16, expected: "0.000000000000000222047152096" },
    { input: 1e-18, expected: "0.000000000000000001" },
    { input: 1.23456789e-15, expected: "0.00000000000000123456789" },

    // Regular decimal numbers
    { input: 0.1, expected: "0.1" },
    { input: 0.123456789, expected: "0.123456789" },
    { input: 1.234, expected: "1.234" },

    // Whole numbers
    { input: 1, expected: "1" },
    { input: 100, expected: "100" },

    // Large numbers
    { input: 1e18, expected: "1000000000000000000" },
    { input: 1.23456789e18, expected: "1234567890000000000" },

    // Zero
    { input: 0, expected: "0" },

    // Numbers close to zero
    { input: 0.0000001, expected: "0.0000001" },
    { input: 0.000000001, expected: "0.000000001" },

    // Numbers with many decimal places
    // TODO(bh2smith): We lose precision here getting 0.0000000001234567891234568
    // { input: 1.23456789123456789e-10, expected: "0.000000000123456789123456789"},

    // Edge cases
    {
      input: Number.MIN_VALUE,
      expected:
        "0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005",
    }, // Smallest possible number in JavaScript
    { input: Number.EPSILON, expected: "0.0000000000000002220446049250313" }, // Smallest difference between two numbers
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should convert ${input} to ${expected}`, () => {
      expect(scientificToDecimal(input)).toBe(expected);
    });
  });
});
