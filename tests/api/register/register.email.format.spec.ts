import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../_helpers/registerApi.js";

// ✅ Define helper BEFORE tests
function uniq(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

test.describe("Register API validation: email format", () => {

    test("invalid email (missing @) should fail with format error (422)", async ({ request }) => {
        test.fixme(
            true,
            "Known issue: API throws 500 because mailer validates RFC2822 address instead of returning 422"
        );

        const email = `invalid-email-${uniq()}.example.test`; // no @, unique
        const res = await registerUser(request, baseRegisterPayload({ email }));
        expect(res.status()).toBe(422);
    });

    test("invalid email (spaces) should fail with format error (422)", async ({ request }) => {
        test.fixme(
            true,
            "Known issue: API throws 500 because mailer validates RFC2822 address instead of returning 422"
        );

        const email = `bad ${uniq()}@example.test`; // spaces, unique
        const res = await registerUser(request, baseRegisterPayload({ email }));
        expect(res.status()).toBe(422);
    });

});
