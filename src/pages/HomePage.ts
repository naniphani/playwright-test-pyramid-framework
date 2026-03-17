import { Page, Locator, expect } from "@playwright/test";

export class HomePage {
  readonly page: Page;

  readonly signInLink: Locator;
  readonly productImages: Locator;
  readonly firstProductImage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.signInLink = page.getByRole("link", { name: /sign in/i });
    this.productImages = page.locator("img.card-img-top");
    this.firstProductImage = this.productImages.first();
  }

  async open() {
    await this.page.goto("/#/", { waitUntil: "domcontentloaded" });
    await expect(this.page).toHaveTitle(/Practice Software Testing/i);
  }

  async waitForCatalogReady() {
    await expect
      .poll(async () => await this.productImages.count(), {
        timeout: 30_000,
        message: "Expected catalog product images to render on the home page",
      })
      .toBeGreaterThan(0);

    await expect(this.firstProductImage).toBeVisible({ timeout: 30_000 });
  }

  async goToSignIn() {
    await expect(this.signInLink).toBeVisible({ timeout: 15_000 });
    await this.signInLink.click();
  }
}