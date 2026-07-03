import reactRefresh from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createApp } from "./createApp";

const clientCacheDirPlugin = {
  name: "client-desktop-cache-dir",
  config() {
    return {
      cacheDir: "../node_modules/.vinxi/cache/client-desktop",
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
      handler: "./src_desktop/entry-api.ts",
      base: "/api",
    },
    {
      name: "client",
      type: "spa",
      handler: "./index.html",
      root: "./src_desktop",
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
