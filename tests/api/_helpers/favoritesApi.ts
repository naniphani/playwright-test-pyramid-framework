import { APIRequestContext, expect } from "@playwright/test";

export type Favorite = {
  id: string;
  user_id: string;
  product_id: string;
  product?: { id: string; name: string; price: number };
};

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function addFavorite(
  api: APIRequestContext,
  apiBaseURL: string,
  token: string,
  productId: string
): Promise<Favorite> {
  const res = await api.post(`${apiBaseURL}/favorites`, {
    headers: authHeaders(token),
    data: { product_id: productId },
  });

  expect([200, 201]).toContain(res.status());
  const body = (await res.json()) as Favorite;
  expect(body?.id).toBeTruthy();
  expect(body?.product_id).toBe(productId);
  return body;
}

export async function listFavorites(
  api: APIRequestContext,
  apiBaseURL: string,
  token: string
): Promise<Favorite[]> {
  const res = await api.get(`${apiBaseURL}/favorites`, {
    headers: authHeaders(token),
  });

  expect(res.status()).toBe(200);
  return (await res.json()) as Favorite[];
}

export async function deleteFavoriteById(
  api: APIRequestContext,
  apiBaseURL: string,
  token: string,
  favoriteId: string
) {
  const res = await api.delete(`${apiBaseURL}/favorites/${favoriteId}`, {
    headers: authHeaders(token),
  });

  // Some APIs return 200, some 204
  expect([200, 204]).toContain(res.status());
  return res;
}

export async function findFavoriteIdByProductId(
  api: APIRequestContext,
  apiBaseURL: string,
  token: string,
  productId: string
): Promise<string | undefined> {
  const favs = await listFavorites(api, apiBaseURL, token);
  return favs.find((f) => f.product_id === productId)?.id;
}

export async function waitUntilFavorited(
  api: APIRequestContext,
  apiBaseURL: string,
  token: string,
  productId: string,
  expected: boolean,
  timeoutMs = 7000
) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const favs = await listFavorites(api, apiBaseURL, token);
    const isFav = favs.some((f) => f.product_id === productId);
    if (isFav === expected) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Timed out waiting favorites expected=${expected} for product=${productId}`
  );
}