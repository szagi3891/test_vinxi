import http from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { createRequestHandler } from "./entry-api/request-handler.ts";
import { toFetchResponse, toReqRes } from "fetch-to-node";

const rootDir = dirname(fileURLToPath(import.meta.url));
const port = 5173;
const hmrPort = 24678;

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

const fallback = async (request: Request): Promise<Response> => {
  const { req, res } = toReqRes(request);
  const { promise, resolve, reject } = Promise.withResolvers<Response>();

  try {
    vite.middlewares(
      req,
      res,
      () => {
        resolve(new Response("Not Found", { status: 404 }));
      },
    );

    const response = await toFetchResponse(res);
    resolve(response);
  } catch (error) {
    reject(error);
  }

  return promise;
};

const handleRequest = createRequestHandler({ fallback });

console.log(`Dev server: http://localhost:${port} (HMR ws: ${hmrPort})`);
Deno.serve({ port, hostname: "0.0.0.0" }, handleRequest);
