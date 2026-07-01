import { useState } from "react";



type AppProps = {
  serverRenderedAt?: string;
};

export default function App({ serverRenderedAt }: AppProps) {
  const [count, setCount] = useState(0);

  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <title>Vinxi SSR POC</title>
      </head>
      <body>
        <main>
          <h1>Vinxi + React SSR</h1>
          <p suppressHydrationWarning>
            Czas renderu SSR: {serverRenderedAt ?? "—"}
          </p>
          <p>Licznik: {count}</p>
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            +1
          </button>
        </main>
      </body>
    </html>
  );
}
