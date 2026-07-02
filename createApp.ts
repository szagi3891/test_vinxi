// @ts-expect-error vinxi#514 — paczka npm nie publikuje dist/types/
import { createApp as createAppUntyped } from "vinxi";

export type VinxiRouter = {
  name: string;
  type: string;
  handler?: string;
  root?: string;
  base?: string;
  target?: "browser" | "server";
  plugins?: () => unknown[];
};

export type VinxiAppConfig = {
  server?: {
    noExternals?: boolean;
    inlineDynamicImports?: boolean;
  };
  routers?: VinxiRouter[];
};

export const createApp = createAppUntyped as (config: VinxiAppConfig) => unknown;
