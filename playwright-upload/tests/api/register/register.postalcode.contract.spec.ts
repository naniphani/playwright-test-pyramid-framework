import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../register/_helpers/registerApi.js";
test.describe("Register API contract: postal_code behavior", () => {
    test.describe("Accepted postal_code values (format not validated)", () => {
        const accepted = [
            "1234AA",
            "12345",
            "SW1A 1AA",
            "###@@@",
            "12",
        ];

        for (const postal_code of accepted) {
            test(`API accepts postal_code="${postal_code}"`, async ({ request }) => {
                const payload: any = baseRegisterPayload();
                payload.address.postal_code = postal_code;

                const res = await registerUser(request, payload);
                expect([200, 201]).toContain(Number(res.status()));
            });
        }
    });

    test("postal_code too long should be rejected (422)", async ({ request }) => {
        const payload: any = baseRegisterPayload();
        payload.address.postal_code = "A".repeat(50);

        const res = await registerUser(request, payload);
        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);

        // error key might be "address.postal_code" or "postal_code"
        const key = body["address.postal_code"]
            ? "address.postal_code"
            : body["postal_code"]
                ? "postal_code"
                : null;

        expect(key).not.toBeNull();
        // keep wording flexible: max/characters/greater than
        expect(String(body[key!][0]).toLowerCase()).toMatch(/max|character|greater|too long/);
    });
});
