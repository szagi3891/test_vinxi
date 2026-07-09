import { os } from "@orpc/server";
import * as z from "zod";

export const health = os.handler(async () => ({
  status: "ok",
  time: new Date().toISOString(),
  source: "orpc",
}));

export const greet = os
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ input }) => ({
    message: `Cześć, ${input.name}!`,
  }));

export const devtools = os.handler(async () => {
  return { ok: true };
});

export const router = {
  health,
  greet,
  devtools,
};
