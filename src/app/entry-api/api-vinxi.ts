import {
  eventHandler,
  getRequestURL,
  readBody,
  setResponseStatus,
} from "vinxi/http";

export default eventHandler(async (event) => {
  const { pathname } = getRequestURL(event);
  const path = pathname.replace(/^\/api/, "") || "/";

  if (path === "/health" && event.method === "GET") {
    return { status: "ok", time: new Date().toISOString() };
  }

  if (path === "/users" && event.method === "GET") {
    return { users: [{ id: 1, name: "Anna" }] };
  }

  if (path === "/users" && event.method === "POST") {
    const body = await readBody<{ name?: string }>(event);
    return { created: { id: 2, name: body?.name ?? "anon" } };
  }

  setResponseStatus(event, 404);
  return { error: "Not found" };
});
