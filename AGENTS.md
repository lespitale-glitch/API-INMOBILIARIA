# AGENTS — Nuevo Techo Propiedades y Hogar

## Quick start
- Open `index.html` in a browser, or run `python -m http.server` from the repo root and visit `http://localhost:8000`.
- No build step, no package manager, no compiled assets. Edit HTML/CSS/JS directly.

## Image paths
- All images are referenced from the repo root via relative paths (e.g., `img/alquiler/casa.png`).
- Do not move image folders or rename files without updating all references.
- `/img/` is the top-level image directory; subfolders are `alquiler`, `venta`, `destacadas`, `NT`, `redes`.

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