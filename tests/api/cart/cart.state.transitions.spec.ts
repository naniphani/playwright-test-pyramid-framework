import { test, expect } from "@playwright/test";
import {
    createCart,
    getCart,
    cartState,
    updateQuantity,
    deleteProduct,
    deleteCart,
} from "../_helpers/cartApi.js";

const P1 = "01KHEPBPE2M398RCTAAH4QSPB9"; // hammer
const P2 = "01KHEPBPFWX8AS4A1SY2DRG438"; // sander

test.describe("Cart - State Transition Testing (API Pyramid Base)", () => {
    test("Empty -> (updateQuantity add qty 1) -> HasItems", async ({ request }) => {
        const cartId = await createCart(request);

        // In your system, updateQuantity acts like add-or-update
        const res = await updateQuantity(request, cartId, P1, 1);
        expect([200, 201]).toContain(res.status());

        const cart = await getCart(request, cartId);
        expect(cartState(cart)).toBe("HasItems");
        expect(cart.cart_items?.some(i => i.product_id === P1 && i.quantity === 1)).toBeTruthy();

        await deleteCart(request, cartId).catch(() => { });
    });

    test("HasItems -> (updateQuantity change qty) -> HasItems (quantity updated)", async ({ request }) => {
        const cartId = await createCart(request);

        await updateQuantity(request, cartId, P1, 1);
        const upd = await updateQuantity(request, cartId, P1, 3);
        expect([200, 201]).toContain(upd.status());

        const cart = await getCart(request, cartId);
        const item = cart.cart_items?.find(i => i.product_id === P1);
        expect(item).toBeTruthy();
        expect(Number(item!.quantity)).toBe(3);

        await deleteCart(request, cartId).catch(() => { });
    });

    test("HasItems -> (deleteProduct) -> Empty when last item removed", async ({ request }) => {
        const cartId = await createCart(request);

        await updateQuantity(request, cartId, P1, 1);
        let cart = await getCart(request, cartId);
        expect(cartState(cart)).toBe("HasItems");

        const del = await deleteProduct(request, cartId, P1);
        expect([200, 204]).toContain(del.status());

        cart = await getCart(request, cartId);
        expect(cartState(cart)).toBe("Empty");

        await deleteCart(request, cartId).catch(() => { });
    });

    test("Sequence: Empty -> add P1 -> add P2 -> delete P1 -> HasItems (P2 remains)", async ({ request }) => {
        const cartId = await createCart(request);

        await updateQuantity(request, cartId, P1, 1);
        await updateQuantity(request, cartId, P2, 1);

        let cart = await getCart(request, cartId);
        expect(cart.cart_items?.length).toBeGreaterThanOrEqual(2);

        await deleteProduct(request, cartId, P1);

        cart = await getCart(request, cartId);
        expect(cartState(cart)).toBe("HasItems");
        expect(cart.cart_items?.some(i => i.product_id === P1)).toBeFalsy();
        expect(cart.cart_items?.some(i => i.product_id === P2)).toBeTruthy();

        await deleteCart(request, cartId).catch(() => { });
    });

    test("Invalid: Empty -> deleteProduct should be rejected OR no-op (never 500)", async ({ request }) => {
        const cartId = await createCart(request);

        const del = await deleteProduct(request, cartId, P1);
        expect(del.status()).not.toBe(500);
        expect([200, 204, 404, 409, 422]).toContain(del.status());

        const cart = await getCart(request, cartId);
        expect(cartState(cart)).toBe("Empty");

        await deleteCart(request, cartId).catch(() => { });
    });

    test("Invalid input: updateQuantity qty 0 or negative should be rejected OR treated as remove (never 500)", async ({ request }) => {
        const cartId = await createCart(request);

        const res0 = await updateQuantity(request, cartId, P1, 0);
        expect(res0.status()).not.toBe(500);

        const resNeg = await updateQuantity(request, cartId, P1, -1);
        expect(resNeg.status()).not.toBe(500);

        await deleteCart(request, cartId).catch(() => { });
    });
});
