

export async function getNearPriceUSD(): Promise<number> {
  try {
    const price = await Promise.any([coinGeckoPrice(), binancePrice()]);
    return price;
  } catch (err) {
    // All failed: surface useful information
    throw new Error(`All price providers failed or timed out: ${String(err)}`);
  }
}

const BINANCE_API =
  "https://api.binance.com/api/v3/ticker/price?symbol=NEARUSDT";

export async function binancePrice(): Promise<number> {
  return fetchPrice<{ price: number }>(BINANCE_API, (x) => x.price);
}

const COIN_GECKO_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd";
  
export async function coinGeckoPrice(): Promise<number> {
  return fetchPrice<{ near: { usd: number } }>(
    COIN_GECKO_API,
    (x) => x.near.usd,
  );
}
// TODO: find out the token ID here and implement this.
// const LLAMA_FI_API = 'https://coins.llama.fi/prices/current/near-protocol';

async function fetchPrice<T>(
  url: string,
  tokenPrice: (data: T) => number,
): Promise<number> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch NEAR price: ${res.statusText}`);
  const data = (await res.json()) as T;
  return tokenPrice(data);
}
