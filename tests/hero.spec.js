// @ts-check

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

    test("founder card renders with name, title, and photo placeholder", async ({page}) => {
        await page.goto("/index.html");

        const founderSection = page.locator("#founder");
        await expect(
            founderSection.getByRole("heading", {name: "Founder"}),
        ).toBeVisible();
        await expect(founderSection).toContainText("Vadym Tyemirov");
        await expect(founderSection).toContainText(
            "Technical Founder & Engineering Leader",
        );
        await expect(
            founderSection.getByRole("img", {name: "Founder photo placeholder"}),
        ).toBeVisible();
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

    test("footer respects non-sticky configuration", async ({page}) => {
        await page.goto("/index.html");

        const footerHost = page.locator("mpr-footer");
        const footerRoot = page.locator('mpr-footer footer[data-mpr-footer="root"]');

        await expect(footerRoot).toHaveAttribute("data-mpr-sticky", "false");
        await expect(footerHost).not.toHaveClass(/mpr-footer/);

        const hostPosition = await footerHost.evaluate(
            (element) => window.getComputedStyle(element).position,
        );
        const rootPosition = await footerRoot.evaluate(
            (element) => window.getComputedStyle(element).position,
        );

        expect(hostPosition).toBe("static");
        expect(rootPosition).toBe("static");

        const viewportHeight = await page.evaluate(() => window.innerHeight);

        await page.evaluate(() => window.scrollTo(0, 0));
        const topAtTop = await footerRoot.evaluate(
            (element) => element.getBoundingClientRect().top,
        );

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const topAtBottom = await footerRoot.evaluate(
            (element) => element.getBoundingClientRect().top,
        );

        expect(topAtTop).toBeGreaterThan(viewportHeight);
        expect(topAtBottom).toBeLessThanOrEqual(viewportHeight);
    });

    test("footer adheres to the site color palette", async ({page}) => {
        await page.goto("/index.html");

        const footerRoot = page.locator('mpr-footer footer[data-mpr-footer="root"]');
        await expect(footerRoot).toBeVisible();

        const palette = await page.evaluate(() => {
            const footer = document.querySelector("mpr-footer footer[data-mpr-footer='root']");
            const host = document.querySelector("mpr-footer");
            if (!footer) {
                throw new Error("Footer root not found");
            }
            if (!host) {
                throw new Error("Footer host not found");
            }

            const hexToRgb = value => {
                const trimmed = value.trim();
                if (!trimmed) return "";
                if (trimmed.startsWith("rgb")) return trimmed;
                const hex = trimmed.replace("#", "");
                const normalized = hex.length === 3 ? hex.split("").map(char => char + char).join("") : hex;
                const num = parseInt(normalized, 16);
                const r = (num >> 16) & 255;
                const g = (num >> 8) & 255;
                const b = num & 255;
                return `rgb(${r}, ${g}, ${b})`;
            };

            const documentStyles = window.getComputedStyle(document.documentElement);
            const footerStyles = window.getComputedStyle(footer);
            const hostStyles = window.getComputedStyle(host);

            const expectedBackground = hexToRgb(documentStyles.getPropertyValue("--bg-panel"));
            const expectedText = hexToRgb(documentStyles.getPropertyValue("--text-gold-strong"));
            const expectedAccent = documentStyles.getPropertyValue("--accent-gold").trim();
            const expectedBorder = documentStyles.getPropertyValue("--accent-outline").trim();

            return {
                expectedBackground,
                actualBackground: footerStyles.backgroundColor,
                expectedText,
                actualText: footerStyles.color,
                expectedAccent,
                hostAccent: hostStyles.getPropertyValue("--mpr-color-accent").trim(),
                expectedBorder,
                hostBorder: hostStyles.getPropertyValue("--mpr-color-border").trim()
            };
        });

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
