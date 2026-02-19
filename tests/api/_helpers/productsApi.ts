import { APIRequestContext, expect, request as pwRequest } from "@playwright/test";

export async function getProductById(apiBaseURL: string, productId: string) {
    const api: APIRequestContext = await pwRequest.newContext({
        baseURL: apiBaseURL,
        extraHTTPHeaders: { Accept: "application/json" },
    });

    // Most Toolshop implementations use /products/:id
    const res = await api.get(`/products/${productId}`);

    expect(res.status(), `GET /products/${productId} failed`).toBe(200);

    const body = await res.json();
    await api.dispose();
    return body as Record<string, any>;
}
