# ISSUES
**Append-only section-based log**

Entries record newly discovered requests or changes, with their outcomes. No instructive content lives here. Read @NOTES.md for the process to follow when fixing issues.

Read @AGENTS.md, @AGENTS.DOCKER.md, @AGENTS.FRONTEND.md, @AGENTS.GIT.md, @POLICY.md, @NOTES.md, @README.md and @ISSUES.md. Start working on open issues. Work autonomously and stack up PRs.

Each issue is formatted as `- [ ] [<ID>-<number>]`. When resolved it becomes -` [x] [<ID>-<number>]`

## Features (100-199)

- [x] [MP-100] Replaced the sketch-based hero with the inline hero video (muted by default with an audio toggle) and refreshed the favicon using the provided JPEG source.
- [x] [MP-101] Changed the global theme to dark turquoise with golden typography, updating hero/sections/cards/buttons accordingly.
- [x] [MP-102] Integrated the declarative `<mpr-footer>` from mpr-ui (non-sticky, no theme switch) plus lab-wide quick links.
- [ ] [MP-103] Restructure landing page into four product bands

  Summary
  - Rebuild the entire landing page information architecture (below the hero) around four top-level sections: Research, Tools, Platform, Products.
  - Keep the existing hero (video + sound toggle) and footer behavior unchanged and covered by Playwright tests.
  - Present all lab projects as cards grouped under these four sections.

  Requirements (locked in)
  - Information architecture
    - Replace the current “About / Projects / Contact” content with four section bands: Research, Tools, Platform, Products.
    - Each section appears as a wide, full-width band on a single scrolling page.
    - Each band contains one or more project cards; there are no sliders, carousels, or auto-scrolling behaviors.
  - Visual design
    - Preserve the current cyberpunk/dark-turquoise + gold global theme.
    - Give each of the four sections a distinct color band treatment (background and/or accent variation) while staying within the existing palette.
    - Cards are visually distinct from their band (panel on top of band) and use rounded corners.
  - Card model
    - Each project is rendered as a standardized card containing:
      - Project name
      - Global project description (short text)
      - Project status: one of WIP, Beta, Production (rendered as a badge/label).
  - Data source
    - Introduce a structured JSON catalog (for example `data/projects.json`) as the single source of truth for the landing page.
    - Each project entry in the catalog must include at least: `name`, `description`, `status`, `category` (Research/Tools/Platform/Products), and a link field (for example `url`).
    - The page renders project cards by reading this catalog; project cards are not hard-coded into `index.html`.
  - Initial project mapping (subject to refinement)
    - Research: ISSUES.md, PhotoLab
    - Tools: ctx, gix, ghttp
    - Platform: Loopaware, Pinguin, ETS, TAuth, Ledger
    - Products: ProductScanner, Sheet2Tube, Gravity Notes, RSVP
  - Testing / acceptance
    - Existing hero and footer tests continue to pass unchanged.
    - New or updated Playwright coverage asserts:
      - Presence of section headings “Research”, “Tools”, “Platform”, “Products”.
      - At least one project card rendered under each of those headings, driven by the JSON catalog.
      - Every rendered card shows a name, description, and status badge, and either a working link or an explicit “coming soon” style when configured.

  TODOs / open decisions
  - Project inventory and metadata
    - Finalize the full set of projects that must appear on this page (beyond the initial list above).
    - For each project, provide:
      - Canonical display name (including exact casing and spacing).
      - Canonical URL (app, docs, GitHub) or an explicit indication that it is not yet public.
      - Final category assignment (Research, Tools, Platform, Products), especially for borderline cases.
      - Final status (WIP, Beta, Production).
      - Short, approved description text (one to two sentences, consistent tone).
  - JSON schema details
    - Lock down the exact schema for the JSON catalog (for example `data/projects.json`):
      - Field names and allowed values (`category`, `status` and so on).
      - Any optional fields we want to support now (for example `tags`, `iconId`, `repoUrl`) to avoid immediate schema churn.
    - Decide whether the JSON is:
      - Fetched at runtime (for example `fetch("/data/projects.json")`), or
      - Imported as a static JavaScript module (if we want tighter typing and fewer runtime fetches).
  - Layout and navigation
    - Confirm the order of section bands on the page (for example Research → Tools → Platform → Products).
    - Decide how cards are ordered within each section (curated order, alphabetical, status-priority, and so on).
    - Decide what happens to the contact content:
      - Stays as a distinct “Contact” band below the four sections, or
      - Is integrated into one of the sections (for example a card or block in Products or Platform).
    - Decide whether to add navigation or jump links (from the hero or header) to scroll to each section, and confirm the link labels.
  - Visual nuances
    - Clarify whether each section band needs its own short description text under the heading (for example “Research: explorations and lab notes”) or just the heading and cards.
    - Decide on icon or animation strategy for cards:
      - Reuse existing Three.js or canvas icons where they exist, or
      - Move to simpler static icons or text-only cards for consistency.
  - Empty or placeholder behavior
    - Define how to render projects that are WIP or not yet public:
      - Visual style and wording for “coming soon” versus disabled link.
    - Define how to handle a section that temporarily has few or no projects (for example show “More coming soon” versus hide the section).

## Improvements (200–299)

- [x] [MP-200] Hero text/CTA now lives below the video with refreshed cyberpunk styling so the motion stays unobstructed.
- [x] [MP-201] Swapped in the new hero video (web-optimized MP4) and refreshed fonts (Orbitron + Space Grotesk) to match the cyberpunk aesthetic.

## BugFixes (300–399)

- [x] [MP-300] Footer stickiness came from the host element carrying `class="mpr-footer"`, so CDN CSS kept the host sticky while `sticky="false"` only toggled the internal footer; dropped the host class so the data-mpr-sticky override applies and added Playwright coverage for the non-sticky flow.

```<mpr-footer
      class="mpr-footer"
      sticky="false"
```

## Maintenance (400–499)

- [x] [MP-400] Added `docker-compose.yml` + `.env.ghttp` to run the site through `ghcr.io/temirov/ghttp` and documented the workflow in README.
- [x] [MP-401] Added the full Node-based toolchain (`package.json`, ESLint, Stylelint, Playwright) plus Makefile targets so `make lint`, `make test`, and `make ci` all succeed.
- [x] [MP-402] Re-encoded the hero video to a 1280px, fast-start MP4 (~2.7 MB) and stored it as `assets/hero-loop.mp4` so the hero loads quickly on the web without the conspicuous filename.
- [ ] [MP-403] Data gathering
      - Scan ~/Development subfolders folder with depth 2
      - Find 
            - Research: ISSUES.md, PhotoLab
            - Tools: ctx, gix, ghttp
            - Platform: Loopaware, Pinguin, ETS, TAuth, Ledger
            - Products: ProductScanner, Sheet2Tube, Gravity Notes, RSVP
      - For each project, provide:
            - Canonical display name (including exact casing and spacing).
            - Canonical URL (app, docs, GitHub) or an explicit indication that it is not yet public.
            - Final category assignment (Research, Tools, Platform, Products), especially for borderline cases.
            - Final status (WIP, Beta, Production).
            - Short, approved description text (one to two sentences, consistent tone).
      - Populate @projects.yml to the best of your abilities

## Planning 
**Do not work on these, not ready**
