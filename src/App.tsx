import { useEffect, useState } from "react";

type ApiResponse = {
  status: string;
  time: string;
};

export default function App() {
  const [count, setCount] = useState(0);
  const [api, setApi] = useState<ApiResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then(setApi)
      .catch((err: Error) => setApiError(err.message));
  }, []);

  return (
    <main>
      <h1>Vinxi + React SPA</h1>
      <p>Licznik: {count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
      <p>
        API:{" "}
        {apiError
          ? `błąd (${apiError})`
          : api
            ? `${api.status} @ ${api.time}`
            : "ładowanie…"}
      </p>
    </main>
  );
}
