const BINANCE_API =
  "https://api.binance.com/api/v3/ticker/price?symbol=NEARUSDT";
const COIN_GECKO_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd";

export async function getNearPriceUSD(): Promise<number> {
  const errs: string[] = [];

  try {
    const price = await coinGeckoPrice();
    return price;
  } catch (err) {
    errs.push(`coingecko: ${err}`);
  }
  try {
    const price = await binancePrice();
    return price;
  } catch (err) {
    errs.push(`binance: ${err}`);
  }
  throw new Error(`All price providers failed:\n- ${errs.join("\n- ")}`);
}

export async function binancePrice(): Promise<number> {
  return fetchPrice<{ price: number }>(BINANCE_API, (x) => x.price);
}

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
