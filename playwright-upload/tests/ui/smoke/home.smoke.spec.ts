import { test, expect } from "@playwright/test";
import { HomePage } from "../../../src/pages/HomePage.js";

test("home: smoke - loads and shows primary navigation", async ({ page }) => {
    const home = new HomePage(page);

    await home.open();

    // Basic sanity: URL is home
    await expect(page).toHaveURL(/\/$/);

    // Nav items should be visible (stable checks)
    await expect(home.signInLink).toBeVisible();
    await expect(home.contactLink).toBeVisible();
    await expect(home.categoriesButton).toBeVisible();
});
