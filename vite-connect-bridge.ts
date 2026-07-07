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

async function webRequestToIncomingMessage(
  request: Request,
): Promise<http.IncomingMessage> {
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

  return req;
}

function nodeHeadersToWebHeaders(headers: http.OutgoingHttpHeaders): Headers {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) webHeaders.append(key, String(item));
    } else {
      webHeaders.set(key, String(value));
    }
  }
  return webHeaders;
}

export function connectToWeb(
  middleware: Connect.Server,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {

    const { promise, resolve, reject } = Promise.withResolvers<Response>();

    try {
      const req = await webRequestToIncomingMessage(request);

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

        const headers = nodeHeadersToWebHeaders(res.getHeaders());

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


    return promise;
  };
}
