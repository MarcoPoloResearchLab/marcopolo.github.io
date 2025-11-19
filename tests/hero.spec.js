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
});
