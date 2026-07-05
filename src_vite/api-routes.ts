type ApiBody = { name?: string };

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
      error: "Not found",
    },
  };
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
