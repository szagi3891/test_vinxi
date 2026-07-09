import type { RouterClient } from "@orpc/server";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { router } from "../entry-api/orpc/router.ts";

const link = new RPCLink({
  url: () => `${globalThis.location.origin}/orpc`,
});

export const orpc: RouterClient<typeof router> = createORPCClient(link);
