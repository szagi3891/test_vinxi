# Założenia POC — Vinxi + React SPA + API

Minimalny proof-of-concept full-stack aplikacji React jako SPA z API na Vinxi.  
Celem jest **najmniejszy możliwy setup**, który da się rozbudować — nie produkcyjny framework.

---

## Cel

- Zweryfikować, że Vinxi poprawnie rozdziela bundling klienta (SPA) i serwera (API).
- Zweryfikować SPA + hydration Reacta.
- Zweryfikować HMR (React Fast Refresh) w trybie dev.
- Zweryfikować prosty endpoint API (`/api/health`).

---

## Stack

| Warstwa | Technologia |
|---------|-------------|
| Runtime / bundler | Vinxi (Vite pod spodem) |
| UI | React 18 |
| Język | TypeScript |
| HMR | `@vitejs/plugin-react` 5.x (router `client`) |

---

## Struktura projektu

```
app.config.ts          # konfiguracja Vinxi (jedyne miejsce definicji routerów)
index.html             # shell SPA — Vite wstrzykuje skrypty przez transformIndexHtml
src/
  entry-api.ts         # handler HTTP — endpointy API
  entry-client.tsx     # wejście przeglądarki — createRoot
  App.tsx              # jedyny komponent aplikacji
```

Brak routera stron, brak CSS frameworków, brak server functions.

---

## Routery (`app.config.ts`)

Dwa routery — każdy z własnym grafem zależności Vite.

Opcje Nitro (`server`) — bundling serwera do jednego pliku bez `node_modules` w output:

```ts
server: {
  noExternals: true,           // zależności npm w index.mjs, nie w node_modules/
  inlineDynamicImports: true,  // jeden plik zamiast chunków
},
```

### 1. `api` (server)

- `type: "http"`
- `handler: "./src/entry-api.ts"`
- `base: "/api"`
- Brak pluginów — domyślna transformacja TS przez Vite/esbuild wystarcza.

### 2. `client` (browser, SPA)

- `type: "spa"`
- `handler: "./index.html"`
- `target: "browser"`
- `base: "/"`
- `plugins: () => [reactRefresh()]` — **jedyny** plugin w projekcie; odpowiada za HMR.

**Uwaga routingu:** `GET /api/` trafia w fallback SPA — używaj ścieżek z segmentem, np. `/api/health`.

---

## `entry-api.ts` — wymagania

Handler musi:

1. Użyć `eventHandler` z `vinxi/http`.
2. Zwracać JSON (h3 serializuje obiekty automatycznie).

Przykład: `GET /api/health` → `{ status: "ok", time: "..." }`.

---

## `index.html` + `entry-client.tsx`

- `index.html` — `<div id="root">` + `<script type="module" src="/src/entry-client.tsx">`.
- Vite w dev/prod wstrzykuje bundle i HMR przez `transformIndexHtml` — **brak ręcznego preamble**.
- `entry-client.tsx` — `createRoot(document.getElementById("root")).render(<App />)`.

---

## `App.tsx` — wymagania

- Jeden komponent z `useState` (licznik) — weryfikacja interaktywności i HMR.
- `fetch("/api/health")` w `useEffect` — weryfikacja połączenia z API.
- Zwykły komponent w `#root` — bez pełnej struktury `<html>`.

---

## Komendy (`Taskfile.yaml`)

| Task | Opis |
|------|------|
| `task dev` | serwer deweloperski |
| `task build` | build produkcyjny |
| `task start` | uruchomienie po buildzie |
| `task typecheck` | sprawdzenie typów TS |

Po zmianie routerów: `rm -rf .vinxi` przed `task dev` (stary cache).

---

## TypeScript (`tsconfig.json`)

- `jsx: "react-jsx"`
- `module: "ESNext"`
- `moduleResolution: "Bundler"`

---

## Build output (`.output/`)

Po `task build`:

| Ścieżka | Zawartość |
|---------|-----------|
| `.output/public/` | `index.html` + bundle klienta (`assets/`) |
| `.output/server/index.mjs` | Jeden plik serwera (API + serwowanie SPA — bez `node_modules/`) |

Deploy produkcyjny: `index.mjs` + katalog `public/`.

Pośrednie buildy per-router: `.vinxi/build/api/`, `.vinxi/build/client/`.

---

## Kryteria akceptacji

- [ ] `task dev` — aplikacja na localhost, bez błędów w konsoli.
- [ ] `GET /api/health` zwraca JSON.
- [ ] Licznik działa (interaktywność SPA).
- [ ] Edycja `App.tsx` w dev zachowuje stan licznika (HMR).
- [ ] `task build && task start` — produkcja działa; `.output/server/` bez `node_modules/`.

---

## Poza zakresem (świadomie nie implementujemy)

- Router `static` / lokalny katalog `public/` (favicon, obrazy itp.)
- Routing (react-router, file-based routes)
- CSS / CSS frameworki
- Rozbudowane API (wiele endpointów, walidacja, DB)
- `@vinxi/react` (`createAssets`, `lazyRoute`)
- Testy automatyczne
- Linting / formatting config poza `tsconfig.json`
