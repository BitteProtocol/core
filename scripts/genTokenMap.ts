import csv from "csv-parser";
import dotenv from "dotenv";
import * as fs from "fs";
import path from "path";
import { getAddress } from "viem";
import { BlockchainMapping } from "../packages/agent-sdk/src";

import { DuneClient } from "@duneanalytics/client-sdk";

// Add this interface near the top of the file
interface TokenRow {
  blockchain: string;
  address: string;
  decimals: string;
  symbol: string;
}

async function generateTokenMapJson(
  useLatestResults: boolean = false,
): Promise<void> {
  dotenv.config();
  const { DUNE_API_KEY } = process.env;

  const dune = new DuneClient(DUNE_API_KEY ?? "");
  const queryId = 4362544;
  const csv = useLatestResults
    ? await dune.exec.getLastResultCSV(queryId)
    : await dune.runQueryCSV({ queryId });

  const tokenMap = await loadTokenMapping(csv.data);
  const outputFile = path.join(process.cwd(), "public", "tokenMap.json");

  fs.writeFileSync(outputFile, JSON.stringify(tokenMap, null, 2));
  console.log("Token map JSON generated at:", outputFile);
}

const DuneNetworkMap: { [key: string]: number } = {
  ethereum: 1,
  gnosis: 100,
  arbitrum: 42161,
  sepolia: 11155111,
  base: 8453,
  bnb: 56,
  optimism: 10,
  polygon: 137,
};

export async function loadTokenMapping(
  csvData: string,
): Promise<BlockchainMapping> {
  const mapping: BlockchainMapping = {};
  let duplicateSymbols = 0;
  return new Promise((resolve, reject) => {
    const stream = require("stream");
    const csvStream = new stream.Readable();
    csvStream.push(csvData);
    csvStream.push(null);
    csvStream
      .pipe(csv())
      .on("data", (row: TokenRow) => {
        const { blockchain, address, decimals, symbol } = row;
        const chainId = DuneNetworkMap[blockchain];
        // Ensure blockchain key exists in the mapping
        if (!mapping[chainId]) {
          mapping[chainId] = {};
        }
        // Convert symbol to lowercase (data sanitization)
        const lowerCaseSymbol = row.symbol.toLowerCase();
        if (mapping[chainId][lowerCaseSymbol]) {
          duplicateSymbols++;
          console.warn(
            `Duplicate symbol found for ${symbol} on chain ${chainId}:`,
            `\nExisting: ${mapping[chainId][lowerCaseSymbol].address}`,
            `\nNew: ${address}`
          );
          return; // Skip this entry, keeping the first occurrence
        }
        try {
          // Map symbol to address and decimals
          mapping[chainId][lowerCaseSymbol] = {
            address: getAddress(address),
            decimals: parseInt(decimals, 10),
            symbol: symbol,
          };
        } catch (error) {
          console.error(
            `Error processing row (skipping): ${JSON.stringify(row)}`,
          );
        }
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
        console.log(`Duplicate symbols skipped: ${duplicateSymbols}`);
        resolve(mapping);
      })
      .on("error", (error: unknown) => {
        console.error("Error reading the CSV file:", error);
        reject(error);
      });
  });
}

generateTokenMapJson(true).catch(console.error);
