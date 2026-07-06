import http from "node:http";
import type { Socket } from "node:net";
import { Duplex } from "node:stream";
import type { Connect } from "vite";

class MockSocket extends Duplex {
  constructor() {
    super({ allowHalfOpen: true });
  }

  override _read() {}

  override _write(_chunk: unknown, _encoding: BufferEncoding, callback: () => void) {
    callback();
  }
}

export function connectToWeb(
  middleware: Connect.Server,
): (request: Request) => Promise<Response> {
  return (request: Request) =>
    // deno-lint-ignore no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const socket = new MockSocket() as unknown as Socket;
        const req = new http.IncomingMessage(socket);

        const url = new URL(request.url);
        req.url = url.pathname + url.search;
        req.method = request.method;
        req.headers = Object.fromEntries(request.headers);

        if (request.body && !["GET", "HEAD"].includes(request.method)) {
          req.push(Buffer.from(await request.arrayBuffer()));
        }
        req.push(null);

        const res = new http.ServerResponse(req);
        let settled = false;

        const chunks: Buffer[] = [];
        let statusCode = 200;

        res.writeHead = function (
          code: number,
          reasonOrHeaders?: string | http.OutgoingHttpHeaders,
          maybeHeaders?: http.OutgoingHttpHeaders,
        ) {
          statusCode = code;
          if (typeof reasonOrHeaders === "object" && reasonOrHeaders) {
            for (const [key, value] of Object.entries(reasonOrHeaders)) {
              if (value != null) res.setHeader(key, value);
            }
          } else if (maybeHeaders) {
            for (const [key, value] of Object.entries(maybeHeaders)) {
              if (value != null) res.setHeader(key, value);
            }
          }
          return res;
        } as typeof res.writeHead;

        res.write = function (chunk: unknown) {
          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
          }
          return true;
        } as typeof res.write;

        res.end = function (chunk?: unknown) {
          if (settled) return res;
          settled = true;

          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
          }

          const headers = new Headers();
          for (const [key, value] of Object.entries(res.getHeaders())) {
            if (value == null) continue;
            if (Array.isArray(value)) {
              for (const item of value) headers.append(key, String(item));
            } else {
              headers.set(key, String(value));
            }
          }

          resolve(
            new Response(chunks.length ? Buffer.concat(chunks) : null, {
              status: statusCode || res.statusCode,
              headers,
            }),
          );
          return res;
        } as typeof res.end;

        middleware(req, res, () => {
          if (settled) return;
          settled = true;
          resolve(new Response("Not Found", { status: 404 }));
        });
      } catch (error) {
        reject(error);
      }
    });
}
