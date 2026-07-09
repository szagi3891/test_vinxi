import { serveDir, serveFile } from "@std/http/file-server";
import { createRequestHandler } from "./entry-api/request-handler.ts";

console.info('import.meta.url', import.meta.url);
const clientDist = new URL("../client/", import.meta.url);
const clientIndex = new URL("../client/index.html", import.meta.url);
const port = 3000;

// console.info('clientDist', clientDist.pathname);
// console.info('clientIndex', clientIndex.pathname);  

// const index = await Deno.readFile(clientIndex.pathname);
// const indexText = new TextDecoder().decode(index);
// console.info('indexText', indexText);

// console.info("env", Deno.env.toObject());

async function serveStatic(request: Request): Promise<Response> {
    console.info('request url', request.url);

    const response = await serveDir(request, {
        fsRoot: clientDist.pathname,
        quiet: true,
    });

    if (response.status === 404) {
        return serveFile(request, clientIndex.pathname);
    }

    return response;
}

const handleRequest = createRequestHandler({ fallback: serveStatic });

// W trybie deno desktop runtime ustawia DENO_SERVE_ADDRESS i Deno.serve
// wiąże się z tym adresem, ignorując podany port.
console.log(`Production server: http://localhost:${port}`);
Deno.serve({ port }, handleRequest);
