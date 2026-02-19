import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../register/_helpers/registerApi.js";

// ✅ Define helper BEFORE tests
function uniq(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

test.describe("Register API validation: email format", () => {

    test("invalid email (missing @) should fail with format error (422)", async ({ request }) => {

        const email = `invalid-email-${uniq()}.example.test`; // no @, unique

        const res = await registerUser(request, baseRegisterPayload({ email }));
        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);
        expect(body).toHaveProperty("email");

        const msg = String(body.email[0]).toLowerCase();
        expect(msg).toMatch(/valid|invalid|format|email/);
        expect(msg).not.toMatch(/already exists/);
    });

    test("invalid email (spaces) should fail with format error (422)", async ({ request }) => {

        const email = `bad ${uniq()}@example.test`; // spaces, unique

        const res = await registerUser(request, baseRegisterPayload({ email }));
        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);
        expect(body).toHaveProperty("email");

        const msg = String(body.email[0]).toLowerCase();
        expect(msg).toMatch(/valid|invalid|format|email/);
        expect(msg).not.toMatch(/already exists/);
    });

});

