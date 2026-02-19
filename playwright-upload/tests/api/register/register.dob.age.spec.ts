import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../register/_helpers/registerApi.js";


test.describe("Register API validation: DOB age rule (17–75 inclusive)", () => {
    test("valid DOB (age within range) => should succeed", async ({ request }) => {
        // clearly between 17 and 75
        const res = await registerUser(request, baseRegisterPayload({ dob: "1990-01-01" }));
        expect([200, 201]).toContain(Number(res.status()));
    });

    test("too young DOB => should fail (422)", async ({ request }) => {
        // clearly under 17
        const res = await registerUser(request, baseRegisterPayload({ dob: "2015-01-01" }));
        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);
        expect(body).toHaveProperty("dob");
    });

    test("too old DOB => should fail (422)", async ({ request }) => {
        // clearly over 75
        const res = await registerUser(request, baseRegisterPayload({ dob: "1930-01-01" }));
        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);
        expect(body).toHaveProperty("dob");
    });
});



