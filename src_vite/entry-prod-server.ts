import { extname } from "node:path";
import { handleApiFetch } from "./api-routes.ts";

const clientDist = new URL("../client/", import.meta.url);
const port = Number(Deno.env.get("PORT") ?? 3000);

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
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const fileUrl = new URL(rel, clientDist);

  try {
    const data = await Deno.readFile(fileUrl);
    const ext = extname(rel);
    return new Response(data, {
      headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
    });
  } catch {
    if (!extname(rel)) {
      try {
        const data = await Deno.readFile(new URL("index.html", clientDist));
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

function handleWebSocket(request: Request): Response {
  const { socket, response } = Deno.upgradeWebSocket(request);
  const id = crypto.randomUUID();

  socket.onopen = () => {
    console.log(`[ws] połączono ${id}`);
    socket.send("połączono");
  };

  socket.onmessage = (event) => {
    socket.send(`echo: ${event.data}`);
  };

  socket.onclose = () => {
    console.log(`[ws] rozłączono ${id}`);
  };

  return response;
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/_ws") {
    if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }
    return handleWebSocket(request);
  }

  const apiResponse = await handleApiFetch(request);
  if (apiResponse) return apiResponse;

  const staticResponse = await serveStatic(url.pathname);
  if (staticResponse) return staticResponse;

  return new Response("Not found", { status: 404 });
}

console.log(`Production server: http://localhost:${port}`);
Deno.serve({ port }, handleRequest);
