import * as fs from "fs";
import * as path from "path";

// Path to the original tokenMap.json
const tokenMapPath = path.join(process.cwd(), "public", "tokenMap.json");

// Read the tokenMap.json file
const tokenMap = JSON.parse(fs.readFileSync(tokenMapPath, "utf-8"));

// Output directory (same as input for now)
const outputDir = path.dirname(tokenMapPath);

for (const chainId of Object.keys(tokenMap)) {
  const chainTokens = tokenMap[chainId];
  const outPath = path.join(outputDir, `tokens_${chainId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(chainTokens, null, 2));
  console.log(`Wrote ${outPath}`);
}
