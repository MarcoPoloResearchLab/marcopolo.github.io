# Asset re-org plan

- Audit existing images, favicons, and hero media to identify anything that lives outside the canonical `assets/` tree or follows inconsistent naming.
- Consolidate everything under `assets/` with predictable buckets (`site/`, `favicons/`, `projects/<project-id>/...`) and keep per-project raw files in `brand/` folders.
- Update `index.html`, `data/projects.json`, and docs to reference the new locations, then run the Playwright suite to ensure the site still loads and renders correctly.
- Audit image sizes/dimensions (`docs/assets-report.md`) and keep oversized originals in `brand/` folders while exporting right-sized icons (e.g., 512px Poodle Scanner).
