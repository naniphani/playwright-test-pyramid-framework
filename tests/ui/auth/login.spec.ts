import { test, expect, Page } from "@playwright/test";
import { LoginPage } from "../../../src/pages/LoginPage.js";

// Helper copied from existing login-logout test to avoid flakes against
// the public demo site (Cloudflare sometimes blocks automated traffic).
async function skipIfCloudflare(page: Page) {
    const hasTurnstileFrame = await page
        .locator('iframe[src*="challenges.cloudflare.com"]')
        .first()
        .isVisible()
        .catch(() => false);

    if (hasTurnstileFrame) {
        test.skip(true, "Cloudflare challenge shown on public demo site.");
    }
}

// A very small smoke scenario that exercises the login page object.
test("auth: user can login using page object model", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL ?? "";
    const password = process.env.E2E_USER_PASSWORD ?? "";
    expect(email, "E2E_USER_EMAIL is required for this test").toBeTruthy();
    expect(password, "E2E_USER_PASSWORD is required for this test").toBeTruthy();

    const login = new LoginPage(page);
    await login.openViaHome();
    await skipIfCloudflare(page);

    await login.login(email, password);
    await skipIfCloudflare(page);

    // after successful login we expect to land on the account page
    await expect(page).toHaveURL(/\/account/);
    // verify some account-specific element is visible as a sanity check
    await expect(page.getByRole("heading", { name: /my account/i })).toBeVisible();
});
