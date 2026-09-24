# AGENTS — Nuevo Techo Propiedades y Hogar

## Quick start
- **Sitio estático (legacy)**: open `index.html` in a browser, or `python -m http.server` from the repo root (`http://localhost:8000`).
- **Frontend React**: `cd react && npm install && npm run dev` → `http://localhost:5173` (si 5173 está ocupado, Vite sube en 5174 — mirar la terminal).
- **API (backend)**: `cd server && npm install && npm run seed && npm start` → `http://localhost:3002` (`.env` con `PORT=3002`; ver *Environment quirks*).
- **Para que el sitio React quede dinámico**: levantar el backend antes que Vite; el frontend consume `/api/*` vía proxy de Vite (`react/vite.config.js` → `http://localhost:3002`, override con `API_URL=... npm run dev`).

## Backend (`server/`) — API REST + Mongoose
- Commands: `npm run seed` (poblar datos; `npm run seed -- --reset` fuerza reinicio), `npm start` (levanta Express en `PORT`, default 3002).
- Config in `server/.env`: `PORT`, `MONGODB_URI` (default `mongodb://127.0.0.1:27017/nuevo_techo`). Never commit `.env`.
- **MongoDB es opcional**: si no responde en 3s, `seed.js` escribe `data/db.json` y el servidor opera en modo memoria con los datos del TP (`data/seedData.js`). `data/db.json` está en `.gitignore`.
- Routes:
  - `GET /api/properties` — propiedades con `agente_id` y `tipo_id` poblados.
  - `POST /api/properties` — alta de propiedad; **requiere** `Authorization: Bearer <token>` de `POST /api/usuarios/login` (401 sin token).
  - `GET /api/tipos-propiedad` — tipos de inmueble.
  - `GET /api/usuarios` — personal (agentes/admins) **sin** `password`; alimenta el select "Agente" del panel admin.
  - `POST /api/usuarios/login` — `{ email, password }` → valida con `bcrypt.compare` y devuelve `{ token, usuario }` (401 si falla).
  - `POST /api/contactos` — formulario de tasación; acepta los `name` del form React (`metros`, `acepta`, `tipo` como string) y los mapea a `metros_cuadrados`, `acepta_novedades`, `tipo_id`.
- **Sesiones**: tokens aleatorios (`crypto.randomBytes(24)`) guardados en un `Map` en memoria; se invalidan al reiniciar el servidor (el frontend los guarda en `localStorage` bajo `nt_sesion` y pide re-login ante un 401).

### Mongoose data model (spec del TP)
- `Usuario`: `nombre`, `email` (único), `password`, `rol` (default `agente`). Valores de `rol`: `agente`, `admin`.
- `TipoPropiedad`: `nombre_tipo` (único). Valores TP: `Departamento`, `Casa`, `Oficina`, `PH`.
- `Propiedad`: `direccion`, `zona`, `ambientes` (Number), `metros_cuadrados` (Number), `precio` (Number), `operacion` enum `'Venta'|'Alquiler'`, `caracteristicas` [String], `imagenes` [String], `agente_id` → ref `Usuario`, `tipo_id` → ref `TipoPropiedad`. **Índice compuesto `{ precio: 1, operacion: 1 }`**.
- `Contacto`: `nombre`, `email`, `telefono`, `zona`, `metros_cuadrados`, `mensaje`, `acepta_novedades` (Boolean), `fecha` (default `Date.now`), `tipo_id` → ref `TipoPropiedad`.

### Seed data (devolución del TP: 3–5 docs por colección → 3/4/5/4)
Definido en `server/data/seedData.js` con `_id` hex fijo de 24 chars (idénticos en MongoDB y en `data/db.json`/modo memoria); `agente_id` y `tipo_id` apuntan directo a esos `_id`.
- **Usuarios (3)**: Leandro Spitale (agente), Federico Rossi (agente), Mariana López (admin). `password` = hash **real** de bcrypt (bcryptjs, costo 10) de la contraseña demo `nuevotecho2026` (igual para los 3).
- **Tipos (4)**: Casa, Departamento, Oficina, PH.
- **Propiedades (5)**: Palermo, Belgrano, San Isidro, Recoleta y un PH en Palermo (mezcla Venta/Alquiler).
- **Contactos (4)**: Claudio Benítez (2026-08-15), María González (2026-08-28), Jorge Peralta (2026-09-10), Ana Gutiérrez (2026-09-20) — fechas distintas, todos con `tipo_id`.
- Imágenes en datos apuntan a rutas `/img/...` de `react/public/`.

## Frontend React (`react/`) — sitio dinámico + panel privado
- `react-router-dom` (v7): rutas `"/"` (Home público), `"/login"` (ingreso del personal), `"/admin"` (dashboard protegido). Sin sesión válida, `/admin` redirige a `/login`.
- **Buscador en el Hero** (`Hero.jsx`): selects de Tipo (cargados desde `GET /api/tipos-propiedad`) y Operación + input de Zona/Barrio. El estado vive en `App.jsx` (`filtros`) y baja a `Hero` y a los tres `PropertyList`; al cambiar un filtro o enviar el form (`Buscar` → scroll a `#propiedades`) las tarjetas se filtran en tiempo real.
- **`PropertyList.jsx`**: trae las tarjetas de `GET /api/properties` (fetch en `App.jsx`, se refresca al montar el Home → las altas de `/admin` aparecen solas). Filtra por categoría (`destacadas` = todo / `alquiler` / `venta` por `operacion`) **y** por `filtros` (tipo id, operación, zona/dirección substring). Estado vacío: `.vacio`.
- **`/login`** (`Login.jsx`): `POST /api/usuarios/login`; guarda `{ token, usuario }` en `localStorage['nt_sesion']` y navega a `/admin`.
- **`/admin`** (`Admin.jsx`, ruta protegida): topbar con "Ver sitio público" / "Cerrar sesión" y formulario completo de alta (`direccion`, `zona`, `ambientes`, `metros_cuadrados`, `precio`, `operacion`, `tipo_id` y `agente_id` desde APIs, `caracteristicas` coma-separadas → array, `imágenes` una-por-línea → array). Envía `POST /api/properties` con `Authorization: Bearer <token>`; ante 401 cierra sesión y vuelve al login.
- **`react/src/api.js`**: helper `api(ruta, opciones)` (prefijo `/api`, JSON, Authorization) + `getSesion/guardarSesion/cerrarSesion`.
- Navbar agrega link "Ingreso" → `/login`.

## Environment quirks
- **iCloud Desktop sync vs `node_modules`**: este repo vive en `~/Desktop`, que está sincronizado con iCloud (disco al ~94%, eviction agresiva). `require()` de paquetes dentro de `server/node_modules` quedaba **bloqueado segundos/minutos** esperando hidratación de archivos. Por eso `server/node_modules` es un **symlink** a `~/nmm-srv/node_modules` (fuera del alcance de iCloud). Si se pierde: `cp server/package*.json ~/nmm-srv/ && (cd ~/nmm-srv && npm ci) && rm -rf server/node_modules && ln -s ~/nmm-srv/node_modules server/node_modules`. **No correr `npm install` dentro de `server/` recrearía `node_modules` bajo Desktop** (vuelve el síntoma). `react/node_modules` hoy funciona en su lugar; si `vite` cuelga al arrancar, aplicar el mismo patrón.
- **Puerto 3001 en conflicto**: otra app de esta máquina (`~/Desktop/superapp_transcripcion/backend`, `node server.js`) también escucha en 3001 (dual-stack), así que **la API y el proxy de Vite usan 3002** (`.env` → `PORT=3002`, `vite.config.js` → `http://localhost:3002`, override `API_URL=...`). Si se cambia el puerto, actualizar ambos. Mismo problema con el 5173 de Vite: otra instancia de Vite puede ocuparlo y nuestro dev server sube en 5174 (ver la terminal).

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