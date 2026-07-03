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
  /** Router tylko pod WebSocket — w dev pomija publicAssets (konflikt Vinxi#443). */
  websocket?: boolean;
};

export type VinxiAppConfig = {
  server?: {
    noExternals?: boolean;
    inlineDynamicImports?: boolean;
    experimental?: {
      websocket?: boolean;
    };
  };
  routers?: VinxiRouter[];
};

export type VinxiApp = {
  hooks: {
    hook: (name: string, fn: (...args: unknown[]) => void | Promise<void>) => void;
  };
  config: VinxiAppConfig;
};

export const createApp = (config: VinxiAppConfig): VinxiApp => {
  const app = createAppUntyped(config) as VinxiApp;

  const wsBases = new Set(
    (config.routers ?? [])
      .filter((r) => r.websocket)
      .map((r) => r.base ?? "/"),
  );

  if (wsBases.size > 0) {
    app.hooks.hook("app:dev:nitro:config", ({ nitro }) => {
      nitro.options.publicAssets = nitro.options.publicAssets.filter(
        (asset: { baseURL?: string }) => !wsBases.has(asset.baseURL ?? "/"),
      );
    });
  }

  return app;
};
