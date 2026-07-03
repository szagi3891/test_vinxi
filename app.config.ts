import reactRefresh from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createApp } from "./createApp";

const clientCacheDirPlugin = {
  name: "client-cache-dir",
  config() {
    return {
      cacheDir: "../node_modules/.vinxi/cache/client",
    };
  },
};

export default createApp({
  server: {
    experimental: { websocket: true },
    noExternals: true,
    inlineDynamicImports: true,
  },
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./src/public",
      base: "/",
    },
    {
      name: "api",
      type: "http",
      handler: "./src/entry-api.ts",
      base: "/api",
    },
    {
      name: "ws",
      type: "http",
      handler: "./src/entry-ws.ts",
      base: "/_ws",
      websocket: true,
    },
    {
      name: "client",
      type: "spa",
      handler: "./index.html",
      root: "./src",
      target: "browser",
      base: "/",
      plugins: () => [
        clientCacheDirPlugin,
        tailwindcss(),
        reactRefresh(),
      ],
    },
  ],
});
