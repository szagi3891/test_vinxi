import { observer } from "mobx-react";
import { useEffect } from "react";
import { appStore } from "./appStore";

const App = observer(function App() {
  useEffect(() => {
    void appStore.loadHealth();
    appStore.connectWs();
    return () => appStore.disconnectWs();
  }, []);

  return (
    <main className="mx-auto max-w-lg space-y-4 p-8 font-sans">
      <h1 className="text-2xl font-bold text-slate-900">Vite + React SPA</h1>
      <p className="text-slate-700">Licznik: {appStore.count}</p>
      <button
        type="button"
        className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        onClick={() => appStore.increment()}
      >
        +1
      </button>
      <p className="text-sm text-slate-500">
        API:{" "}
        {appStore.apiError
          ? `błąd (${appStore.apiError})`
          : appStore.api
            ? `${appStore.api.status} @ ${appStore.api.time}`
            : "ładowanie…"}
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
            className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
            onClick={() => appStore.sendWs()}
          >
            Wyślij
          </button>
        </div>
      </section>
    </main>
  );
});

export default App;
