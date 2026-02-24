// tests/hybrid/register/register.ui-api.login.spec.ts
import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../../src/pages/RegisterPage.js";
import { loginCustomer } from "../../api/_helpers/authApi.js";
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

function shortRandom(len = 4) {
    return Math.random().toString(36).slice(2, 2 + len);
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

    // Try to load faker dynamically. If not available, fall back to simple generators.
    let fakerLib: any = null;
    try {
        const mod = await import('@faker-js/faker');
        fakerLib = mod.faker ?? mod;
    } catch (err) {
        if (!process.env.CI) console.warn('@faker-js/faker not available, using simple fallback generators');
    }

    // Generate realistic but unique test data
    const firstName = fakerLib ? fakerLib.person.firstName() : `FN${Math.floor(Math.random() * 10000)}`;
    const lastName = fakerLib ? fakerLib.person.lastName() : `LN${Math.floor(Math.random() * 10000)}`;

    // Short unique suffix for email and password
    const suffix = shortRandom(4);

    const email = fakerLib
        ? // faker.internet.email still available, but keep consistent safe format
          (fakerLib.internet?.email ? fakerLib.internet.email(firstName, lastName, 'example.test') : uniqueEmailFromParts(firstName, lastName, suffix))
        : uniqueEmailFromParts(firstName, lastName, suffix);

    // Unique password per run (kept reasonably short)
    const password = fakerLib ? `P@${fakerLib.string.alphanumeric(8)}` : `ValidPass@${shortRandom(6)}`;

    // Age between 17 and 75
    const age = fakerLib ? fakerLib.number.int({ min: 17, max: 75 }) : Math.floor(Math.random() * (75 - 17 + 1)) + 17;
    const dob = fakerLib
        ? (() => {
              const now = new Date();
              const year = now.getFullYear() - age;
              const month = fakerLib.number.int({ min: 1, max: 12 });
              const day = fakerLib.number.int({ min: 1, max: 28 });
              return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          })()
        : dobForAgeFromParts(age);

    const phone = fakerLib ? fakerLib.phone.number() : String(1000000000 + Math.floor(Math.random() * 899999999));

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
            street: fakerLib ? (fakerLib.location?.streetAddress ? fakerLib.location.streetAddress() : fakerLib.address?.streetAddress?.()) : `Test Street ${Math.floor(Math.random() * 1000)}`,
            postalCode: fakerLib ? (fakerLib.location?.zipCode ? fakerLib.location.zipCode() : fakerLib.address?.zipCode?.()) : `12345`,
            city: fakerLib ? (fakerLib.location?.city ? fakerLib.location.city() : fakerLib.address?.city?.()) : `City${Math.floor(Math.random() * 1000)}`,
            state: fakerLib ? (fakerLib.location?.state ? fakerLib.location.state() : fakerLib.address?.state?.()) : `State${Math.floor(Math.random() * 100)}`,
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
