# marcopolo.github.io

Landing page for Marco Polo Research Lab.

The site ships a data-driven hero and project gallery built with semantic HTML, web components from `mpr-ui`, vanilla CSS, and Alpine-powered behaviors in `script.js`. Static assets now live under a consistent `assets/` hierarchy so projects, site chrome, and favicons pull from predictable locations.

You can open `index.html` directly in your browser or serve the site through GitHub Pages.

## Structure

- `index.html` – main page with the hero video, CTA, `<mpr-band>` project sections, and the lab footer.
- `script.js` – fetches `data/projects.json`, renders the project cards, and wires up interactive affordances such as the LoopAware-ready flip state.
- `styles.css` – layout, typography, and per-band styling.
- `data/projects.json` – canonical catalog that drives the landing page and tests.
- `assets/` – canonical home for static assets:
  - `assets/site/` – hero video, fonts, favicon bundle, and Marco Polo brand imagery
  - `assets/projects/<project-id>/icon.(png|svg)` – project card icons plus any extra brand files under `assets/projects/<project-id>/brand/`

## Local Development with Docker Compose

Run the static site behind the [gHTTP](https://github.com/temirov/ghttp) server via Docker Compose:

1. Ensure Docker (with the Compose plugin) is installed locally.
2. Update `.env.ghttp` if you need to change the bind address, exposed port, or container serve path.
3. Start the stack from the repo root:

   ```bash
   docker compose --env-file .env.ghttp up
   ```

   The site is available at `http://localhost:8080` by default (matching `HOST_HTTP_PORT`).

4. Press `Ctrl+C` or run `docker compose --env-file .env.ghttp down` to stop the server.

The Compose stack mounts the repository into the container (`ghcr.io/temirov/ghttp:latest`) read-only, so changes to local files are reflected immediately without rebuilding the image.

## Tooling & Tests

Install JavaScript tooling once per clone:

```bash
npm install
```

The Makefile exposes the required workflows:

- `make lint` – runs ESLint on `script.js` plus Playwright specs and Stylelint on `styles.css`.
- `make test` – launches a static server via `http-server` and executes the Playwright scenarios in `tests/`.
- `make ci` – runs lint + tests (the same command GitHub Actions will invoke).

Playwright downloads Chromium automatically during `npm install`; the tests load `index.html` through the local static server to exercise the real hero/video behavior.

## Adding a New App

Each entry in the project gallery is powered by `data/projects.json`:

1. create a new `assets/projects/<project-id>/icon.(png|svg)` and keep any supporting references in `assets/projects/<project-id>/brand/`
2. add the project metadata to `data/projects.json`
3. open `index.html` locally or run `npm test` to ensure the Playwright suite exercises the new entry cleanly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
