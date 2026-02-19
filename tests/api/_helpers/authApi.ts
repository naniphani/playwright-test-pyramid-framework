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

    const res = await apiContext.post("/users/login", { data: { email, password } });

    const status = res.status();
    const bodyText = await res.text(); // safer than json() on error

    // 200/201 = success; anything else = fail with context
    if (![200, 201].includes(status)) {
        await apiContext.dispose();
        throw new Error(
            `loginCustomer failed\n` +
            `STATUS: ${status}\n` +
            `EMAIL: ${email}\n` +
            `RESPONSE: ${bodyText}`
        );
    }

    const body: LoginResponse = JSON.parse(bodyText);
    const token = body.access_token ?? body.token;

    expect(token, `Expected token in response, got: ${bodyText}`).toBeTruthy();

    await apiContext.dispose();
    return token as string;
}
