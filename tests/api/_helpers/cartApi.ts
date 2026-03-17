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

export async function getCart(
  api: APIRequestContext,
  cartId: string
): Promise<Cart> {
  const res = await api.get(ENDPOINTS.carts.get(cartId));
  expect(res.status()).toBe(200);
  return (await res.json()) as Cart;
}

/**
 * Low-level raw call.
 * Use this for contract / negative / ambiguous tests where the API
 * may legally return success but perform no state change.
 */
export async function updateQuantityRaw(
  api: APIRequestContext,
  cartId: string,
  data: Record<string, unknown>
) {
  const url = ENDPOINTS.carts.updateQuantity(cartId);
  return api.put(url, { data });
}

/**
 * Higher-level helper for positive flows only.
 * It tries common payload variants and verifies the cart item quantity
 * actually changed to the requested value.
 */
export async function updateQuantityAndVerify(
  api: APIRequestContext,
  cartId: string,
  productId: string,
  quantity: number
) {
  const url = ENDPOINTS.carts.updateQuantity(cartId);

  const payloads = [
    { product_id: productId, quantity },
    { productId: productId, quantity },
    { product_id: productId, qty: quantity },
    { productId: productId, qty: quantity },
  ];

  for (const data of payloads) {
    const res = await api.put(url, { data });

    if (![200, 201, 204].includes(res.status())) {
      continue;
    }

    const after = await getCart(api, cartId);
    const item = after.cart_items?.find((i) => i.product_id === productId);

    if (item && Number(item.quantity) === quantity) {
      return res;
    }
  }

  const final = await getCart(api, cartId);
  throw new Error(
    `updateQuantityAndVerify() returned success but did not set expected quantity.\n` +
      `Tried payload variants: product_id/productId + quantity/qty.\n` +
      `URL: ${url}\n` +
      `Expected productId: ${productId}\n` +
      `Expected quantity: ${quantity}\n` +
      `Final cart: ${JSON.stringify(final, null, 2)}`
  );
}

export async function deleteProduct(
  api: APIRequestContext,
  cartId: string,
  productId: string
) {
  return api.delete(ENDPOINTS.carts.deleteProduct(cartId, productId));
}

export async function deleteCart(api: APIRequestContext, cartId: string) {
  return api.delete(ENDPOINTS.carts.deleteCart(cartId));
}