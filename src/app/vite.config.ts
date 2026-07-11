import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const serverEntry = resolve(rootDir, "server-prod.ts");

// function onlyEnv(envName: string, plugin: Plugin | Plugin[]): Plugin[] {
//   const plugins = Array.isArray(plugin) ? plugin : [plugin];
//   return plugins.map((item) => ({
//     ...item,
//     applyToEnvironment(env) {
//       return env.name === envName;
//     },
//   }));
// }

// Uwaga: applyToEnvironment bywa fabryką zwracającą plugin dla danego środowiska
// (np. vite:react:refresh-wrapper tak dostarcza transform z hot.accept dla HMR),
// dlatego oryginalny hook trzeba skomponować, a nie nadpisać zwykłym booleanem.
function onlyEnv(envName: string, plugin: Plugin | Plugin[]): Plugin[] {
  return [plugin].flat().map((item) => ({
      ...item,
      applyToEnvironment(env) {
          if (env.name !== envName) return false;
          return item.applyToEnvironment?.call(this, env) ?? true;
      },
  }));
}

export default defineConfig({
  root: rootDir,
  cacheDir: "../../node_modules/.vite",
  builder: {},
  plugins: [
    onlyEnv("server", deno()),
    onlyEnv("client", react()),
    onlyEnv("client", tailwindcss()),
  ],
  environments: {
    client: {
      build: {
        outDir: "../../dist/app/client",
        emptyOutDir: true,
      },
    },
    server: {
      resolve: {
        noExternal: true,
      },
      // Zbundlowane moduły (np. @std/http/file-server) mają bloki
      // `if (import.meta.main) main()`, które po bundlingu odpaliłyby się
      // w pliku wyjściowym — wyłączamy je na stałe.
      define: {
        "import.meta.main": "false",
      },
      build: {
        outDir: "../../dist/app/server",
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
