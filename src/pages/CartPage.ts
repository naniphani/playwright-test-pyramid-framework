import { Page, Locator, expect } from "@playwright/test";
import { NavigationSection } from "../components/NavigationSection.js";

export class CartPage {
    readonly page: Page;
    readonly nav: NavigationSection;

    readonly proceed1: Locator;
    readonly quantityInputs: Locator;
    readonly removeButtons: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nav = new NavigationSection(page);

        this.proceed1 = page.locator('[data-test="proceed-1"]');
        this.quantityInputs = page.locator('[data-test="product-quantity"]');

        // Updated remove locator (based on your HTML)
        this.removeButtons = page.locator(
            'a.btn-danger:has(svg[data-icon="xmark"])'
        );
    }

    async open() {
        await this.page.goto("/#/cart", { waitUntil: "domcontentloaded" });
        await expect(this.page).toHaveURL(/cart/i);
    }

    async proceedToCheckout() {
        await expect(this.proceed1).toBeVisible();
        await this.proceed1.click();
    }

    async setFirstItemQuantity(qty: number) {
        await expect(this.quantityInputs.first()).toBeVisible();
        await this.quantityInputs.first().fill(String(qty));
        await this.quantityInputs.first().blur();
    }

    async removeFirstItem() {
        await expect(this.removeButtons.first()).toBeVisible();
        await this.removeButtons.first().click();
    }
}
