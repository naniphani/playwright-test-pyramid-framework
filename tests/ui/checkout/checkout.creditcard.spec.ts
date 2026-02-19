import { test, expect } from "@playwright/test";
import { ProductPage } from "../../../src/pages/ProductPage.js";
import { CartPage } from "../../../src/pages/CartPage.js";
import { CheckoutLoginPage } from "../../../src/pages/CheckoutLoginPage.js";
import { CheckoutAddressStep } from "../../../src/pages/CheckoutAddressStep.js";
import { CheckoutPaymentStep } from "../../../src/pages/CheckoutPaymentStep.js";

const P1 = "01KHEPBPE2M398RCTAAH4QSPB9";

test("UI-only: add product -> checkout -> pay by credit card", async ({ page }) => {
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    const checkoutLogin = new CheckoutLoginPage(page);
    const address = new CheckoutAddressStep(page);
    const payment = new CheckoutPaymentStep(page);

    // Add product
    await product.open(P1);
    await product.addToCart();

    // Go to cart
    await cart.open();
    await cart.proceedToCheckout();

    // If redirected to login (gated checkout)
    if (/\/auth\/login/i.test(page.url())) {
        await checkoutLogin.login(process.env.CUSTOMER_EMAIL!, process.env.CUSTOMER_PASSWORD!);
    }

    // Address step
    await address.fillPostalCode("1234AA");
    await address.proceed();

    // Payment step
    await payment.choosePaymentMethod("credit-card");
    await payment.fillCreditCard({
        number: "4111111111111111",
        exp: "12/30",
        cvv: "123",
        name: "John Doe",
    });

    await payment.proceed();
    await payment.confirm();

    // Add a real success assertion once you paste confirmation locator/message
    await expect(page).toHaveURL(/confirmation|success|orders/i);
});
