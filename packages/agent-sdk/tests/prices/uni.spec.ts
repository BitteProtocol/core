import { getTokenPrice } from "../../src/prices/uni-v3";

describe.skip("prices", () => {
  it("gets COW Token Price on Base", async () => {
    // Low Liquidity Warning!
    const cowToken = "0xc694a91e6b071bf030a18bd3053a7fe09b6dae69";
    const priceCow = await getTokenPrice(8453, cowToken);
    expect(priceCow).toBeDefined();
  });
  it("gets WETH Token Price on Base", async () => {
    const wethToken = "0x4200000000000000000000000000000000000006";
    const priceWeth = await getTokenPrice(8453, wethToken);
    expect(priceWeth).toBeDefined();
  });
});
