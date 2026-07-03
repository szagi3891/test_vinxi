import { makeAutoObservable } from "mobx";

export type ApiResponse = {
  status: string;
  time: string;
};

class AppStore {
  count = 0;
  api: ApiResponse | null = null;
  apiError: string | null = null;

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
}

export const appStore = new AppStore();
