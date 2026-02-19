import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../src/pages/LoginPage.js";
import { GLOBAL } from "../../../config/global-constants.js";

test("setup: create customer storageState", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL ?? "";
    const password = process.env.E2E_USER_PASSWORD ?? "";
    expect(email, "Missing E2E_USER_EMAIL").toBeTruthy();
    expect(password, "Missing E2E_USER_PASSWORD").toBeTruthy();

    const loginPage = new LoginPage(page);
    await loginPage.openViaHome();
    await loginPage.login(email, password);

    // If Cloudflare/Turnstile appears, don't attempt to automate it.
    const turnstile = page.locator('iframe[src*="challenges.cloudflare.com"]');
    if (await turnstile.first().isVisible().catch(() => false)) {
        test.skip(true, "Cloudflare Turnstile shown; cannot automate reliably.");
    }

    await page.context().storageState({ path: GLOBAL.storage.customer });
});

