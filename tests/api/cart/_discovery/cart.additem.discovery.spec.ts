import { test, expect } from "@playwright/test";

test("probe cart add endpoints", async ({ request }) => {
    const cartRes = await request.post("/carts");
    expect([200, 201]).toContain(cartRes.status());
    const { id: cartId } = await cartRes.json();

    const productId = "01KHEPBPE2M398RCTAAH4QSPB9";

    const candidates = [
        { method: "post", url: `/carts/${cartId}/items`, data: { product_id: productId, quantity: 1 } },
        { method: "post", url: `/carts/${cartId}/product`, data: { product_id: productId, quantity: 1 } },
        { method: "post", url: `/carts/${cartId}/product/${productId}`, data: { quantity: 1 } },
        { method: "post", url: `/carts/${cartId}/product/quantity`, data: { product_id: productId, quantity: 1 } },
        { method: "put", url: `/carts/${cartId}/product/${productId}`, data: { quantity: 1 } },
        { method: "put", url: `/carts/${cartId}/product/quantity`, data: { product_id: productId, quantity: 1 } },
    ] as const;

    for (const c of candidates) {
        const res =
            c.method === "post"
                ? await request.post(c.url, { data: c.data })
                : await request.put(c.url, { data: c.data });

        const status = res.status();
        const body = await res.json().catch(() => null);

        const cart = await request.get(`/carts/${cartId}`);
        const cartBody = await cart.json();

        const count = cartBody?.cart_items?.length ?? 0;
        const has = cartBody?.cart_items?.some((i: any) => i.product_id === productId) ?? false;

        console.log(`${c.method.toUpperCase()} ${c.url} -> ${status}`, body);
        console.log(`Cart items now: ${count}, hasProduct=${has}`);

        if (has) {
            console.log("? Winner endpoint:", c.method.toUpperCase(), c.url);
            break;
        }
    }
});
