import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, type WebSocket } from "ws";

type UpgradeListener = (
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
) => void;

type HttpUpgradeServer = {
  on(event: "upgrade", listener: UpgradeListener): void;
};

const peers = new Set<string>();
const attachedServers = new WeakSet<HttpUpgradeServer>();

function onConnection(ws: WebSocket) {
  const id = crypto.randomUUID();
  peers.add(id);
  console.log(`[ws] połączono ${id} (aktywnych: ${peers.size})`);
  ws.send("połączono");

  ws.on("message", (data, isBinary) => {
    const text = isBinary ? Buffer.from(data as Buffer).toString() : String(data);
    ws.send(`echo: ${text}`);
  });

  ws.on("close", () => {
    peers.delete(id);
    console.log(`[ws] rozłączono ${id}`);
  });
}

export function attachWebSocketServer(httpServer: HttpUpgradeServer | null | undefined) {
  if (!httpServer || attachedServers.has(httpServer)) return;
  attachedServers.add(httpServer);

  const wss = new WebSocketServer({ noServer: true });
  wss.on("connection", onConnection);

  httpServer.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const pathname = req.url ? new URL(req.url, "http://localhost").pathname : "";
    if (pathname !== "/_ws") return;

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
}
