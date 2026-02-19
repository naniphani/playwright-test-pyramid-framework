import { test, expect } from "@playwright/test";
import { HomePage } from "../../../src/pages/HomePage.js";
import { LoginPage } from "../../../src/pages/LoginPage.js";
import { CheckoutLoginPage } from "../../../src/pages/CheckoutLoginPage.js";

// your API helpers used later (cart/product/etc)
// import { ... } from "../../api/_helpers/..."

test("Hybrid (UI+API): Add via UI -> validate/update via API -> validate UI", async ({ page, request }) => {
    const uiUserEmail = process.env.UI_USER_EMAIL || "customer@practicesoftwaretesting.com";
    const uiUserPassword = process.env.UI_USER_PASSWORD || "welcome01"; // <-- use your real demo creds/env

    const home = new HomePage(page);
    await home.open();

    // 1) UI: go to any product (keep it small for pyramid)
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible({ timeout: 15_000 });
    await page.locator('[data-test="product-name"]').first().click();

    // 2) UI: add to cart
    await page.locator('[data-test="add-to-cart"]').click();

    // 3) UI: open cart (cart badge / cart icon varies; using badge is common)
    // If you have a cart icon locator, use that. Otherwise:
    const cartQtyBadge = page.locator('[data-test="cart-quantity"]');
    await expect(cartQtyBadge).toBeVisible();
    await cartQtyBadge.click(); // if badge not clickable, replace with cart icon locator

    // 4) UI: proceed to checkout step-1
    await page.locator('[data-test="proceed-1"]').click();

    // 5) UI: login only if login page is shown
    const checkoutLogin = new CheckoutLoginPage(page);
    await checkoutLogin.loginIfShown(uiUserEmail, uiUserPassword);

    // 6) Continue checkout only after step-2 is visible
    await expect(page.locator('[data-test="proceed-2"]')).toBeVisible({ timeout: 15_000 });

    // ---- NOW do your API validation/update steps here ----
    // Example pattern:
    // - extract cartId from localStorage/cookie OR from UI route (depending on app)
    // - call API to update quantity
    // - reload cart UI and assert quantity matches
});
