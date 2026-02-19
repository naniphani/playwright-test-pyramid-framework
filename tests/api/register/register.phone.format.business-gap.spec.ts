import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../_helpers/registerApi.js";

test.describe("Register API business GAP: phone should be validated", () => {
    test("GAP: non-numeric phone should be rejected (expected 422)", async ({ request }) => {
        test.fail(true, "Known gap: API currently accepts non-numeric phone values");

        const res = await registerUser(request, baseRegisterPayload({ phone: "ABCDEF" }));
        expect(Number(res.status())).toBe(422);
    });

    test("GAP: missing area code should be rejected (expected 422)", async ({ request }) => {
        test.fail(true, "Known gap: API currently accepts invalid/short phone values");

        const res = await registerUser(request, baseRegisterPayload({ phone: "990-7690" }));
        expect(Number(res.status())).toBe(422);
    });
});