import { Page, Locator, expect } from "@playwright/test";

export class ProductPage {
    readonly page: Page;

    readonly addToCartButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addToCartButton = page.locator('[data-test="add-to-cart"], #btn-add-to-cart');
    }

    async open(productId: string) {
        await this.page.goto(`/#/product/${productId}`, { waitUntil: "domcontentloaded" });
        await expect(this.addToCartButton).toBeVisible();
    }

    async addToCart() {
        await expect(this.addToCartButton).toBeEnabled();
        await this.addToCartButton.click();
    }
}
