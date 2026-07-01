import "vinxi/client";

async function bootstrap() {
  // SSR streamuje HTML bez transformIndexHtml — preamble React Refresh trzeba
  // zainicjować ręcznie przed importem komponentów (inaczej błąd w App.tsx).
  if (import.meta.env.DEV) {
    // Wirtualny moduł Vite — istnieje tylko w dev serverze, nie ma pliku .d.ts
    // @ts-expect-error Vite virtual module
    const RefreshRuntime = (await import("/@react-refresh")).default;
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type: unknown) => type;
  }

  const { hydrateRoot } = await import("react-dom/client");
  const { default: App } = await import("./App");

  hydrateRoot(document, <App />);
}

void bootstrap();
