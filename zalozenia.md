# Założenia POC — Vinxi + React SSR

Minimalny proof-of-concept full-stack aplikacji React z SSR na Vinxi.  
Celem jest **najmniejszy możliwy setup**, który da się rozbudować — nie produkcyjny framework.

---

## Cel

- Zweryfikować, że Vinxi poprawnie rozdziela bundling klienta i serwera.
- Zweryfikować SSR + hydration Reacta.
- Zweryfikować HMR (React Fast Refresh) w trybie dev.

---

## Stack

| Warstwa | Technologia |
|---------|-------------|
| Runtime / bundler | Vinxi (Vite pod spodem) |
| UI | React 18 |
| Język | TypeScript |
| HMR | `@vitejs/plugin-react` (tylko router `client`) |

---

## Struktura projektu

```
app.config.ts          # konfiguracja Vinxi (jedyne miejsce definicji routerów)
src/
  entry-server.tsx     # handler HTTP — render SSR
  entry-client.tsx     # wejście przeglądarki — hydration
  App.tsx              # jedyny komponent aplikacji
```

Brak routera stron, brak CSS frameworków, brak API, brak server functions.

---

## Routery (`app.config.ts`)

Dwa routery — każdy z własnym grafem zależności Vite:

### 1. `client` (browser)

- `type: "client"`
- `handler: "./src/entry-client.tsx"`
- `target: "browser"`
- `base: "/_build"`
- `plugins: () => [reactRefresh()]` — **jedyny** plugin w projekcie; odpowiada za HMR.

### 2. `ssr` (server)

- `type: "http"`
- `handler: "./src/entry-server.tsx"`
- `target: "server"`
- Brak pluginów — domyślna transformacja TSX przez Vite/esbuild wystarcza.

---

## `entry-server.tsx` — wymagania

Handler musi:

1. Użyć `eventHandler` z `vinxi/http`.
2. Pobrać manifest klienta: `getManifest("client")` z `vinxi/manifest`.
3. Wyrenderować `<App />` przez `renderToPipeableStream` (lub `renderToReadableStream`).
4. Wstrzyknąć skrypt klienta przez `bootstrapModules: [scriptSrc]`, gdzie `scriptSrc` pochodzi z manifestu.
5. Ustawić `Content-Type: text/html` i zwrócić stream HTML.

### Co jest niezbędne (nie da się usunąć bez zmiany architektury)

| Element | Dlaczego |
|---------|----------|
| `getManifest("client")` + `scriptSrc` | Jedyny sposób, by SSR wiedział, który bundle załadować w przeglądarce |
| `bootstrapModules` | React wstrzykuje `<script type="module">` z entry-client |
| Callback `onShellReady` + `Promise` | API `renderToPipeableStream` jest oparte na callbackach — nie zwraca Promise |
| `bootstrapScriptContent` (`window.manifest`) | Vinxi client runtime (`import "vinxi/client"`) oczekuje manifestu w `window` |

### Co można uprościć (bez zmiany założeń)

- Skrócić nazwy zmiennych (`client` zamiast `clientManifest`).
- Zamienić `renderToPipeableStream` + `Promise` na `renderToReadableStream` + `await` (krótszy kod, ten sam efekt — Vinxi obsługuje `ReadableStream`).
- Wydzielić helper `getClientScriptSrc()` — mniej linii w handlerze, ale więcej plików.

### Czego **nie** upraszczać do `renderToString`

`renderToString` nie obsługuje `bootstrapModules` — trzeba by ręcznie sklejać tagi `<script>`, co jest bardziej kodu i bardziej podatne na błędy.

---

## `entry-client.tsx` — wymagania

1. `import "vinxi/client"` — runtime manifestu Vinxi.
2. `hydrateRoot(document, <App />)` — hydration pełnego dokumentu (`<html>` renderowany w `App.tsx`).
3. **Dev only:** ręczna inicjalizacja React Refresh preamble przed importem komponentów.

### Dlaczego preamble w dev?

SSR streamuje HTML bez `transformIndexHtml` Vite. Plugin `@vitejs/plugin-react` normalnie wstrzykuje preamble tam — przy SSR trzeba to zrobić ręcznie w entry-client, inaczej błąd:

```
@vitejs/plugin-react can't detect preamble. Something is wrong.
```

Dynamiczny `import("./App")` po inicjalizacji preamble jest **celowy** — statyczny import byłby hoistowany i wykonałby się za wcześnie.

---

## `App.tsx` — wymagania

- Jeden komponent z `useState` (licznik) — weryfikacja interaktywności i HMR.
- Znacznik czasu renderu SSR (`serverRenderedAt` jako prop z entry-server) — widać różnicę między SSR a klientem.
- `suppressHydrationWarning` na elemencie z timestampem — klient nie przekazuje tego propa przy hydration.
- Pełna struktura `<html>` / `<head>` / `<body>` — wymagana przez `hydrateRoot(document, ...)`.

---

## Skrypty (`package.json`)

```json
"dev": "vinxi dev",
"build": "vinxi build",
"start": "vinxi start"
```

---

## TypeScript (`tsconfig.json`)

- `jsx: "react-jsx"`
- `module: "ESNext"`
- `moduleResolution: "Bundler"`

---

## Build output (`.output/`)

Po `vinxi build`:

| Ścieżka | Zawartość |
|---------|-----------|
| `.output/public/_build/` | Bundle klienta + manifest Vite (generowane przez Vinxi, nie z lokalnego katalogu `public/`) |
| `.output/server/index.mjs` | Serwer Nitro (SSR + serwowanie assetów) |

Pośrednie buildy per-router: `.vinxi/build/client/`, `.vinxi/build/ssr/`.

---

## Kryteria akceptacji

- [ ] `npm run dev` — aplikacja na localhost, bez błędów w konsoli.
- [ ] Odświeżenie strony zmienia znacznik czasu SSR.
- [ ] Licznik działa po hydration (bez pełnego reload).
- [ ] Edycja `App.tsx` w dev zachowuje stan licznika (HMR).
- [ ] `npm run build && npm run start` — produkcja działa.

---

## Poza zakresem (świadomie nie implementujemy)

- Router `static` / lokalny katalog `public/` (favicon, obrazy itp.)
- Routing (react-router, file-based routes)
- CSS / CSS frameworki
- API / server functions
- `@vinxi/react` (`createAssets`, `lazyRoute`)
- Testy automatyczne
- Linting / formatting config poza `tsconfig.json`
