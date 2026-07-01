import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
  // Nitro: bundluj zależności serwera do jednego index.mjs zamiast kopiować node_modules/ do .output/server/
  server: {
    noExternals: true, // react, vinxi itd. trafiają do bundla, nie obok jako osobne pakiety
    inlineDynamicImports: true, // jeden plik zamiast wielu chunków
  },
  routers: [
    {
      name: "client",
      type: "client",
      handler: "./src/entry-client.tsx",
      target: "browser",
      base: "/_build",
      // HMR: reactRefresh() włącza React Fast Refresh — Vite dev server (pod spodem Vinxi)
      // podmienia zmienione moduły bez pełnego przeładowania strony, zachowując stan hooków.
      plugins: () => [reactRefresh()],
    },
    {
      name: "ssr",
      type: "http",
      handler: "./src/entry-server.tsx",
      target: "server",
    },
  ],
});
