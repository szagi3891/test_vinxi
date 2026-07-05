import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { createApiMiddleware } from "./src_vite/api-routes.ts";
import { attachWebSocketServer } from "./src_vite/entry-ws.ts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const serverEntry = resolve(rootDir, "src_vite/entry-prod-server.ts");

function clientOnly(plugin: Plugin | Plugin[]): Plugin[] {
  const plugins = Array.isArray(plugin) ? plugin : [plugin];
  return plugins.map((item) => ({
    ...item,
    applyToEnvironment(env) {
      return env.name === "client";
    },
  }));
}

function fullstackPlugin(): Plugin {
  const api = createApiMiddleware();

  return {
    name: "fullstack",
    applyToEnvironment(env) {
      return env.name === "client";
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api")) return next();
        api(req, res, next);
      });
      attachWebSocketServer(server.httpServer);
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api")) return next();
        api(req, res, next);
      });
      attachWebSocketServer(server.httpServer);
    },
  };
}

export default defineConfig({
  root: "./src_vite",
  cacheDir: "../node_modules/.vite",
  builder: {},
  plugins: [...clientOnly(react()), ...clientOnly(tailwindcss()), fullstackPlugin()],
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
