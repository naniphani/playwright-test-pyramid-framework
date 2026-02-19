import { test, expect, Page } from "@playwright/test";
import { LoginPage } from "../../../src/pages/LoginPage.js";
import { Header } from "../../../src/components/Header.js";

async function skipIfCloudflare(page: Page) {
    const hasTurnstileFrame = await page
        .locator('iframe[src*="challenges.cloudflare.com"]')
        .first()
        .isVisible()
        .catch(() => false);

    const hasVerifyHumanText = await page
        .getByText(/verify you are human/i)
        .isVisible()
        .catch(() => false);

    const hasRayId = await page
        .getByText(/Ray ID:/i)
        .isVisible()
        .catch(() => false);

    if (hasTurnstileFrame || hasVerifyHumanText || hasRayId) {
        test.skip(true, "Cloudflare challenge shown on public demo site.");
    }
}

test("auth: customer can login and logout", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL!;
    const password = process.env.E2E_USER_PASSWORD!;

    const login = new LoginPage(page);
    await login.openViaHome();
    await skipIfCloudflare(page);

    await login.login(email, password);
    await skipIfCloudflare(page);

    // Assert logged in (this may fail if Cloudflare blocked redirect)
    await expect(page).toHaveURL(/\/account/);

    const header = new Header(page);
    await skipIfCloudflare(page);

    await header.logout();
    await skipIfCloudflare(page);

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
});
