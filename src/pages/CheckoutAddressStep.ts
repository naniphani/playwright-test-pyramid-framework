import { Page, Locator, expect } from "@playwright/test";

export class CheckoutAddressStep {
  readonly page: Page;

  readonly postalCode: Locator;
  readonly proceed2: Locator;

  constructor(page: Page) {
    this.page = page;
    this.postalCode = page.locator('[data-test="postal_code"]');
    this.proceed2 = page.locator('[data-test="proceed-2"]');
  }

  async fillPostalCode(value: string) {
    await expect(this.postalCode).toBeVisible();
    await this.postalCode.fill(value);
  }

  async proceed() {
    await expect(this.proceed2).toBeVisible();
    await this.proceed2.click();
  }
}
