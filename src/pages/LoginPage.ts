import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
    readonly page: Page;

    readonly email: Locator;
    readonly password: Locator;
    readonly submit: Locator;

    readonly registerLink: Locator;

    // Generic error containers used in this app
    readonly formErrors: Locator;

    constructor(page: Page) {
        this.page = page;

        // Login Locators on the sign page
        this.email = page.locator('[data-test="email"]');
        this.password = page.locator('[data-test="password"]');
        this.submit = page.locator('[data-test="login-submit"]');

        // Link from login page -> register page
        this.registerLink = page.getByRole("link", { name: /register/i });

        // Common feedback selectors used across the demo app
        this.formErrors = page.locator('.invalid-feedback, .alert-danger, .text-danger');
    }

    async assertLoaded() {
        await expect(this.email).toBeVisible();
        await expect(this.password).toBeVisible();
    }

    async login(userEmail: string, userPassword: string) {
        await this.email.fill(userEmail);
        await this.password.fill(userPassword);
        await this.submit.click();
    }

    async goToRegister() {
        await this.registerLink.click();
    }

    /**
     * Returns trimmed text content of the first visible form error, or empty string if none found.
     */
    async getFirstVisibleErrorText(): Promise<string> {
        // Wait a short time for validation or server-provided errors to appear
        try {
            await this.formErrors.first().waitFor({ state: 'visible', timeout: 5000 });
        } catch {
            return "";
        }

        const texts = await this.formErrors.allTextContents().catch(() => [] as string[]);
        const merged = texts.filter(Boolean).map(t => t.trim()).join(' | ');
        return merged;
    }
}
