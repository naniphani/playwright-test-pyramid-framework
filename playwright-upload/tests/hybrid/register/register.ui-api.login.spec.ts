// tests/hybrid/register/register.ui-api.login.spec.ts
import { test, expect } from "@playwright/test";
import { HomePage } from "../../../src/pages/HomePage.js";
import { LoginPage } from "../../../src/pages/LoginPage.js";
import { RegisterPage } from "../../../src/pages/RegisterPage.js";
import { loginCustomer } from "../_helpers/authApi.js";

function uniqueEmail() {
    const ts = Date.now();
    const rnd = Math.random().toString(16).slice(2);
    return `qa+${ts}-${rnd}@example.test`;
}

test("Register (UI) -> Verify login works (API) [Test Pyramid: middle layer]", async ({ page }) => {
    const apiBaseURL = process.env.API_BASE_URL || "https://api.practicesoftwaretesting.com";

    const email = uniqueEmail();
    const password = "ValidPass@123";

    const home = new HomePage(page);
    const login = new LoginPage(page);
    const register = new RegisterPage(page);

    // 1) UI navigation: Home -> Sign in -> Register
    await home.open();
    await home.goToSignIn();
    await login.assertLoaded();
    await login.goToRegister();
    await register.assertLoaded();

    // 2) UI: Register (this UI requires these fields)
    await register.register({
        firstName: "John",
        lastName: "Doe",
        dob: "1990-01-01",
        phone: "3019907690",
        email,
        password,
        address: {
            street: "Street 1",
            city: "City",
            state: "State",
            postalCode: "1234AA",
            countryLabel: "United States of America (the)", // <-- FIX: use countryLabel
        },
    });

    // 3) UI: Expect redirect to login (demo app behavior)
    await expect(page).toHaveURL(/\/auth\/login|login/i);

    // 4) API: Verify login works (token returned)
    const token = await loginCustomer(apiBaseURL, email, password);
    expect(token.length).toBeGreaterThan(10);
});
