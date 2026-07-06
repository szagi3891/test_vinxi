import http from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { connectToWeb } from "../vite-connect-bridge.ts";
import { createRequestHandler } from "./request-handler.ts";

const rootDir = dirname(fileURLToPath(new URL("../vite.config.ts", import.meta.url)));
const port = Number(Deno.env.get("PORT") ?? 5173);
const hmrPort = Number(Deno.env.get("HMR_PORT") ?? 24678);

const hmrServer = http.createServer();
await new Promise<void>((resolveListen) => hmrServer.listen(hmrPort, resolveListen));

const vite = await createViteServer({
  configFile: resolve(rootDir, "vite.config.ts"),
  server: {
    middlewareMode: true,
    hmr: {
      server: hmrServer,
      port: hmrPort,
    },
  },
});

const handleRequest = createRequestHandler(connectToWeb(vite.middlewares));

console.log(`Dev server: http://localhost:${port} (HMR ws: ${hmrPort})`);
Deno.serve({ port, hostname: "0.0.0.0" }, handleRequest);
