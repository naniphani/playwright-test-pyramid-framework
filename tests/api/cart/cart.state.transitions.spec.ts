import { test, expect } from "@playwright/test";
import {
  createCart,
  getCart,
  cartState,
  updateQuantityRaw,
  updateQuantityAndVerify,
  deleteProduct,
  deleteCart,
} from "../_helpers/cartApi.js";

const P1 = "01KHEPBPE2M398RCTAAH4QSPB9"; // hammer
const P2 = "01KHEPBPFWX8AS4A1SY2DRG438"; // sander

test.describe("Cart - State Transition Testing (API Pyramid Base)", () => {
  test("Empty -> updateQuantity does not create item implicitly (never 500)", async ({
    request,
  }) => {
    const cartId = await createCart(request);

    const res = await updateQuantityRaw(request, cartId, {
      product_id: P1,
      quantity: 1,
    });

    expect(res.status()).not.toBe(500);
    expect([200, 201, 204, 400, 404, 409, 422]).toContain(res.status());

    const cart = await getCart(request, cartId);
    expect(cartState(cart)).toBe("Empty");

    await deleteCart(request, cartId).catch(() => {});
  });

  test("Empty -> updateQuantity with alternate payload naming should not 500", async ({
    request,
  }) => {
    const cartId = await createCart(request);

    const res = await updateQuantityRaw(request, cartId, {
      productId: P1,
      qty: 1,
    });

    expect(res.status()).not.toBe(500);
    expect([200, 201, 204, 400, 404, 409, 422]).toContain(res.status());

    await deleteCart(request, cartId).catch(() => {});
  });

  test("Invalid: Empty -> deleteProduct should be rejected OR no-op (never 500)", async ({
    request,
  }) => {
    const cartId = await createCart(request);

    const del = await deleteProduct(request, cartId, P1);
    expect(del.status()).not.toBe(500);
    expect([200, 204, 404, 409, 422]).toContain(del.status());

    const cart = await getCart(request, cartId);
    expect(cartState(cart)).toBe("Empty");

    await deleteCart(request, cartId).catch(() => {});
  });

  test("Invalid input: updateQuantity qty 0 or negative should be rejected OR treated as no-op (never 500)", async ({
    request,
  }) => {
    const cartId = await createCart(request);

    const res0 = await updateQuantityRaw(request, cartId, {
      product_id: P1,
      quantity: 0,
    });
    expect(res0.status()).not.toBe(500);
    expect([200, 201, 204, 400, 404, 409, 422]).toContain(res0.status());

    const resNeg = await updateQuantityRaw(request, cartId, {
      product_id: P1,
      quantity: -1,
    });
    expect(resNeg.status()).not.toBe(500);
    expect([200, 201, 204, 400, 404, 409, 422]).toContain(resNeg.status());

    const cart = await getCart(request, cartId);
    expect(cartState(cart)).toBe("Empty");

    await deleteCart(request, cartId).catch(() => {});
  });

  test.skip("HasItems -> updateQuantity change qty -> HasItems (enable when API supports add/setup path)", async ({
    request,
  }) => {
    const cartId = await createCart(request);

    // This test is intentionally skipped for now because the current API
    // behavior does not appear to support creating a cart line item via
    // updateQuantity on an empty cart.
    await updateQuantityAndVerify(request, cartId, P1, 1);
    const upd = await updateQuantityAndVerify(request, cartId, P1, 3);
    expect([200, 201, 204]).toContain(upd.status());

    const cart = await getCart(request, cartId);
    const item = cart.cart_items?.find((i) => i.product_id === P1);
    expect(item).toBeTruthy();
    expect(Number(item!.quantity)).toBe(3);

    await deleteCart(request, cartId).catch(() => {});
  });

  test.skip("Sequence: add P1 -> add P2 -> delete P1 -> HasItems (enable when API supports add/setup path)", async ({
    request,
  }) => {
    const cartId = await createCart(request);

    await updateQuantityAndVerify(request, cartId, P1, 1);
    await updateQuantityAndVerify(request, cartId, P2, 1);

    let cart = await getCart(request, cartId);
    expect(cart.cart_items?.length).toBeGreaterThanOrEqual(2);

    await deleteProduct(request, cartId, P1);

    cart = await getCart(request, cartId);
    expect(cartState(cart)).toBe("HasItems");
    expect(cart.cart_items?.some((i) => i.product_id === P1)).toBeFalsy();
    expect(cart.cart_items?.some((i) => i.product_id === P2)).toBeTruthy();

    await deleteCart(request, cartId).catch(() => {});
  });
});