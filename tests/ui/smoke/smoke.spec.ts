import { test, expect } from "@playwright/test";

test("smoke: baseURL + env params are loaded", async ({ page }, testInfo) => {
    // Proves env is loaded (from .env.local / .env via playwright.config.ts)
    console.log("ENV =", process.env.ENV);
    console.log("BASE_URL =", process.env.BASE_URL);
    console.log("USE_STORAGE_STATE =", process.env.USE_STORAGE_STATE);
    console.log("Project =", testInfo.project.name);

    // Proves baseURL is working because we navigate with a relative path
    await page.goto("/");

    // Very stable assertion for this demo site
    await expect(page).toHaveTitle(/Practice Software Testing/i);

    // Bonus: assert a common visible text snippet (works well on this site)
    await expect(page.getByText("DEMO", { exact: false })).toBeVisible();
});
