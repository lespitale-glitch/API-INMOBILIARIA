# AGENTS — Nuevo Techo Propiedades y Hogar

## Quick start
- **Sitio estático (legacy)**: open `index.html` in a browser, or `python -m http.server` from the repo root (`http://localhost:8000`).
- **Frontend React**: `cd react && npm install && npm run dev` → `http://localhost:5173`.
- **API (backend)**: `cd server && npm install && npm run seed && npm start` → `http://localhost:3001` (si el puerto está ocupado, `PORT=3002 npm start`; ver *Environment quirks*).

## Backend (`server/`) — API REST + Mongoose
- Commands: `npm run seed` (poblar datos; `npm run seed -- --reset` fuerza reinicio), `npm start` (levanta Express en `PORT`, default 3001).
- Config in `server/.env`: `PORT`, `MONGODB_URI` (default `mongodb://127.0.0.1:27017/nuevo_techo`). Never commit `.env`.
- **MongoDB es opcional**: si no responde en 3s, `seed.js` escribe `data/db.json` y el servidor opera en modo memoria con los datos del TP (`data/seedData.js`). `data/db.json` está en `.gitignore`.
- Routes:
  - `GET /api/properties` — propiedades con `agente_id` y `tipo_id` poblados.
  - `GET /api/tipos-propiedad` — tipos de inmueble.
  - `POST /api/contactos` — formulario de tasación; acepta los `name` del form React (`metros`, `acepta`, `tipo` como string) y los mapea a `metros_cuadrados`, `acepta_novedades`, `tipo_id`.

### Mongoose data model (spec del TP)
- `Usuario`: `nombre`, `email` (único), `password`, `rol` (default `agente`). Valores de `rol`: `agente`, `admin`.
- `TipoPropiedad`: `nombre_tipo` (único). Valores TP: `Departamento`, `Casa`, `Oficina`, `PH`.
- `Propiedad`: `direccion`, `zona`, `ambientes` (Number), `metros_cuadrados` (Number), `precio` (Number), `operacion` enum `'Venta'|'Alquiler'`, `caracteristicas` [String], `imagenes` [String], `agente_id` → ref `Usuario`, `tipo_id` → ref `TipoPropiedad`. **Índice compuesto `{ precio: 1, operacion: 1 }`**.
- `Contacto`: `nombre`, `email`, `telefono`, `zona`, `metros_cuadrados`, `mensaje`, `acepta_novedades` (Boolean), `fecha` (default `Date.now`), `tipo_id` → ref `TipoPropiedad`.

### Seed data (devolución del TP: 3–5 docs por colección → 3/4/5/4)
Definido en `server/data/seedData.js` con `_id` hex fijo de 24 chars (idénticos en MongoDB y en `data/db.json`/modo memoria); `agente_id` y `tipo_id` apuntan directo a esos `_id`.
- **Usuarios (3)**: Leandro Spitale (agente), Federico Rossi (agente), Mariana López (admin). `password` = hash simulado de bcrypt, formato `$2b$10$…` de 60 chars (no es un hash real verificable).
- **Tipos (4)**: Casa, Departamento, Oficina, PH.
- **Propiedades (5)**: Palermo, Belgrano, San Isidro, Recoleta y un PH en Palermo (mezcla Venta/Alquiler).
- **Contactos (4)**: Claudio Benítez (2026-08-15), María González (2026-08-28), Jorge Peralta (2026-09-10), Ana Gutiérrez (2026-09-20) — fechas distintas, todos con `tipo_id`.
- Imágenes en datos apuntan a rutas `/img/...` de `react/public/`.

## Environment quirks
- **iCloud Desktop sync vs `node_modules`**: este repo vive en `~/Desktop`, que está sincronizado con iCloud (disco al ~94%, eviction agresiva). `require()` de paquetes dentro de `server/node_modules` quedaba **bloqueado segundos/minutos** esperando hidratación de archivos. Por eso `server/node_modules` es un **symlink** a `~/nmm-srv/node_modules` (fuera del alcance de iCloud). Si se pierde: `cp server/package*.json ~/nmm-srv/ && (cd ~/nmm-srv && npm ci) && rm -rf server/node_modules && ln -s ~/nmm-srv/node_modules server/node_modules`. **No correr `npm install` dentro de `server/` recrearía `node_modules` bajo Desktop** (vuelve el síntoma). `react/node_modules` hoy funciona en su lugar; si `vite` cuelga al arrancar, aplicar el mismo patrón.
- **Puerto 3001 en conflicto**: otra app de esta máquina (`~/Desktop/superapp_transcripcion/backend`, `node server.js`) también escucha en 3001 (dual-stack). Si `npm start` falla con `EADDRINUSE` o `curl localhost:3001` devuelve `Cannot GET`, usar `PORT=3002 npm start`. El frontend React **no** consume la API (sin fetch a localhost), así que el puerto no afecta al sitio.

## Image paths
- All images are referenced from the repo root via relative paths (e.g., `img/alquiler/casa.png`).
- Do not move image folders or rename files without updating all references.
- `/img/` is the top-level image directory; subfolders are `alquiler`, `venta`, `destacadas`, `NT`, `redes`.
- React copies live in `react/public/img/` (same structure); keep both in sync when adding images.

## CSS conventions
- `css/style.css` `@import`s partials in this order: header, home, cards, galeria, contacto, footer. **Do not reorder** — the cascade depends on it.
- Mobile-first breakpoints at `max-width: 768px`. All media queries target this threshold.
- `:root` vars: `--azul: #1f3b5b`, `--gris: #f4f4f4`, `--texto: #333`, `--radio: 15px`.

## Form fields (#tasacion section)
The contact form expects these exact `name` attributes:
- `nombre`, `email`, `telefono`, `tipo`, `zona`, `metros`, `acepta`, `mensaje`.
- `tipo` options: `Casa`, `Departamento`, `Oficina`, `Otro`.
- `acepta` is a required checkbox for "novedades y promociones".

## GitHub Pages
- This repo is configured for GitHub Pages deployment (remote: `origin` on `main`).
- The site is statically hosted; just push to `main` and Pages will rebuild automatically.

## Responsive design
- Header is `position: fixed` at `top: 0; left: 0`. Do not remove `z-index: 1000`.
- Menu toggle (`#menu-toggle`) expands/collapses `#menu` only below 768px.
- `.card` hover lifts `transform: translateY(-8px)`; `.item-galeria img:hover` scales `scale(1.03)`.