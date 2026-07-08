import { handleApiFetch } from "./api-routes.ts";

export function handleWebSocket(request: Request): Response {
    const { socket, response } = Deno.upgradeWebSocket(request);
    const id = crypto.randomUUID();

    socket.onopen = () => {
        console.log(`[ws] połączono ${id}`);
        socket.send("połączono");
    };

    socket.onmessage = (event) => {
        socket.send(`echo: ${event.data}`);
    };

    socket.onclose = () => {
        console.log(`[ws] rozłączono ${id}`);
    };

    return response;
}

export function createRequestHandler(
    fallback: (request: Request) => Promise<Response>,
) {
    return async (request: Request): Promise<Response> => {
        const url = new URL(request.url);

        if (url.pathname === "/_ws") {
            if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
                return new Response("Expected WebSocket", { status: 426 });
            }

            return handleWebSocket(request);
        }

        const apiResponse = await handleApiFetch(request);
        if (apiResponse) {
            return apiResponse;
        }

        return fallback(request);
    };
}
