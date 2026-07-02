import { observer } from "mobx-react";
import { useEffect } from "react";
import { appStore } from "./appStore";

const App = observer(function App() {
  useEffect(() => {
    void appStore.loadHealth();
  }, []);

  return (
    <main className="mx-auto max-w-lg space-y-4 p-8 font-sans">
      <h1 className="text-2xl font-bold text-slate-900">Vinxi + React SPA</h1>
      <p className="text-slate-700">Licznik: {appStore.count}
      </p>
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
    </main>
  );
});

export default App;
