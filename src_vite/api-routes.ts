import type { IncomingMessage, ServerResponse } from "node:http";

type ApiBody = { name?: string };

async function readJsonBody(req: IncomingMessage): Promise<ApiBody | null> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString()) as ApiBody;
  } catch {
    return null;
  }
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export async function handleApiRequest(
  pathname: string,
  method: string | undefined,
  req: IncomingMessage,
): Promise<{ status: number; body: unknown } | null> {
  if (!pathname.startsWith("/api")) return null;

  const path = pathname.replace(/^\/api/, "") || "/";

  if (path === "/health" && method === "GET") {
    return { status: 200, body: { status: "ok", time: new Date().toISOString() } };
  }

  if (path === "/users" && method === "GET") {
    return { status: 200, body: { users: [{ id: 1, name: "Anna" }] } };
  }

  if (path === "/users" && method === "POST") {
    const body = await readJsonBody(req);
    return { status: 200, body: { created: { id: 2, name: body?.name ?? "anon" } } };
  }

  return { status: 404, body: { error: "Not found" } };
}

export function createApiMiddleware() {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const result = await handleApiRequest(url.pathname, req.method, req);
    if (!result) return next();
    sendJson(res, result.status, result.body);
  };
}
