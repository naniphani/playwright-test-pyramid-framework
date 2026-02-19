import { Page, Locator, expect } from "@playwright/test";

export class CheckoutPaymentStep {
    readonly page: Page;

    readonly paymentMethod: Locator;
    readonly creditCardNumber: Locator;
    readonly expirationDate: Locator;
    readonly cvv: Locator;
    readonly cardHolderName: Locator;

    readonly proceed3: Locator;
    readonly finish: Locator;

    constructor(page: Page) {
        this.page = page;

        this.paymentMethod = page.locator('[data-test="payment-method"]');

        this.creditCardNumber = page.locator('[data-test="credit_card_number"]');
        this.expirationDate = page.locator('[data-test="expiration_date"]');
        this.cvv = page.locator('[data-test="cvv"]');
        this.cardHolderName = page.locator('[data-test="card_holder_name"]');

        this.proceed3 = page.locator('[data-test="proceed-3"]');
        this.finish = page.locator('[data-test="finish"]');
    }

    async choosePaymentMethod(value: "credit-card" | "bank-transfer" | "cash-on-delivery" | "buy-now-pay-later" | "gift-card") {
        await expect(this.paymentMethod).toBeVisible();
        await this.paymentMethod.selectOption(value);
    }

    async fillCreditCard(details: { number: string; exp: string; cvv: string; name: string }) {
        await expect(this.creditCardNumber).toBeVisible();
        await this.creditCardNumber.fill(details.number);
        await this.expirationDate.fill(details.exp);
        await this.cvv.fill(details.cvv);
        await this.cardHolderName.fill(details.name);
    }

    async proceed() {
        await expect(this.proceed3).toBeVisible();
        await this.proceed3.click();
    }

    async confirm() {
        await expect(this.finish).toBeVisible();
        await this.finish.click();
    }
}
