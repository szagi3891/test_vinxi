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

function resolveApiRoute(
  pathname: string,
  method: string,
  body: ApiBody | null,
): { status: number; body: unknown } | null {
  if (!pathname.startsWith("/api")) return null;

  const path = pathname.replace(/^\/api/, "") || "/";

  if (path === "/health" && method === "GET") {
    return { status: 200, body: { status: "ok", time: new Date().toISOString() } };
  }

  if (path === "/users" && method === "GET") {
    return { status: 200, body: { users: [{ id: 1, name: "Anna" }] } };
  }

  if (path === "/users" && method === "POST") {
    return { status: 200, body: { created: { id: 2, name: body?.name ?? "anon" } } };
  }

  return {
    status: 404,
    body: {
      error: "Not found"
    }
  };
}

export async function handleApiRequest(
  pathname: string,
  method: string | undefined,
  req: IncomingMessage,
): Promise<{ status: number; body: unknown } | null> {
  const body = method === "POST" ? await readJsonBody(req) : null;
  return resolveApiRoute(pathname, method ?? "GET", body);
}

export async function handleApiFetch(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  let body: ApiBody | null = null;

  if (request.method === "POST") {
    try {
      body = (await request.json()) as ApiBody;
    } catch {
      body = null;
    }
  }

  const result = resolveApiRoute(url.pathname, request.method, body);
  if (!result) return null;

  return Response.json(result.body, { status: result.status });
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
