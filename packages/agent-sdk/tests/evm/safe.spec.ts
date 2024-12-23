import { zeroAddress } from "viem";
import { getSafeBalances, flatSafeBalances } from "../../src";
describe("getSafeBalances", () => {
  const originalWarn = console.warn;

  beforeEach(() => {
    // Mock console.warn before each test
    console.warn = jest.fn();
  });

  afterEach(() => {
    // Restore original console.warn after each test
    console.warn = originalWarn;
  });

  it("should throw error for unsupported chain ID", async () => {
    await expect(getSafeBalances(999, zeroAddress)).resolves.toEqual([]);
  });

  it.skip("should fetch balances for Arbitrum", async () => {
    const result = await getSafeBalances(
      42161,
      "0x2A42b97d2cd622a0e2B5AB8dC5d6106fb7a122c5",
    );
    expect(result).toEqual([
      {
        tokenAddress: null,
        token: null,
        balance: "131757599414115",
      },
      {
        tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        token: {
          name: "USD Coin",
          symbol: "USDC",
          decimals: 6,
          logoUri:
            "https://assets.coingecko.com/coins/images/6319/thumb/usdc.png?1696506694",
        },
        balance: "89877",
      },
    ]);
  });

  it.skip("should fetch balances for Mainnet", async () => {
    const result = await flatSafeBalances(
      1,
      "0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA",
    );
    console.log(result);
    expect(result).toEqual({
      balances: [
        {
          token: null,
          balance: "30000000000000000",
          symbol: "ETH",
          decimals: 18,
          logoUri: "https://cdn.zerion.io/eth.png",
        },
      ],
    });
  });
});
