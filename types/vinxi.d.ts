/**
 * Vinxi 0.5.x publikuje w package.json ścieżki do ./dist/types/…,
 * ale katalog dist/types nie trafia do paczki npm — stąd lokalne deklaracje.
 */

type VinxiRouter = {
  name: string;
  type: string;
  handler?: string;
  target?: "browser" | "server" | "static";
  base?: string;
  dir?: string;
  plugins?: () => unknown[];
};

declare module "vinxi" {
  export function createApp(config: {
    server?: {
      noExternals?: boolean;
      inlineDynamicImports?: boolean;
      output?: { dir?: string; serverDir?: string; publicDir?: string };
    };
    routers?: VinxiRouter[];
  }): unknown;
}

declare module "vinxi/manifest" {
  export interface Manifest {
    handler: string;
    inputs: Record<string, { output: { path: string } }>;
    json(): Promise<unknown>;
  }

  export function getManifest(routerName: string): Manifest;
}

declare module "vinxi/http" {
  import type { EventHandler, H3Event } from "h3";

  export function eventHandler<T extends EventHandler>(handler: T): T;
  export function eventHandler<T extends EventHandler>(options: {
    handler: T;
  }): T;

  export function getRequestURL(event: H3Event): URL;
  export function readBody<T = unknown>(event: H3Event): Promise<T>;
  export function setResponseStatus(
    event: H3Event,
    status: number,
    statusText?: string,
  ): void;

  export type { H3Event };
}
