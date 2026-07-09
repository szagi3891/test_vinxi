import { observer } from "mobx-react";
import { useEffect } from "react";
import { appStore } from "./appStore";
import { orpc } from "./orpc-client.ts";

const App = observer(function App() {
  useEffect(() => {
    void appStore.loadHealth();
    void appStore.loadOrpcGreeting();
    appStore.connectWs();
    return () => appStore.disconnectWs();
  }, []);

  return (
    <main className="mx-auto space-y-4 p-8 font-sans min-h-screen bg-white flex justify-center">
      <div className="w-[500px] gap-[16px] flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900">Vite + React SPA</h1>
        <p className="text-slate-700">Licznik: {appStore.count}</p>
        
        <div>
        <button
          type="button"
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          onClick={() => appStore.increment()}
        >
          +1
        </button>
        </div>

        <p className="text-sm text-slate-500">
          API:{" "}
          {appStore.apiError
            ? `błąd (${appStore.apiError})`
            : appStore.api
              ? `${appStore.api.status} @ ${appStore.api.time}`
              : "ładowanie…"}
        </p>
        <p className="text-sm text-slate-500">
          oRPC:{" "}
          {appStore.orpcError
            ? `błąd (${appStore.orpcError})`
            : appStore.orpcGreeting ?? "ładowanie…"}
        </p>

        <section className="space-y-2 border-t border-slate-200 pt-4">
          <h2 className="font-semibold text-slate-800">WebSocket</h2>
          <p className="text-sm text-slate-500">status: {appStore.wsStatus}</p>
          <p className="text-sm text-slate-600">
            ostatnia wiadomość: {appStore.wsLastMessage ?? "—"}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="wyślij do echo…"
              value={appStore.wsInput}
              onChange={(e) => appStore.setWsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && appStore.sendWs()}
            />
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600 cursor-pointer"
              onClick={() => appStore.sendWs()}
            >
              Wyślij
            </button>
          </div>
        </section>

        <div>
          <button type="button" onClick={async () => {
            await orpc.devtools();
          }}>
            Dev tools
          </button>
        </div>
      </div>
    </main>
  );
});

export default App;
