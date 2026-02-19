import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../register/_helpers/registerApi.js";

function uniq(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

test.describe("Register API business rule GAP: email format should be validated", () => {
    test("GAP: email without @ should be rejected (expected 422)", async ({ request }) => {
        test.fail(true, "Known gap: API currently accepts invalid email format");
        const email = `invalid-email-${uniq()}.example.test`;

        const res = await registerUser(request, baseRegisterPayload({ email }));
        expect(Number(res.status())).toBe(422);
    });

    test("GAP: email with spaces should be rejected (expected 422)", async ({ request }) => {
        test.fail(true, "Known gap: API currently accepts invalid email format");
        const email = `bad ${uniq()}@example.test`;

        const res = await registerUser(request, baseRegisterPayload({ email }));
        expect(Number(res.status())).toBe(422);
    });
});
