import { Page, Locator, expect } from "@playwright/test";

export class CheckoutLoginPage {
    readonly page: Page;

    readonly email: Locator;
    readonly password: Locator;
    readonly submit: Locator;

    constructor(page: Page) {
        this.page = page;
        this.email = page.locator('[data-test="email"]');
        this.password = page.locator('[data-test="password"]');
        this.submit = page.locator('[data-test="login-submit"]');
    }

    /**
     * Gate: checkout may show login OR may already proceed to step-2.
     * Wait until ONE of the expected states is present.
     */
    async waitForLoginOrNextStep() {
        const proceed2 = this.page.locator('[data-test="proceed-2"]');

        await expect
            .poll(async () => {
                const onLogin = await this.email.isVisible().catch(() => false);
                const onStep2 = await proceed2.isVisible().catch(() => false);
                return onLogin || onStep2;
            }, { timeout: 15_000 })
            .toBeTruthy();
    }

    /**
     * Login only if login form is actually shown.
     */
    async loginIfShown(email: string, password: string) {
        await this.waitForLoginOrNextStep();

        const loginVisible = await this.email.isVisible().catch(() => false);
        if (!loginVisible) return; // already past login

        await this.email.fill(email);
        await this.password.fill(password);
        await this.submit.click();

        // After login, step-2 should appear
        await expect(this.page.locator('[data-test="proceed-2"]')).toBeVisible({ timeout: 15_000 });
    }
}
