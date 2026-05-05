# AGENTS.md — ebo-illustration

## Qué es este repo

Portafolio estático de **Ebo Illustration** (Elena Baglietto). Sitio estático en HTML/CSS/JS sin build system, sin package manager, sin framework. Se sirve tal cual desde GitHub Pages.

Dominio: `https://eboillustration.es` (configurado en `CNAME`).

## Estructura

| Ruta | Contenido |
|------|-----------|
| `index.html` | Página principal del portafolio |
| `css/` | Hojas de estilo: `style.css` (global), `style-bruja.css`, `youtube.css`, `ilustraciones.css` |
| `js/` | `config.js` (API keys), `youtube-api.js` (llamadas a YouTube Data API) |
| `img/` | Assets de imagen (.webp, .jpg, .ico) |
| `proyectos/` | Sub-páginas de proyectos (La Botica de la Bruja, La Caja de los Gatitos, Verkami) |
| `ebojuega/` | Sub-sitio de la sección gaming (gameplays, etc.) |
| `sobre-mi.html`, `ilustraciones.html`, `youtube.html` | Páginas individuales |

## Deployment

- **CI**: `.github/workflows/deploy.yml` — se ejecuta en push a `main` o `workflow_dispatch`.
- **Deploy**: GitHub Pages (upload del repo tal cual, sin build step).
- **Secret requerido**: `YOUTUBE_API_KEY`. El workflow inyecta este valor en `js/config.js` en tiempo de build.
- **Importante**: `js/config.js` tiene un placeholder (`TU_API_KEY_AQUI`). El valor real solo existe en el deploy de CI. **No commitear API keys reales** a este archivo.

## Desarrollo local

- No hay servidor de desarrollo ni build. Abrir `index.html` directamente en el navegador o usar un servidor estático simple (Live Server, `python -m http.server`, etc.).
- Para probar la integración con YouTube API en local: añadir la API key real en `js/config.js` (y revertir después, o usar `.gitignore`).

## SEO y meta

- Cada página incluye meta tags Open Graph y Twitter Card.
- `index.html` incluye JSON-LD (Schema.org Person).
- `sitemap.xml` y `robots.txt` están en la raíz.
