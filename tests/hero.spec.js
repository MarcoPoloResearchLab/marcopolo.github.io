// @ts-check

const {test, expect} = require("@playwright/test");

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

    test("project gallery showcases flagship apps", async ({page}) => {
        await page.goto("/index.html");

        await expect(page.getByRole("heading", {name: "Social Threader"})).toBeVisible();
        await expect(page.getByRole("heading", {name: "LLM Crossword"})).toBeVisible();
        await expect(page.getByRole("link", {name: "Discover Our Work"})).toBeVisible();
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
