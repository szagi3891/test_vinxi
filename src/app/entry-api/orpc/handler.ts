import { RPCHandler } from "@orpc/server/fetch";
import { router } from "./router.ts";

const rpcHandler = new RPCHandler(router);

export async function handleOrpcFetch(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/orpc")) {
    return null;
  }

  const result = await rpcHandler.handle(request, {
    prefix: "/orpc",
    context: {},
  });

  if (!result.matched) {
    return new Response("Not found", { status: 404 });
  }

  return result.response;
}
