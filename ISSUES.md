# ISSUES
**Append-only section-based log**

Entries record newly discovered requests or changes, with their outcomes. No instructive content lives here. Read @NOTES.md for the process to follow when fixing issues.

Read @AGENTS.md, @AGENTS.DOCKER.md, @AGENTS.FRONTEND.md, @AGENTS.GIT.md, @POLICY.md, @NOTES.md, @README.md and @ISSUES.md. Start working on open issues. Work autonomously and stack up PRs.

Each issue is formatted as `- [ ] [<ID>-<number>]`. When resolved it becomes -` [x] [<ID>-<number>]`

## Features (100-199)

- [x] [MP-100] Replaced the sketch-based hero with the inline hero video (muted by default with an audio toggle) and refreshed the favicon using the provided JPEG source.
- [x] [MP-101] Changed the global theme to dark turquoise with golden typography, updating hero/sections/cards/buttons accordingly.
- [x] [MP-102] Integrated the declarative `<mpr-footer>` from mpr-ui (non-sticky, no theme switch) plus lab-wide quick links.
- [x] [MP-103] Restructure landing page into four product bands

  Summary
  - Rebuild the entire landing page information architecture (below the hero) around four top-level sections: Research, Tools, Platform, Products.
  - Keep the existing hero (video + sound toggle) and footer behavior unchanged and covered by Playwright tests.
  - Present all lab projects as cards grouped under these four sections.

  Requirements (locked in)
  - Information architecture
    - Replace the current “About / Projects / Contact” content with four section bands: Research, Tools, Platform, Products.
    - Section bands appear in the order: Research → Tools → Platform → Products.
    - Each section appears as a wide, full-width band on a single scrolling page.
    - Each band contains one or more project cards; there are no sliders, carousels, or auto-scrolling behaviors.
    - The page remains a simple scrollable layout without additional section navigation or jump-link menus; users discover content by scrolling.
  - Visual design
    - Preserve the current cyberpunk/dark-turquoise + gold global theme.
    - Give each of the four sections a distinct color band treatment (background and/or accent variation) while staying within the existing palette.
    - Each section band contains a single heading and its project cards; there is no additional per-section body copy.
    - Cards are visually distinct from their band (panel on top of band) and use rounded corners.
    - Project visuals use simple static icons or screenshots; the section cards do not introduce new Three.js or canvas-based animations.
  - Card model
    - Each project is rendered as a standardized card containing:
      - Project name
      - Global project description (short text)
      - Project status: one of WIP, Beta, Production (rendered as a badge/label).
    - Within each section, cards are ordered by status from Production to Beta to WIP (rendered right to left in the visual layout).
  - Contact and interactions
    - For projects in Production, the primary card action links directly to the live product surface (app or hosted UI), and that product surface owns detailed contact information; the landing page does not duplicate contact channels.
    - For projects in Beta, the primary card action also links to the live product surface but surfaces the “Beta” status clearly on the card.
    - For projects in WIP, the status badge (“WIP”) is a clear but non-interactive label; WIP cards do not expose a primary external link and instead communicate that the project is under active development.
    - Projects without a public app URL never show a primary external link; their card relies on the WIP status and description as the call to action instead of a disabled button or generic “coming soon” label.
  - Data source
    - Use `data/projects.json` as the single source of truth for the landing page.
    - Each project entry in the catalog must include at least: `name`, `description`, `status`, `category` (Research/Tools/Platform/Products), and a link field (for example `url`).
    - The page renders project cards by reading this catalog; project cards are not hard-coded into `index.html`.
    - Every section band must have at least one project in the catalog so no section renders empty.
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
  Outcome
  - Created `data/projects.json`, rebuilt the four section bands to render cards from the catalog (status-sorted with static visuals), and added Playwright assertions for headings, cards, and link behavior.

- [x] [MP-104] add an ability to visually flip the card and show the back of the card. we will embed a form from LoppAware to subscribe tio the news there later, but I want the cards with BETA and WIP status to flip when clicked on
      - Implemented flippable card markup/CSS and JS so Beta and WIP cards toggle an `is-flipped` state on click/keyboard while Production cards remain static, and extended Playwright coverage to assert the behavior.
- [ ] [MP-105] LoopAware-powered feedback widget
      - Integrate a LoopAware widget that lets visitors send structured feedback (text + contact details) straight from the landing page footer without jumping to another product surface.
      - Current difficulties: the LoopAware embed we ship today is hard-coded for “subscribe” flows (email-only, no free-form message fields), and the script instance assumes each card maps to a LoopAware property, so there is no single endpoint or schema for a global “site feedback” inbox. We need a LoopAware template that supports multi-field submissions plus a consolidated destination before wiring it into the footer drop-up.

## Improvements (200–299)

- [x] [MP-200] Hero text/CTA now lives below the video with refreshed cyberpunk styling so the motion stays unobstructed.
- [x] [MP-201] Swapped in the new hero video (web-optimized MP4) and refreshed fonts (Orbitron + Space Grotesk) to match the cyberpunk aesthetic.
- [ ] [MP-202] LoopAware-powered subscriptions for WIP cards
      - On project cards with status WIP, make the WIP badge clickable so the card visually flips as if turned over and reveals a "subscribe to updates" surface.
      - Embed the subscribe form from the LoopAware project (widget or inline form) so visitors can subscribe to news about that specific project without leaving the page.
      - Decide whether each project maps to its own LoopAware site identifier or whether all WIP cards share a single "lab updates" subscription list, and document that mapping.
      - Extend Playwright coverage to assert that WIP cards expose a working subscription surface and that Production/Beta cards continue to behave as in MP-103.
- [x] [MP-203] Band order in HTML does not match SECTION_ORDER constant in JavaScript — Fixed by reordering `<mpr-band>` elements in `index.html` to match MP-103 canonical order: Research → Tools → Platform → Products.
      - `index.html` declares bands in visual order: Tools → Platform → Products → Research
      - `script.js:28-33` defines `SECTION_ORDER = ["Research", "Tools", "Platform", "Products"]`
      - The mismatch causes no functional bug (cards render correctly because JS iterates bands by `data-band-category` attribute), but it creates maintainability confusion when reasoning about section ordering.
      - Fix option A: Reorder `<mpr-band>` elements in `index.html` to match `SECTION_ORDER` (Research → Tools → Platform → Products).
      - Fix option B: Reorder `SECTION_ORDER` in `script.js` to match the intended visual order (Tools → Platform → Products → Research).
      - Decide which order is canonical per MP-103 requirements ("Research → Tools → Platform → Products") and align both files.
- [ ] [MP-204] Subscribe iframe uses `tabindex="-1"`, potentially blocking keyboard-only users from interacting with the LoopAware form
      - Location: `script.js:159` sets `subscribeFrame.setAttribute("tabindex", "-1")`
      - Current behavior: The iframe cannot receive focus via Tab navigation, which may prevent keyboard users from entering email or submitting the subscribe form.
      - Rationale for current code: Likely added to prevent focus from jumping into the iframe during card flip animation or while card is not flipped.
      - Fix: Conditionally set `tabindex="0"` on the iframe when the card enters the flipped state (`is-flipped` class added) and restore `tabindex="-1"` when unflipped. Update the `toggleFlip` handler in `script.js:207-225` to toggle the iframe's tabindex alongside the flip state.
      - Extend Playwright test `subscribe-enabled cards render LoopAware forms after flipping` to assert that the iframe is focusable (`tabindex="0"`) when the card is flipped.

## BugFixes (300–399)

- [x] [MP-300] Footer stickiness came from the host element carrying `class="mpr-footer"`, so CDN CSS kept the host sticky while `sticky="false"` only toggled the internal footer; dropped the host class so the data-mpr-sticky override applies and added Playwright coverage for the non-sticky flow.

```<mpr-footer
      class="mpr-footer"
      sticky="false"
```

- [x] [MP-301] Footer host element has `position: relative` instead of `position: static`, causing Playwright test `footer respects non-sticky configuration` to fail — Fixed by adding `position: static !important` to override mpr-ui CDN defaults in `styles.css:538`.
      - Test location: `tests/hero.spec.js:109`
      - Expected: `position: static` on `mpr-footer` host element
      - Actual: `position: relative`
      - Root cause: The mpr-ui CDN stylesheet likely sets `position: relative` on the `mpr-footer` custom element, and our local `styles.css:536-541` does not explicitly override it to `static`.
      - Fix: Add `position: static;` to the `mpr-footer { ... }` rule block in `styles.css` at line 536 to ensure the host element is not positioned, regardless of CDN defaults.
      - Verify fix passes: `npx playwright test --grep "footer respects non-sticky"`.

## Maintenance (400–499)

- [x] [MP-400] Added `docker-compose.yml` + `.env.ghttp` to run the site through `ghcr.io/temirov/ghttp` and documented the workflow in README.
- [x] [MP-401] Added the full Node-based toolchain (`package.json`, ESLint, Stylelint, Playwright) plus Makefile targets so `make lint`, `make test`, and `make ci` all succeed.
- [x] [MP-402] Re-encoded the hero video to a 1280px, fast-start MP4 (~2.7 MB) and stored it as `assets/hero-loop.mp4` so the hero loads quickly on the web without the conspicuous filename.
- [x] [MP-403] Data gathering
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
- [ ] [MP-404] I am using bands in the design of @index.html. I want to add bands web components to mpr-ui (symlinked under @tools/mpr-ui) and use these components from mpr-ui CDN.
Deliverables:
1. <mpr-band> web component added to mpr-ui. A PR is open in mpr-ui repo
2. <mpr-band> web component provides sufficient cuastimization options using declarative syntax
3. mpr-ui is loaded from the CDN in @index.html
- [x] [MP-405] Consolidated all imagery, videos, and favicons under a canonical `assets/` tree: created `assets/site/` for hero media, fonts, favicons, and brand imagery, standardized project icons as `assets/projects/<project-id>/icon.(svg|png)` while keeping raw files in per-project `brand/` subfolders, and refreshed `index.html`/README references accordingly.
- [x] [MP-406] Rebranded Product Scanner to **Poodle Scanner**, refreshed its description in `data/projects.(json|yml)`, and shipped the ProductScanner repo’s Poodle mark at `assets/projects/product-scanner/icon.png`.
- [x] [MP-407] Normalized every raster project logo to 64×64 (storing the original favicons inside each `brand/` folder), resized the new Poodle icon from the 2048px source, and published `docs/assets-report.md` to document sizes + sources.
- [x] [MP-408] Embedded the LoopAware subscribe widget on the LoopAware project card back face, restyled it to match the lab palette, and wired the flipping logic/tests so beta-style cards can host future LoopAware subscribe mounts.
- [ ] [MP-409] PLAN.md is tracked in git history, violating AGENTS.GIT.md workflow rules
      - AGENTS.GIT.md line 47 states: "PLAN.md is intentionally ignored in .gitignore; ensure it never appears in commits."
      - Current state: `PLAN.md` was committed in branch `feature/MP-104-flippable-cards` and is visible in `git diff master...HEAD -- PLAN.md`.
      - Root cause: `.gitignore` is missing the `PLAN.md` entry.
      - Fix steps:
        1. Add `PLAN.md` to `.gitignore` (append at end of file).
        2. Remove PLAN.md from git tracking: `git rm --cached PLAN.md`.
        3. Commit the `.gitignore` update and removal.
        4. If PLAN.md must be purged from history (per AGENTS.GIT.md guidance), run: `git filter-repo --path PLAN.md --invert-paths` — but note this rewrites history and is forbidden by AGENTS.GIT.md ("Never use git push --force, git rebase..."). Safer alternative: leave the historical commit as-is and ensure future commits exclude PLAN.md.
      - Verify: `git status` should show PLAN.md as untracked after fix.
- [ ] [MP-410] Double blank line before DOMContentLoaded listener in script.js
      - Location: `script.js:469-470` has two consecutive blank lines before `document.addEventListener("DOMContentLoaded", ...)`.
      - AGENTS.FRONTEND.md requires tidy code without dead code or duplicate logic; while not a functional issue, the extra blank line is a style inconsistency.
      - Fix: Remove one of the two blank lines at `script.js:469` so only a single blank line separates the `setupHeroAudioToggle` function from the `DOMContentLoaded` listener.

## Planning
**Do not work on these, not ready**
