import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../_helpers/registerApi.js";

test.describe("Register API validation: required fields (API contract)", () => {
    // ✅ Fields that the API actually enforces (based on your runs)
    const requiredTopLevel = ["first_name", "last_name", "email", "password"] as const;

    for (const field of requiredTopLevel) {
        test(`missing ${field} should fail (422)`, async ({ request }) => {
            const payload: any = baseRegisterPayload();
            delete payload[field];

            const res = await registerUser(request, payload);

            const status = Number(res.status());
            const body = await res.json();

            expect(status).toBe(422);
            expect(body).toHaveProperty(field);
            expect(String(body[field][0]).toLowerCase()).toContain("required");
        });
    }
});
