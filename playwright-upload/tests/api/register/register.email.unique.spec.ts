import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../register/_helpers/registerApi.js";

test.describe("Register API validation: email uniqueness", () => {
    test("duplicate email should be rejected (422)", async ({ request }) => {
        const email = `dup+${Date.now()}@example.test`;

        // 1) Register first time => success
        const r1 = await registerUser(request, baseRegisterPayload({ email }));
        expect([200, 201]).toContain(Number(r1.status()));

        // 2) Register again with same email => should fail
        const r2 = await registerUser(request, baseRegisterPayload({ email }));
        const status2 = Number(r2.status());
        const body2 = await r2.json();

        expect(status2).toBe(422);
        expect(body2).toHaveProperty("email");
        expect(String(body2.email[0]).toLowerCase()).toMatch(/exists|already/);
    });
});
