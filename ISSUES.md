# ISSUES
**Append-only section-based log**

Entries record newly discovered requests or changes, with their outcomes. No instructive content lives here. Read @NOTES.md for the process to follow when fixing issues.

Read @AGENTS.md, @AGENTS.DOCKER.md, @AGENTS.FRONTEND.md, @AGENTS.GIT.md, @POLICY.md, @NOTES.md, @README.md and @ISSUES.md. Start working on open issues. Work autonomously and stack up PRs.

Each issue is formatted as `- [ ] [<ID>-<number>]`. When resolved it becomes -` [x] [<ID>-<number>]`

## Features (100-199)

- [x] [MP-100] Replaced the sketch-based hero with the inline hero video (muted by default with an audio toggle) and refreshed the favicon using the provided JPEG source.
- [ ] [MP-101] Change the theme of the site to be dark torquise and golden: background is dark torquise, font is golden. Improvise.
- [ ] [MP-102] Add a non-sticky footer from mpr-ui with no theme switch
- [ ] [MP-103] Spit the site into 4 sections:
Research
Tools
Platform
Products

The design shall be somewhat similar to the spirit of Apple's design: clean, specaious but fitting everything on one page

I envision cards with rounded corners for every section

The cards DO NOT move but are arranged on a page to fit.

Research:
ISSUES.md
PhotoLab

Tools:
ctx
gix
ghttp

Platform:
Loopaware
Pinguin
ETS
TAuth
Ledger

Products:
ProductScanner
Sheet2Tube
Gravity Notes
RSVP

## Improvements (200–299)

- [x] [MP-200] Hero text/CTA now lives below the video with refreshed cyberpunk styling so the motion stays unobstructed.
- [x] [MP-201] Swapped in the new hero video (web-optimized MP4) and refreshed fonts (Orbitron + Space Grotesk) to match the cyberpunk aesthetic.

## BugFixes (300–399)

## Maintenance (400–499)

- [x] [MP-400] Added `docker-compose.yml` + `.env.ghttp` to run the site through `ghcr.io/temirov/ghttp` and documented the workflow in README.
- [x] [MP-401] Added the full Node-based toolchain (`package.json`, ESLint, Stylelint, Playwright) plus Makefile targets so `make lint`, `make test`, and `make ci` all succeed.
- [x] [MP-402] Re-encoded the hero video to a 1280px, fast-start MP4 (~2.7 MB) and stored it as `assets/hero-loop.mp4` so the hero loads quickly on the web without the conspicuous filename.

## Planning 
**Do not work on these, not ready**
