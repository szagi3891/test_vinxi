/// <reference types="vite/client" />

interface Window {
  $RefreshReg$: () => void;
  $RefreshSig$: () => (type: unknown) => unknown;
}
