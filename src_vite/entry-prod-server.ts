import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createApiMiddleware } from "./api-routes.ts";
import { attachWebSocketServer } from "./entry-ws.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDist = join(__dirname, "..", "client");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

async function serveStatic(pathname: string): Promise<Response | null> {
  const rel = pathname === "/" ? "/index.html" : pathname;
  const filePath = join(clientDist, rel);

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    return new Response(data, {
      headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
    });
  } catch {
    if (!extname(rel)) {
      try {
        const data = await readFile(join(clientDist, "index.html"));
        return new Response(data, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } catch {
        return null;
      }
    }
    return null;
  }
}

const apiMiddleware = createApiMiddleware();
const port = Number(Deno.env.get("PORT") ?? 3000);

const server = createServer((req, res) => {
  apiMiddleware(req, res, async () => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    const response = await serveStatic(url.pathname);
    if (response) {
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    res.statusCode = 404;
    res.end("Not found");
  });
});

attachWebSocketServer(server);

server.listen(port, () => {
  console.log(`Production server: http://localhost:${port}`);
});
