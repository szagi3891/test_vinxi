import { toFetchResponse, toReqRes } from "fetch-to-node";
import type { Connect } from "vite";

// function withNoCacheHeaders(headers: Headers): Headers {
//   if (!headers.has("cache-control")) {
//     headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
//     headers.set("Pragma", "no-cache");
//     headers.set("Expires", "0");
//   }
//   return headers;
// }

// function withNoCacheResponse(response: Response): Response {
//   return new Response(response.body, {
//     status: response.status,
//     statusText: response.statusText,
//     headers: withNoCacheHeaders(new Headers(response.headers)),
//   });
// }

export function connectToWeb(
  middleware: Connect.Server,
): (request: Request) => Promise<Response> {
  return (request: Request) => {
    const { req, res } = toReqRes(request);

    return new Promise((resolve, reject) => {
      let settled = false;
      const settle = (response: Response) => {
        if (settled) return;
        settled = true;
        //resolve(withNoCacheResponse(response));
        resolve(response);
      };

      try {
        middleware(req, res, () => {
          settle(new Response("Not Found", { status: 404 }));
        });
        toFetchResponse(res).then(settle).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  };
}
