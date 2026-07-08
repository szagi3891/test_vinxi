import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const serverEntry = resolve(rootDir, "src_vite/entry-prod-server.ts");

function onlyEnv(envName: string, plugin: Plugin | Plugin[]): Plugin[] {
  const plugins = Array.isArray(plugin) ? plugin : [plugin];
  return plugins.map((item) => ({
    ...item,
    applyToEnvironment(env) {
      return env.name === envName;
    },
  }));
}

export default defineConfig({
  root: "./src_vite",
  cacheDir: "../node_modules/.vite",
  builder: {},
  plugins: [
    ...onlyEnv("server", deno()),
    ...onlyEnv('client', react()),
    ...onlyEnv('client', tailwindcss()),
  ],
  environments: {
    client: {
      build: {
        outDir: "../dist_vite/client",
        emptyOutDir: true,
      },
    },
    server: {
      resolve: {
        noExternal: true,
      },
      build: {
        outDir: "../dist_vite/server",
        emptyOutDir: true,
        rollupOptions: {
          input: serverEntry,
          output: {
            entryFileNames: "index.mjs",
          },
        },
      },
    },
  },
});
