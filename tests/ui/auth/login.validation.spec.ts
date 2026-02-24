import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../../../src/pages/LoginPage.js';
import { HomePage } from '../../../src/pages/HomePage.js';

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
        test.skip(true, 'Cloudflare challenge shown on public demo site.');
    }
}

// Helper to open login screen via home
async function openLogin(page: Page) {
    const home = new HomePage(page);
    await home.open();
    await home.goToSignIn();
    const login = new LoginPage(page);
    await login.assertLoaded();
    return login;
}

// Successful login use env vars defined in repo (same as existing tests)
test('login: user can login with valid credentials', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL!;
    const password = process.env.E2E_USER_PASSWORD!;

    const login = await openLogin(page);
    await skipIfCloudflare(page);

    await login.login(email, password);
    await skipIfCloudflare(page);

    // On success the app navigates to /account
    await expect(page).toHaveURL(/\/account/);
});

// Incorrect password
test('login: fails with incorrect password and shows clear message', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL!;
    const badPassword = 'incorrect-password';

    const login = await openLogin(page);

    await login.login(email, badPassword);

    const err = await login.getFirstVisibleErrorText();
    expect(err.toLowerCase(), 'Expected specific error for incorrect password').toContain('password');
});

// Unknown email
test('login: fails with unknown email and shows clear message', async ({ page }) => {
    const unknown = `no-such-user+${Date.now()}@example.com`;

    const login = await openLogin(page);

    await login.login(unknown, 'whatever');

    const err = await login.getFirstVisibleErrorText();
    expect(err.toLowerCase(), 'Expected specific error for unknown email').toMatch(/(not found|unknown|no user|no account|invalid email)/);
});

// Disabled account - optional: skip if DISABLED_USER_EMAIL not configured
const disabledEmail = process.env.DISABLED_USER_EMAIL;
if (disabledEmail) {
    test('login: fails with disabled account and shows clear message', async ({ page }) => {
        const login = await openLogin(page);

        await login.login(disabledEmail, process.env.DISABLED_USER_PASSWORD || 'password');

        const err = await login.getFirstVisibleErrorText();
        expect(err.toLowerCase(), 'Expected specific error for disabled account').toMatch(/(disabled|deactivated|suspended|not active)/);
    });
} else {
    test.skip(true, 'DISABLED_USER_EMAIL not provided');
}
