import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../_helpers/registerApi.js";

test.describe("Register API validation: password rules", () => {

    test("password shorter than 8 chars should fail", async ({ request }) => {
        const res = await registerUser(
            request,
            baseRegisterPayload({ password: "Abc!234" }) // 7 chars
        );

        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);
        expect(body).toHaveProperty("password");
        expect(body.password.join(" ").toLowerCase()).toContain("at least 8 characters");
    });

    test("password missing symbol should fail", async ({ request }) => {
        const res = await registerUser(
            request,
            baseRegisterPayload({ password: "Abcd1234" }) // no symbol
        );

        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);
        expect(body.password.join(" ").toLowerCase()).toContain("symbol");
    });

    test("password missing uppercase should fail", async ({ request }) => {
        const res = await registerUser(
            request,
            baseRegisterPayload({ password: "abcd!234" }) // no uppercase
        );

        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);
        expect(body.password.join(" ").toLowerCase()).toContain("uppercase");
    });

    test("password missing lowercase should fail", async ({ request }) => {
        const res = await registerUser(
            request,
            baseRegisterPayload({ password: "ABCD!234" }) // no lowercase
        );

        const status = Number(res.status());
        const body = await res.json();

        expect(status).toBe(422);
        expect(body.password.join(" ").toLowerCase()).toContain("lowercase");
    });

    test("strong password should succeed", async ({ request }) => {
        const res = await registerUser(
            request,
            baseRegisterPayload({ password: "ValidPass@123" })
        );

        expect([200, 201]).toContain(Number(res.status()));
    });

});
