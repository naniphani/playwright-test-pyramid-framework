// tests/hybrid/register/register.ui-api.login.spec.ts
import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../../src/pages/RegisterPage.js";
import { loginCustomer } from "../../api/_helpers/authApi.js";

function uniqueEmail() {
    const ts = Date.now();
    const rnd = Math.random().toString(16).slice(2);
    return `qa+${ts}-${rnd}@example.test`;
}

test("Register (UI) -> Verify login works (API) [Test Pyramid: middle layer]", async ({ page }) => {
    const apiBaseURL = process.env.API_BASE_URL || "http://localhost:8091";

    const email = uniqueEmail();
    const password = "ValidPass@123";
    const dob = "1990-01-01";

    const register = new RegisterPage(page);
    await register.open();

    await register.fillForm({
        firstName: "John",
        lastName: "Doe",
        dob,
        phone: "3019907690",
        email,
        password,
        address: {
            street: "Test street 98",
            postalCode: "1234AA",
            city: "Vienna",
            state: "State",
            countryLabel: "United States of America (the)",
        },
    });

    const res = await register.submitAndWaitForRegisterResponse();

    // UI+API stability: assert backend response rather than relying on redirect behavior
    expect([200, 201, 422]).toContain(res.status());

    const body = await res.json().catch(() => ({}));
    if (res.status() === 422) {
        throw new Error(`Register failed (422). Body: ${JSON.stringify(body)}`);
    }

    // Now verify login works via API
    const token = await loginCustomer(apiBaseURL, email, password);
    expect(token.length).toBeGreaterThan(10);
});
