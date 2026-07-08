import { serveDir, serveFile } from "@std/http/file-server";
import { createRequestHandler } from "./request-handler.ts";

const clientDist = new URL("../client/", import.meta.url);
const clientIndex = new URL("../client/index.html", import.meta.url);
const port = Number(Deno.env.get("PORT") ?? 3000);

async function serveStatic(request: Request): Promise<Response> {
  const response = await serveDir(request, {
    fsRoot: clientDist.pathname,
    quiet: true,
  });

  if (response.status === 404) {
    return serveFile(request, clientIndex.pathname);
  }

  return response;
}

const handleRequest = createRequestHandler(serveStatic);

console.log(`Production server: http://localhost:${port}`);
Deno.serve({ port }, handleRequest);


/*

  1. przykładowa struktura

  src
    app
      entry-client/ -- tutaj jest aplikacja reactowa
      entru-api/ -- tutaj jest api serwera

      entry-dev-server.ts - dev server
      entry-prod-server.ts - prod server

      vite.config.ts - konfiguracja



    2. dodać testową aplikację desktop

    src/desktop ...
     zobaczyć czy się ten wzór dobrze komponuje

    3. dodać przykładowe endpointy z orpc, jak się to komponuje
*/