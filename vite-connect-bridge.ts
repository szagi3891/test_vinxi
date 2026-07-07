import { toFetchResponse, toReqRes } from "fetch-to-node";
import type { Connect } from "vite";

export function connectToWeb(
  middleware: Connect.Server,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const { req, res } = toReqRes(request);
    const { promise, resolve, reject } = Promise.withResolvers<Response>();

    try {
      middleware(
        req,
        res,
        () => {
          resolve(new Response("Not Found", { status: 404 }));
        }
      );

      const response = await toFetchResponse(res);
      resolve(response);
    } catch (error) {
      reject(error);
    }

    return promise;
  };
}
