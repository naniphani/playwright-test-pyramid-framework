import { APIRequestContext } from "@playwright/test";
import { faker } from "@faker-js/faker";

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
    const rnd = faker.string.alphanumeric(6).toLowerCase();
    return `${prefix}+${ts}-${rnd}@example.test`;
}

export function baseRegisterPayload(
    overrides: Partial<RegisterPayload> = {}
): RegisterPayload {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const year = new Date().getFullYear() - faker.number.int({ min: 18, max: 60 });
    const month = String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0");
    const day = String(faker.number.int({ min: 1, max: 28 })).padStart(2, "0");

    return {
        first_name: firstName,
        last_name: lastName,
        address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
            postal_code: faker.location.zipCode(),
        },
        phone: faker.phone.number(),
        dob: `${year}-${month}-${day}`,
        password: `P@${faker.string.alphanumeric(10)}`,
        email: uniqueEmail(),
        ...overrides,
    };
}

export async function registerUser(api: APIRequestContext, payload: any) {
    // uses API baseURL from your playwright.config.ts (api project)
    return api.post(REGISTER_ENDPOINT, { data: payload, timeout: 30000 });
}
