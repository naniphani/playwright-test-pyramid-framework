import { APIRequestContext, request, Page } from "@playwright/test";

export async function apiContextFromPage(page: Page, apiBaseURL: string): Promise<APIRequestContext> {
    // Toolshop usually stores token in localStorage after login.
    // Adjust key names if your app uses different keys.
    const token = await page.evaluate(() => {
        const candidates = ["auth_token", "token", "access_token"];
        for (const k of candidates) {
            const v = window.localStorage.getItem(k);
            if (v) return v;
        }
        return null;
    });

    if (!token) throw new Error("No auth token found in localStorage. Login via UI first.");

    return await request.newContext({
        baseURL: apiBaseURL,
        extraHTTPHeaders: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
}
