import { test, expect } from "@playwright/test";
import { HomePage } from "../../../src/pages/HomePage.js";
import { CheckoutLoginPage } from "../../../src/pages/CheckoutLoginPage.js";

test("Hybrid (UI+API): Add via UI -> validate/update via API -> validate UI", async ({
  page,
  request,
}) => {
  page.on("requestfailed", (req) => {
    console.log("REQUEST FAILED:", req.url(), req.failure()?.errorText);
  });

  page.on("pageerror", (err) => {
    console.log("PAGE ERROR:", err.message);
  });

  const uiUserEmail =
    process.env.UI_USER_EMAIL || "customer@practicesoftwaretesting.com";
  const uiUserPassword =
    process.env.UI_USER_PASSWORD || "welcome01";

  const home = new HomePage(page);
  await home.open();
  await home.waitForCatalogReady();

  await home.firstProductImage.click();

  const addToCartButton = page.locator('[data-test="add-to-cart"]');
  await expect(addToCartButton).toBeVisible({ timeout: 15_000 });
  await addToCartButton.click();

  // Broader cart locator: badge may not exist immediately or may not be the clickable target
  const cartEntryPoint = page
    .locator(
      '[data-test="nav-cart"], [data-test="cart"], [data-test="cart-quantity"], a[href*="checkout"], a[href*="cart"]'
    )
    .first();

  await expect(cartEntryPoint).toBeVisible({ timeout: 15_000 });
  await cartEntryPoint.click();

  const proceed1 = page.locator('[data-test="proceed-1"]');
  await expect(proceed1).toBeVisible({ timeout: 15_000 });
  await proceed1.click();

  const checkoutLogin = new CheckoutLoginPage(page);
  await checkoutLogin.loginIfShown(uiUserEmail, uiUserPassword);

  const proceed2 = page.locator('[data-test="proceed-2"]');
  await expect(proceed2).toBeVisible({ timeout: 15_000 });

  // future API validation goes here
});