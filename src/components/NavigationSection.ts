import { Page, Locator, expect } from "@playwright/test";

export class NavigationSection {
    readonly page: Page;

    readonly categoriesDropdown: Locator;

    // Category links
    readonly handToolsLink: Locator;
    readonly powerToolsLink: Locator;
    readonly otherLink: Locator;
    readonly specialToolsLink: Locator;
    readonly rentalsLink: Locator;

    readonly cartQuantityBadge: Locator;

    constructor(page: Page) {
        this.page = page;

        this.categoriesDropdown = page.locator('[data-test="nav-categories"]');

        this.handToolsLink = page.locator('[data-test="nav-hand-tools"]');
        this.powerToolsLink = page.locator('[data-test="nav-power-tools"]');
        this.otherLink = page.locator('[data-test="nav-other"]');
        this.specialToolsLink = page.locator('[data-test="nav-special-tools"]');
        this.rentalsLink = page.locator('[data-test="nav-rentals"]');

        this.cartQuantityBadge = page.locator('[data-test="cart-quantity"]');
    }

    async openCategories() {
        await this.categoriesDropdown.click();
    }

    // Generic method (best long-term design)
    async goToCategoryByTestId(testId: string) {
        await this.openCategories();
        await this.page.locator(`[data-test="${testId}"]`).click();
    }

    // Convenience methods
    async goToHandTools() {
        await this.goToCategoryByTestId("nav-hand-tools");
    }

    async goToPowerTools() {
        await this.goToCategoryByTestId("nav-power-tools");
    }

    async goToOther() {
        await this.goToCategoryByTestId("nav-other");
    }

    async goToSpecialTools() {
        await this.goToCategoryByTestId("nav-special-tools");
    }

    async goToRentals() {
        await this.goToCategoryByTestId("nav-rentals");
    }

    async getCartQuantity(): Promise<number> {
        const text = await this.cartQuantityBadge.textContent();
        return Number(text ?? 0);
    }

    async expectCartQuantity(expected: number) {
        await expect(this.cartQuantityBadge).toHaveText(String(expected));
    }
}
