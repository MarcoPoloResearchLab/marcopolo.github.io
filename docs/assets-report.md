## Asset Inventory (generated 2025-02-14)

### Project card icons (logos)

All raster logos have been normalized to **64×64**; SVG icons remain vector-based.

| Project | Path | Format | Size (KB) | Dimensions | Notes |
| --- | --- | --- | --- | --- | --- |
| allergy-wheel | `assets/projects/allergy-wheel/icon.svg` | SVG | 29.4 | vector | Inline gradient illustration. |
| city-finder | `assets/projects/city-finder/icon.svg` | SVG | 37.5 | vector | SVG skyline. |
| countdown | `assets/projects/countdown/icon.svg` | SVG | 35.8 | vector | SVG calendar. |
| ctx | `assets/projects/ctx/icon.png` | PNG | 17.1 | 64×64 | Upscaled from the original 32px favicon; original lives in `brand/icon-source.png`. |
| ets | `assets/projects/ets/icon.svg` | SVG | 0.8 | vector | Minimal SVG lock. |
| ghttp | `assets/projects/ghttp/icon.png` | PNG | 17.1 | 64×64 | Upscaled from the 32px favicon; source retained in `brand/`. |
| gix | `assets/projects/gix/icon.png` | PNG | 17.1 | 64×64 | Upscaled from the 32px favicon; source retained in `brand/`. |
| gravity-notes | `assets/projects/gravity-notes/icon.png` | PNG | 4.5 | 64×64 | Uses existing 64px turquoise badge. |
| issues-md | `assets/projects/issues-md/icon.png` | PNG | 17.1 | 64×64 | Upscaled from the 32px favicon; source retained in `brand/`. |
| ledger | `assets/projects/ledger/icon.png` | PNG | 17.1 | 64×64 | Upscaled from the 32px favicon; source retained in `brand/`. |
| llm-crossword | `assets/projects/llm-crossword/icon.svg` | SVG | 33.9 | vector | SVG crossword grid. |
| loopaware | `assets/projects/loopaware/icon.svg` | SVG | 0.7 | vector | Minimal SVG arcs. |
| old-millionaire | `assets/projects/old-millionaire/icon.svg` | SVG | 30.5 | vector | SVG portrait. |
| photolab | `assets/projects/photolab/icon.svg` | SVG | 0.8 | vector | SVG aperture. |
| pinguin | `assets/projects/pinguin/icon.png` | PNG | 6.3 | 64×64 | Native 64px logo. |
| product-scanner | `assets/projects/product-scanner/icon.png` | PNG | 6.7 | 64×64 | Downscaled from 2048px “Poodle” artwork; master copy parked in `brand/poodle-scanner-logo.png`. |
| rsvp | `assets/projects/rsvp/icon.png` | PNG | 4.4 | 64×64 | Upscaled from 32px source; source retained in `brand/`. |
| sheet2tube | `assets/projects/sheet2tube/icon.svg` | SVG | 0.7 | vector | SVG sheet icon. |
| social-threader | `assets/projects/social-threader/icon.svg` | SVG | 29.0 | vector | SVG weave. |
| tauth | `assets/projects/tauth/icon.svg` | SVG | 0.6 | vector | SVG badge. |

### Notable raster assets (reference/brand only)

| Path | Size (KB) | Dimensions | Notes |
| --- | --- | --- | --- |
| `assets/projects/product-scanner/brand/poodle-scanner-logo.png` | 4206 | 2048×2080 | Canonical artwork for future exports. |
| `assets/projects/pinguin/brand/Gemini_Generated_Image_4mjlzi4mjlzi4mjl.png` | 4286 | 1920×2208 | Key art for marketing; not served on landing page. |
| `assets/projects/countdown/brand/Calendar Icon with Checkmark on Blue.png` | 1117 | 1024×1024 | Poster-style source. |
| `assets/projects/allergy-wheel/brand/*.png` | 180–1000 | 544–1120 | Character renders for future assets. |
| `assets/site/imagery/turquoise_golden_16x9.png` | 6.4 | 1600×900 | Background/wallpaper asset. |

### Takeaways

- Every PNG logo in `assets/projects/*/icon.png` is now 64×64, which matches how cards render them and keeps payloads predictable (~4–17 KB each).
- Original 32px favicons and oversized illustrations have been preserved under each project’s `brand/` folder so we can re-export higher fidelity versions later without digging through git history.
- SVG icons already scale without intervention; no changes were needed there. Large reference art stays sandboxed in `brand/` so it never bloats the production bundle.
