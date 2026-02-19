import { Page, Locator, expect } from "@playwright/test";

export class HomePage {
    readonly page: Page;

    // Header navigation
    readonly signInLink: Locator;
    readonly contactLink: Locator;
    readonly categoriesButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.signInLink = page.getByRole("link", { name: /sign in/i });
        this.contactLink = page.getByRole("link", { name: /contact/i });
        this.categoriesButton = page.getByRole("button", { name: /categories/i });
    }

    async open() {
        await this.page.goto("/", { waitUntil: "domcontentloaded" });
        await expect(this.page).toHaveTitle(/Practice Software Testing/i);
    }

    async goToSignIn() {
        await this.signInLink.click();
    }

    async goToContact() {
        await this.contactLink.click();
    }

    async openCategories() {
        await this.categoriesButton.click();
    }
}
