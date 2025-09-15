import path from "node:path";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import zip from "vite-plugin-zip-pack";
import manifest from "./manifest.config.js";
import { name, version } from "./package.json";

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  // Make environment variables available to Node.js process
  Object.assign(process.env, env);

  return {
    resolve: {
      alias: {
        "@": `${path.resolve(__dirname, "src")}`,
      },
    },
    plugins: [
      react(),
      crx({ manifest }),
      zip({ outDir: "release", outFileName: `crx-${name}-${version}.zip` }),
    ],
    server: {
      cors: {
        origin: [/chrome-extension:\/\//],
      },
    },
  };
});
