// @ts-check

const crypto = require("crypto");
const {test, expect} = require("@playwright/test");

/** @type {{projects: Array<{name: string, status: string, category: string, description: string, launch: {enabled: boolean, url?: string}, docs: {enabled: boolean, url?: string}, subscribe: {enabled: boolean, script?: string}}>}} */
const catalog = require("../data/projects.json");

test.describe("Marco Polo Research Lab landing page", () => {
    test("hero video renders with accessible controls", async ({page}) => {
        await page.goto("/index.html");

        const video = page.locator("#hero-video");
        await expect(video).toBeVisible();
        await expect(video).toHaveJSProperty("muted", true);

        const toggle = page.locator("#hero-sound-toggle");
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    test("project bands render data-driven catalog", async ({page}) => {
        await page.goto("/index.html");

        for (const label of ["Research", "Tools", "Platform", "Products"]) {
            const section = page.locator(`[data-band-category='${label}']`);
            await expect(section.getByRole("heading", {name: label})).toBeVisible();
            await expect(section.locator(".project-card").first()).toBeVisible();
        }

        await expect(page.getByRole("link", {name: "Discover Our Work"})).toBeVisible();
    });

    test("project cards expose required metadata and links", async ({page}) => {
        await page.goto("/index.html");

        for (const project of catalog.projects) {
            const card = page
                .locator(".project-card")
                .filter({has: page.getByRole("heading", {name: project.name})});

            await expect(card).toContainText(project.description);
            await expect(card.locator(".status-badge").first()).toHaveText(project.status);

            const action = card.locator("a.card-action").first();
            const expectLaunchVisible =
                project.status !== "WIP" &&
                project.launch.enabled &&
                Boolean(project.launch.url);

            await expect(action).toHaveCount(expectLaunchVisible ? 1 : 0);
            if (expectLaunchVisible && project.launch.url) {
                await expect(action).toHaveAttribute("href", project.launch.url);
            }
        }
    });

    test("site favicon bundle uses the Marco Polo Research Lab mark", async ({page}) => {
        await page.goto("/index.html");

        const manifestResponse = await page.request.get(
            "/assets/site/favicons/site.webmanifest",
        );
        expect(manifestResponse.ok()).toBe(true);
        const manifest = await manifestResponse.json();

        expect(manifest.name).toBe("Marco Polo Research Lab");
        expect(manifest.short_name).toBe("Marco Polo Research Lab");

        const faviconResponse = await page.request.get(
            "/assets/site/favicons/favicon-32x32.png",
        );
        expect(faviconResponse.ok()).toBe(true);
        const faviconBytes = await faviconResponse.body();
        const faviconDigest = crypto
            .createHash("sha256")
            .update(faviconBytes)
            .digest("hex");

        expect(faviconDigest).toBe(
            "b9739af96f3c938960b75bdf51ff3dc5f692f8ba16d693f8b2e1374d3f73b570",
        );
    });

    test("founder card renders with name, title, and photo", async ({page}) => {
        await page.goto("/index.html");

        const founderSection = page.locator("#founder");
        await expect(
            founderSection.getByRole("heading", {name: "Founder"}),
        ).toBeVisible();
        await expect(founderSection).toContainText("Vadym Tyemirov");
        await expect(founderSection).toContainText(
            "Technical Founder & Engineering Leader",
        );

        const founderPhoto = founderSection.getByAltText("Founder photo");
        await expect(founderPhoto).toBeVisible();
        await expect(founderPhoto).toHaveAttribute(
            "src",
            /assets\/site\/imagery\/founder\/vadym-tyemirov-360\.jpg$/,
        );

        const photoLoaded = await founderPhoto.evaluate((element) => {
            if (!(element instanceof HTMLImageElement)) return false;
            return element.complete && element.naturalWidth > 0;
        });
        expect(photoLoaded).toBe(true);
    });

    test("beta and WIP cards flip while production cards remain static", async ({page}) => {
        await page.goto("/index.html");

        for (const project of catalog.projects) {
            const card = page
                .locator(".project-card")
                .filter({has: page.getByRole("heading", {name: project.name})});

            await expect(card).toBeVisible();

            const initialClasses = await card.getAttribute("class");
            expect(initialClasses || "").not.toMatch(/is-flipped/);

            const badge = card.locator(".status-badge").first();
            await badge.click();

            const classesAfterClick = await card.getAttribute("class");

            const hasActiveSubscribe =
                project.subscribe.enabled &&
                Boolean(project.subscribe.script);
            const shouldFlip =
                project.status === "Beta" ||
                project.status === "WIP" ||
                hasActiveSubscribe;

            if (shouldFlip) {
                expect(classesAfterClick || "").toMatch(/is-flipped/);

                await badge.click();
                const classesAfterSecondClick = await card.getAttribute("class");
                expect(classesAfterSecondClick || "").not.toMatch(/is-flipped/);
            } else {
                expect(classesAfterClick || "").not.toMatch(/is-flipped/);
            }
        }
    });

    test("footer is sticky and remains visible while scrolling", async ({page}) => {
        await page.goto("/index.html");

        const footerHost = page.locator("mpr-footer");
        const footerRoot = page.locator('mpr-footer footer[data-mpr-footer="root"]');

        const stickyAttribute = await footerRoot.getAttribute("data-mpr-sticky");
        expect(stickyAttribute).not.toBe("false");
        await expect(footerHost).not.toHaveClass(/mpr-footer/);

        const rootPosition = await footerRoot.evaluate(
            (element) => window.getComputedStyle(element).position,
        );
        expect(rootPosition).toBe("fixed");

        const viewportHeight = await page.evaluate(() => window.innerHeight);

        const withinViewport = async () => {
            const rect = await footerRoot.evaluate((element) => {
                const {top, bottom} = element.getBoundingClientRect();
                return {top, bottom};
            });

            expect(rect.bottom).toBeGreaterThan(0);
            expect(rect.top).toBeLessThan(viewportHeight);
            expect(rect.bottom).toBeLessThanOrEqual(viewportHeight);
        };

        await page.evaluate(() => window.scrollTo(0, 0));
        await withinViewport();

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await withinViewport();
    });

    test("footer adheres to the site color palette", async ({page}) => {
        await page.goto("/index.html");

        const footerRoot = page.locator('mpr-footer footer[data-mpr-footer="root"]');
        await expect(footerRoot).toBeVisible();

        const readPalette = async () => page.evaluate(() => {
            const footer = document.querySelector("mpr-footer footer[data-mpr-footer='root']");
            const host = document.querySelector("mpr-footer");
            const paletteScope = document.body;
            if (!footer) {
                throw new Error("Footer root not found");
            }
            if (!host) {
                throw new Error("Footer host not found");
            }
            if (!paletteScope) {
                throw new Error("Body not found");
            }

            const normalizeCssColor = value => {
                const trimmed = value.trim();
                if (!trimmed) return "";
                const rgbaMatch = trimmed.match(
                    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)$/,
                );
                if (rgbaMatch) {
                    const r = Number(rgbaMatch[1]);
                    const g = Number(rgbaMatch[2]);
                    const b = Number(rgbaMatch[3]);
                    const a = Number(rgbaMatch[4]);
                    // CSS transitions can briefly yield alpha values very close to 1 (e.g., 0.984). Treat those
                    // as fully opaque so palette checks don't flake on startup animation timing.
                    if (a >= 0.98) return `rgb(${r}, ${g}, ${b})`;
                    const roundedAlpha = Math.round(a * 1000) / 1000;
                    return `rgba(${r}, ${g}, ${b}, ${roundedAlpha})`;
                }

                const rgbMatch = trimmed.match(
                    /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/,
                );
                if (rgbMatch) {
                    const r = Number(rgbMatch[1]);
                    const g = Number(rgbMatch[2]);
                    const b = Number(rgbMatch[3]);
                    return `rgb(${r}, ${g}, ${b})`;
                }

                const hexMatch = trimmed.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
                if (!hexMatch) return trimmed;

                const normalized = hexMatch[1].length === 3
                    ? hexMatch[1].split("").map(char => char + char).join("")
                    : hexMatch[1];
                const num = parseInt(normalized, 16);
                const r = (num >> 16) & 255;
                const g = (num >> 8) & 255;
                const b = num & 255;
                return `rgb(${r}, ${g}, ${b})`;
            };

            const resolveColorVariable = (scope, variableName, propertyName) => {
                const marker = document.createElement("span");
                marker.style.position = "absolute";
                marker.style.left = "-9999px";
                marker.style.top = "0";
                marker.style.visibility = "hidden";
                marker.style[propertyName] = `var(${variableName})`;
                if (propertyName.startsWith("border")) {
                    marker.style.borderStyle = "solid";
                    marker.style.borderWidth = "1px";
                }
                scope.appendChild(marker);
                const computed = window.getComputedStyle(marker)[propertyName];
                marker.remove();
                return normalizeCssColor(computed);
            };

            const documentStyles = window.getComputedStyle(paletteScope);
            const footerStyles = window.getComputedStyle(footer);

            const expectedBackground = normalizeCssColor(documentStyles.getPropertyValue("--bg-panel"));
            const expectedText = normalizeCssColor(documentStyles.getPropertyValue("--text-gold-strong"));
            const expectedAccent = resolveColorVariable(
                paletteScope,
                "--accent-gold",
                "color",
            );
            const expectedBorder = resolveColorVariable(
                paletteScope,
                "--accent-outline",
                "borderColor",
            );

            return {
                expectedBackground,
                actualBackground: normalizeCssColor(footerStyles.backgroundColor),
                expectedText,
                actualText: normalizeCssColor(footerStyles.color),
                expectedAccent,
                hostAccent: resolveColorVariable(host, "--mpr-color-accent", "color"),
                expectedBorder,
                hostBorder: resolveColorVariable(host, "--mpr-color-border", "borderColor")
            };
        });

        await expect
            .poll(
                async () => {
                    const palette = await readPalette();
                    return (
                        palette.actualBackground === palette.expectedBackground &&
                        palette.actualText === palette.expectedText &&
                        palette.hostAccent === palette.expectedAccent &&
                        palette.hostBorder === palette.expectedBorder
                    );
                },
                {timeout: 3000},
            )
            .toBe(true);

        const palette = await readPalette();

        expect(palette.actualBackground).toBe(palette.expectedBackground);
        expect(palette.actualText).toBe(palette.expectedText);
        expect(palette.hostAccent).toBe(palette.expectedAccent);
        expect(palette.hostBorder).toBe(palette.expectedBorder);
    });

    test("subscribe-enabled cards render LoopAware forms after flipping", async ({page}) => {
        const subscribeProjects = catalog.projects.filter(
            project =>
                project.subscribe.enabled &&
                Boolean(project.subscribe.script),
        );
        await page.goto("/index.html");

        for (const project of subscribeProjects) {
            const card = page
                .locator(".project-card")
                .filter({has: page.getByRole("heading", {name: project.name})});

            const badge = card.locator(".status-badge").first();
            const overlay = card.locator(".project-card-subscribe-overlay");
            const formContainer = card.locator(".subscribe-form-container");
            await expect(overlay).toHaveAttribute("data-subscribe-loaded", "false");

            await badge.click();

            // Form is rendered directly in the page (no iframe) via LoopAware subscribe.js
            const loopAwareForm = formContainer.locator("#mp-subscribe-form");
            await expect(loopAwareForm, `${project.name} LoopAware form should render`).toBeVisible();
            await expect(formContainer.locator("input[type='email']")).toBeVisible();
            await expect(
                formContainer.locator("button"),
                `${project.name} LoopAware widget should expose a CTA button`,
            ).toContainText(/subscribe|notify/i);

            await expect(overlay).toHaveAttribute("data-subscribe-loaded", "true");

            await badge.click();
        }
    });
});
