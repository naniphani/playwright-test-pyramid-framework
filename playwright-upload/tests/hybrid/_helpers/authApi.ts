import { APIRequestContext, expect, request as pwRequest } from "@playwright/test";

export type LoginResponse = {
    access_token?: string;
    token?: string;
};

export async function loginCustomer(apiBaseURL: string, email: string, password: string) {
    const apiContext: APIRequestContext = await pwRequest.newContext({
        baseURL: apiBaseURL,
        extraHTTPHeaders: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });

    const res = await apiContext.post("/users/login", {
        data: { email, password },
    });

    expect([200, 201]).toContain(Number(res.status()));

    const body: LoginResponse = await res.json();
    const token = body.access_token ?? body.token;

    expect(token, `Expected token in response, got: ${JSON.stringify(body)}`).toBeTruthy();

    await apiContext.dispose();
    return token as string;
}
