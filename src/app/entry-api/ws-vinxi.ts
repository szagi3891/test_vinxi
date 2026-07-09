import { defineWebSocket, eventHandler } from "vinxi/http";

const peers = new Set<string>();

export default eventHandler({
  handler: () => {},
  websocket: defineWebSocket({
    open(peer) {
      peers.add(peer.id);
      console.log(`[ws] połączono ${peer.id} (aktywnych: ${peers.size})`);
      peer.send("połączono");
    },
    message(peer, msg) {
      peer.send(`echo: ${msg.text()}`);
    },
    close(peer, details) {
      peers.delete(peer.id);
      console.log(`[ws] rozłączono ${peer.id}`, details);
    },
  }),
});
