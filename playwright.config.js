// @ts-check

const { defineConfig } = require("@playwright/test");

const PORT = 41730;

module.exports = defineConfig({
    testDir: "./tests",
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        headless: true,
        viewport: {width: 1280, height: 720}
    }
});
