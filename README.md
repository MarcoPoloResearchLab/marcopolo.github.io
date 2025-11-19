# marcopolo.github.io

Landing page for Marco Polo Research Lab.

The home page features an animated hero section, an about overview and a gallery of our public apps.

This repository hosts the static website built with HTML, CSS and JavaScript. [Three.js](https://threejs.org/) is used to draw and animate the lab's logo and project icons.

You can open `index.html` directly in your browser or serve the site through GitHub Pages.

## Structure

- `index.html` – main page with hero section, about information and a gallery of apps
- `script.js` – initializes Three.js and animates the SVG assets
- `assets/` – fonts and SVG illustrations

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

Each entry in the project gallery consists of an SVG logo, a `<canvas>` element and a call to `initProjectAnimation()` in `script.js`. To add a new app:

1. create a new SVG logo in the `assets/` folder
2. add a project card in `index.html` following existing examples
3. reference the SVG from `script.js`

Vectorizing images or text to SVG can be done using the tools available in the [svg_tools](https://github.com/temirov/svg_tools) repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
