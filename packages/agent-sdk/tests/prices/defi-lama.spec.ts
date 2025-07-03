import { getTokenPrice } from "../../src/prices/defi-lama";

describe("prices", () => {
  it("gets COW Token Price on Gnosis", async () => {
    const cowToken = "0x177127622c4a00f3d409b75571e12cb3c8973d3c";
    const price = await getTokenPrice(100, cowToken);
    console.log("CoW Price", price);
    expect(price).toBeDefined();
  });

  it("gets WETH Token Price on Base", async () => {
    const wethToken = "0x4200000000000000000000000000000000000006";
    const priceWeth = await getTokenPrice(8453, wethToken);
    console.log("WETH Price", priceWeth);
    expect(priceWeth).toBeDefined();
  });
});
