// tests/hybrid/register/register.ui-api.login.spec.ts
import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../../src/pages/RegisterPage.js";
import { loginCustomer } from "../../api/_helpers/authApi.js";
import { faker } from '@faker-js/faker';

function uniqueEmail(firstName: string, lastName: string) {
    const ts = Date.now();
    const rnd = Math.random().toString(16).slice(2);
    // Use name parts to make emails easier to recognize in test data
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${ts}-${rnd}@example.test`;
}

function dobForAge(age: number) {
    const now = new Date();
    const year = now.getFullYear() - age;
    // keep day between 1 and 28 to avoid month-length issues
    const month = faker.datatype.number({ min: 1, max: 12 });
    const day = faker.datatype.number({ min: 1, max: 28 });
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

test("Register (UI) -> Verify login works (API) [Test Pyramid: middle layer]", async ({ page }) => {
    const apiBaseURL = process.env.API_BASE_URL || "http://localhost:8091";

    // Generate realistic but unique test data
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = uniqueEmail(firstName, lastName);
    const password = "ValidPass@123";

    // Age between 17 and 75
    const age = faker.datatype.number({ min: 17, max: 75 });
    const dob = dobForAge(age);

    const phone = faker.phone.number('##########');

    const register = new RegisterPage(page);
    await register.open();

    await register.fillForm({
        firstName,
        lastName,
        dob,
        phone,
        email,
        password,
        address: {
            street: faker.address.streetAddress(),
            postalCode: faker.address.zipCode(),
            city: faker.address.city(),
            state: faker.address.state(),
            // Keep a stable country label matching the demo app's option label
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
