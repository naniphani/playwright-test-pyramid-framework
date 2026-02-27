import { Page, Locator, expect } from "@playwright/test";
import { HomePage } from "./HomePage.js";

export class LoginPage {
    readonly page: Page;

    readonly email: Locator;
    readonly password: Locator;
    readonly submit: Locator;

    readonly registerLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Login Locators on the sign page
        this.email = page.locator('[data-test="email"]');
        this.password = page.locator('[data-test="password"]');
        this.submit = page.locator('[data-test="login-submit"]');

        // Link from login page -> register page
        this.registerLink = page.getByRole("link", { name: /register/i });
    }

    /**
     * Navigate to login by going through the home page.
     * This mirrors how users normally arrive at the sign‑in form
     * and makes our tests less brittle than hard‑coding the URL.
     */
    async openViaHome() {
        const home = new HomePage(this.page);
        await home.open();
        await home.goToSignIn();
        await this.assertLoaded();
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
}
