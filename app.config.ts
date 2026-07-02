import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

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
    noExternals: true,
    inlineDynamicImports: true,
  },
  routers: [
    {
      name: "api",
      type: "http",
      handler: "./src/entry-api.ts",
      base: "/api",
    },
    {
      name: "client",
      type: "spa",
      handler: "./index.html",
      root: "./src",
      target: "browser",
      base: "/",
      plugins: () => [clientCacheDirPlugin, reactRefresh()],
    },
  ],
});
