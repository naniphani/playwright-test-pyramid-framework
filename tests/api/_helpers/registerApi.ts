import { APIRequestContext } from "@playwright/test";

export const REGISTER_ENDPOINT = "/users/register";

export type RegisterPayload = {
    first_name: string;
    last_name: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    };
    phone: string;
    dob: string; // YYYY-MM-DD
    password: string;
    email: string;
};

export function uniqueEmail(prefix = "qa"): string {
    const ts = Date.now();
    const rnd = Math.random().toString(16).slice(2);
    return `${prefix}+${ts}-${rnd}@example.test`;
}

export function baseRegisterPayload(
    overrides: Partial<RegisterPayload> = {}
): RegisterPayload {
    return {
        first_name: "John",
        last_name: "Doe",
        address: {
            street: "Street 1",
            city: "City",
            state: "State",
            country: "Country",
            postal_code: "1234AA",
        },
        phone: "0987654321",
        dob: "1970-01-01",
        password: "SuperSecure@123",
        email: uniqueEmail(),
        ...overrides,
    };
}

export async function registerUser(api: APIRequestContext, payload: any) {
    // uses API baseURL from your playwright.config.ts (api project)
    return api.post(REGISTER_ENDPOINT, { data: payload, timeout: 30000 });
}
