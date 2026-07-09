import { makeAutoObservable } from "mobx";
import { orpc } from "./orpc-client.ts";

export type ApiResponse = {
  status: string;
  time: string;
};

type WsStatus = "idle" | "connecting" | "open" | "closed" | "error";

class AppStore {
  count = 0;
  api: ApiResponse | null = null;
  apiError: string | null = null;
  orpcGreeting: string | null = null;
  orpcError: string | null = null;
  wsStatus: WsStatus = "idle";
  wsLastMessage: string | null = null;
  wsInput = "";

  private ws: WebSocket | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.count += 1;
  }

  async loadHealth() {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.api = (await res.json()) as ApiResponse;
    } catch (err) {
      this.apiError = err instanceof Error ? err.message : "Unknown error";
    }
  }

  async loadOrpcGreeting() {
    try {
      const result = await orpc.greet({ name: "React" });
      this.orpcGreeting = result.message;
    } catch (err) {
      this.orpcError = err instanceof Error ? err.message : "Unknown error";
    }
  }

  connectWs() {
    if (this.ws) return;

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    this.wsStatus = "connecting";
    this.ws = new WebSocket(`${protocol}//${location.host}/_ws`);

    this.ws.onopen = () => {
      this.wsStatus = "open";
    };
    this.ws.onmessage = (event) => {
      this.wsLastMessage = String(event.data);
    };
    this.ws.onclose = () => {
      this.wsStatus = "closed";
      this.ws = null;
    };
    this.ws.onerror = () => {
      this.wsStatus = "error";
    };
  }

  disconnectWs() {
    this.ws?.close();
    this.ws = null;
    this.wsStatus = "idle";
  }

  sendWs() {
    const text = this.wsInput.trim();
    if (!text || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(text);
    this.wsInput = "";
  }

  setWsInput(value: string) {
    this.wsInput = value;
  }
}

export const appStore = new AppStore();
