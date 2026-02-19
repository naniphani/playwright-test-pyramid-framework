import { Page, Locator, expect } from "@playwright/test";

export class HomePage {
    readonly page!: Page;

    readonly signInLink!: Locator;
    readonly contactLink!: Locator;
    readonly categoriesButton!: Locator;

    // ✅ Catalog readiness
    readonly firstProductName!: Locator;

    constructor(page: Page) {
        this.page = page;

        this.signInLink = page.getByRole("link", { name: /sign in/i });
        this.contactLink = page.getByRole("link", { name: /contact/i });

        // Prefer stable data-test
        this.categoriesButton = page.locator('[data-test="nav-categories"]');

        // Product list/cards on home
        this.firstProductName = page.locator('[data-test="product-name"]').first();
    }

    async open() {
        // ✅ Force Angular home (hash routing)
        await this.page.goto("/#/", { waitUntil: "domcontentloaded" });

        // Shell check
        await expect(this.page).toHaveTitle(/Practice Software Testing/i);

        // ✅ Real readiness: product grid loaded
        await expect(this.firstProductName).toBeVisible({ timeout: 15_000 });
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
