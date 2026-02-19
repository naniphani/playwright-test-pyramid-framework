import { test, expect } from "@playwright/test";
import { baseRegisterPayload, registerUser } from "../_helpers/registerApi.js";

async function assertNot500AndIf422HasFieldError(
    request: any,
    label: string,
    payload: any,
    expectedErrorKey: string
) {
    const res = await registerUser(request, payload);
    const status = Number(res.status());

    expect(status).not.toBe(500);

    if (status === 422) {
        const body = await res.json();
        // Sometimes APIs return nested keys; keep it flexible
        const key =
            body[expectedErrorKey] ? expectedErrorKey : Object.keys(body).find(k => k.includes(expectedErrorKey)) || null;

        expect(key).not.toBeNull();
    } else {
        // If accepted, should be success (practice API behavior)
        expect([200, 201]).toContain(status);
    }
}

test.describe("Register API robustness: max-length stress (unknown limits)", () => {
    test("first_name very long", async ({ request }) => {
        await assertNot500AndIf422HasFieldError(
            request,
            "first_name(300)",
            baseRegisterPayload({ first_name: "A".repeat(300) }),
            "first_name"
        );
    });

    test("last_name very long", async ({ request }) => {
        await assertNot500AndIf422HasFieldError(
            request,
            "last_name(300)",
            baseRegisterPayload({ last_name: "B".repeat(300) }),
            "last_name"
        );
    });

    test("address.street very long", async ({ request }) => {
        const payload: any = baseRegisterPayload();
        payload.address.street = "S".repeat(500);

        await assertNot500AndIf422HasFieldError(request, "street(500)", payload, "street");
    });
});



