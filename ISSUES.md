# ISSUES
**Append-only section-based log**

Entries record newly discovered requests or changes, with their outcomes. No instructive content lives here. Read @NOTES.md for the process to follow when fixing issues.

Read @AGENTS.md, @AGENTS.DOCKER.md, @AGENTS.FRONTEND.md, @AGENTS.GIT.md, @POLICY.md, @NOTES.md, @README.md and @ISSUES.md. Start working on open issues. Work autonomously and stack up PRs.

Each issue is formatted as `- [ ] [<ID>-<number>]`. When resolved it becomes -` [x] [<ID>-<number>]`

## Features (100-199)

- [x] [MP-100] Replaced the sketch-based hero with the inline hero video (muted by default with an audio toggle) and refreshed the favicon using the provided JPEG source.

## Improvements (200–299)

- [ ] [MP-200] Relayout the hero text block so it sits below the video canvas (unobstructed), matching the lighter cyberpunk/HUD aesthetic.

## BugFixes (300–399)

## Maintenance (400–499)

- [x] [MP-400] Added `docker-compose.yml` + `.env.ghttp` to run the site through `ghcr.io/temirov/ghttp` and documented the workflow in README.
- [x] [MP-401] Added the full Node-based toolchain (`package.json`, ESLint, Stylelint, Playwright) plus Makefile targets so `make lint`, `make test`, and `make ci` all succeed.
- [x] [MP-402] Re-encoded the hero video to a 1280px, fast-start MP4 (~2.7 MB) and stored it as `assets/hero-loop.mp4` so the hero loads quickly on the web without the conspicuous filename.

## Planning 
**Do not work on these, not ready**
