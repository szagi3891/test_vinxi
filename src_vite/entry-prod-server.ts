import { extname } from "node:path";
import { createRequestHandler } from "./request-handler.ts";

const clientDist = new URL("../client/", import.meta.url);
const port = Number(Deno.env.get("PORT") ?? 3000);

const MIME: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
};

async function serveStatic(pathname: string): Promise<Response> {
    const rel = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
    const fileUrl = new URL(rel, clientDist);

    try {
        const data = await Deno.readFile(fileUrl);
        const ext = extname(rel);
        return new Response(data, {
            headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
        });
    } catch {
        if (!extname(rel)) {
            try {
                const data = await Deno.readFile(new URL("index.html", clientDist));
                return new Response(data, {
                headers: { "Content-Type": "text/html; charset=utf-8" },
                });
            } catch {
                return new Response("Not found", { status: 404 });
            }
        }
        return new Response("Not found", { status: 404 });
    }
}

const handleRequest = createRequestHandler((request) => {
    const url = new URL(request.url);
    return serveStatic(url.pathname);
});

console.log(`Production server: http://localhost:${port}`);
Deno.serve({ port }, handleRequest);
