import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ["tests/**/*.spec.ts"],
    outDir: "tests/dist",
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
  },
]);
