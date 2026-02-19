import { APIRequestContext, expect } from "@playwright/test";
import { ENDPOINTS } from "./endpoints.js";

export type Cart = {
    id: string;
    cart_items?: Array<{
        id: string;
        quantity: number;
        product_id: string;
        product?: { id: string; name: string; price: number };
    }>;
};

export function cartState(cart: Cart): "Empty" | "HasItems" {
    const count = cart.cart_items?.length ?? 0;
    return count > 0 ? "HasItems" : "Empty";
}

export async function createCart(api: APIRequestContext): Promise<string> {
    const res = await api.post(ENDPOINTS.carts.create);
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body?.id).toBeTruthy();
    return String(body.id);
}

export async function getCart(api: APIRequestContext, cartId: string): Promise<Cart> {
    const res = await api.get(ENDPOINTS.carts.get(cartId));
    expect(res.status()).toBe(200);
    return (await res.json()) as Cart;
}

export async function updateQuantity(
    api: APIRequestContext,
    cartId: string,
    productId: string,
    quantity: number
) {
    const url = ENDPOINTS.carts.updateQuantity(cartId);

    // Try common payload variants (black-box friendly)
    const payloads = [
        { product_id: productId, quantity },
        { productId: productId, quantity },
        { product_id: productId, qty: quantity },
        { productId: productId, qty: quantity },
    ];

    // Snapshot cart before (so we can verify the event actually changed state)
    const before = await getCart(api, cartId);
    const beforeCount = before.cart_items?.length ?? 0;

    for (const data of payloads) {
        const res = await api.put(url, { data });

        // Accept only sensible statuses; ignore weird ones
        if (![200, 201, 204, 400, 422].includes(res.status())) continue;

        // Re-read cart after and see if change happened
        const after = await getCart(api, cartId);
        const afterCount = after.cart_items?.length ?? 0;

        const hasItem =
            after.cart_items?.some((i) => i.product_id === productId) ?? false;

        // If item exists OR count increased, this payload matches the contract
        if (hasItem || afterCount > beforeCount) {
            return res;
        }
    }

    // If nothing worked, throw a helpful diagnostic
    const final = await getCart(api, cartId);
    throw new Error(
        `updateQuantity() returned success but did not affect cart.\n` +
        `Tried payload variants: product_id/productId + quantity/qty.\n` +
        `URL: ${url}\n` +
        `Final cart_items length: ${final.cart_items?.length ?? 0}`
    );
}


export async function deleteProduct(api: APIRequestContext, cartId: string, productId: string) {
    return api.delete(ENDPOINTS.carts.deleteProduct(cartId, productId));
}

export async function deleteCart(api: APIRequestContext, cartId: string) {
    return api.delete(ENDPOINTS.carts.deleteCart(cartId));
}
