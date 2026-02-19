import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../register/_helpers/registerApi.js";

test.describe("Register API contract: phone format not validated (current behavior)", () => {
    const phonesAccepted = [
        "3019907690",
        "301-990-7690",
        "(301)-990-7690",
        "(301) 990-7690",
        "+13019907690",
        "ABCDEF",          // clearly not numeric
        "990-7690",        // missing area code
    ];

    for (const phone of phonesAccepted) {
        test(`API accepts phone="${phone}" (201)`, async ({ request }) => {
            const res = await registerUser(request, baseRegisterPayload({ phone }));
            expect([200, 201]).toContain(Number(res.status()));
        });
    }
});