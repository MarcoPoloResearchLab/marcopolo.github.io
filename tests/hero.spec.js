// @ts-check

const {test, expect} = require("@playwright/test");

/** @type {{projects: Array<{name: string, status: string, category: string, description: string, url?: string|null}>}} */
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
            await expect(card.locator(".status-badge")).toHaveText(project.status);

            const action = card.locator("a.card-action");
            if (project.status === "WIP" || !project.url) {
                await expect(action).toHaveCount(0);
            } else {
                await expect(action).toHaveCount(1);
                await expect(action).toHaveAttribute("href", project.url);
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
});
