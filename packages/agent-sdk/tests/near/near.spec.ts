import { binancePrice, coinGeckoPrice, getNearPriceUSD } from "../../src/near";

describe("near utilities", () => {
  it("getNearPriceUSD", async () => {
    expect(await getNearPriceUSD()).toBeDefined();
  });

  it("binancePrice", async () => {
    expect(await binancePrice()).toBeDefined();
  });
  it("coinGeckoPrice", async () => {
    expect(await coinGeckoPrice()).toBeDefined();
  });
});
