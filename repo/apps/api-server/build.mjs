import { build } from "esbuild";
import { pinoPlugin } from "esbuild-plugin-pino";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.mjs",
  sourcemap: true,
  plugins: [pinoPlugin({ transports: ["pino-pretty"] })],
  external: [
    // postgres native bindings
    "pg-native",
  ],
});

console.log("Build complete");
