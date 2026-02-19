import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../_helpers/registerApi.js";

test.describe("Register API - Business required fields (GAPS vs API)", () => {
    const businessRequired = [
        "phone",
        "dob",
        "address.street",
        "address.city",
        "address.state",
        "address.country",
        "address.postal_code",
    ] as const;

    for (const field of businessRequired) {
        test(`Business rule: ${field} should be required (currently API allows)`, async ({ request }) => {
            const payload: any = baseRegisterPayload();

            if (field.startsWith("address.")) {
                const k = field.split(".")[1];
                delete payload.address[k];
            } else {
                delete payload[field];
            }

            const res = await registerUser(request, payload);
            const status = Number(res.status());

            // Current observed behavior: API still creates user (201)
            // If backend is fixed later, change this to expect 422.
            expect([200, 201]).toContain(status);
        });
    }
});
