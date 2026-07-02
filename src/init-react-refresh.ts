// Dev: React Refresh preamble (SSR omija transformIndexHtml Vite)
if (import.meta.env.DEV) {
  // @ts-expect-error wirtualny moduł Vite
  const { default: RefreshRuntime } = await import("/@react-refresh");
  RefreshRuntime.injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type: unknown) => type;
}
