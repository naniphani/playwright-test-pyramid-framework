// tests/hybrid/register/register.ui-api.login.spec.ts
import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../../src/pages/RegisterPage.js";
import { loginCustomer } from "../../api/_helpers/authApi.js";
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';

function uniqueEmailFromParts(firstName: string, lastName: string, suffix: string) {
    const safeFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'fn';
    const safeLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'ln';
    return `${safeFirst}.${safeLast}.${suffix}@example.test`;
}

function dobForAgeFromParts(age: number) {
    const now = new Date();
    const year = now.getFullYear() - age;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

// Write a local-only fixture containing the registered user's login info.
function writeLocalFixture(email: string, password: string) {
    try {
        const dir = path.resolve(process.cwd(), 'storage');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, 'registered-user.json');
        const payload = { email, password };
        fs.writeFileSync(file, JSON.stringify(payload, null, 2), { encoding: 'utf8' });
        // Do not log secrets in CI; only helpful locally
        if (!process.env.CI) console.log('Wrote local fixture to', file);
    } catch (err) {
        // Non-fatal: writing fixture is convenience only
        console.warn('Could not write local fixture:', err);
    }
}

test("Register (UI) -> Verify login works (API) [Test Pyramid: middle layer]", async ({ page }) => {
    const apiBaseURL = process.env.API_BASE_URL || "http://localhost:8091";

    // Generate realistic but unique test data using faker v8 APIs
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const suffix = faker.string.alphanumeric(4).toLowerCase();
    const email = uniqueEmailFromParts(firstName, lastName, suffix);

    // Unique password per run (kept reasonably short)
    const password = `P@${faker.string.alphanumeric(10)}`;

    // Age between 17 and 75
    const age = faker.number.int({ min: 17, max: 75 });
    const now = new Date();
    const year = now.getFullYear() - age;
    const month = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
    const day = String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0');
    const dob = `${year}-${month}-${day}`;

    const phone = faker.phone.number();

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
            street: faker.location.streetAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            state: faker.location.state(),
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

    // Create a local fixture with the login info for convenience. Stored under `storage/` which is gitignored.
    writeLocalFixture(email, password);
});
