// tests/hybrid/favorites/favorites.ui-api.state-transition.spec.ts
import { test, expect, request as pwRequest, APIRequestContext, Page, Locator } from "@playwright/test";
import { HomePage } from "../../../src/pages/HomePage.js";
import { LoginPage } from "../../../src/pages/LoginPage.js";
import { NavigationSection } from "../../../src/components/NavigationSection.js";
import { loginCustomer } from "../../api/_helpers/authApi.js";

type Favorite = {
  id: string;
  user_id: string;
  product_id: string;
  product?: { id: string; name: string };
};

function extractProductIdFromPath(pathname: string) {
  // "/product/<id>"
  const m = pathname.match(/\/product\/([^/?#]+)/i);
  return m?.[1];
}

async function getFirstProductLink(page: Page): Promise<Locator> {
  const first = page.locator('a[href^="/product/"]').first();
  await expect(first).toBeVisible();
  return first;
}

async function newAuthedApi(apiBaseURL: string, token: string): Promise<APIRequestContext> {
  return pwRequest.newContext({
    baseURL: apiBaseURL,
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

// --- Favorites API helpers (kept local to the spec for simplicity) ---
async function listFavorites(api: APIRequestContext): Promise<Favorite[]> {
  const res = await api.get("/favorites");
  expect(res.status(), `GET /favorites failed`).toBe(200);
  return (await res.json()) as Favorite[];
}

async function addFavorite(api: APIRequestContext, productId: string) {
  const res = await api.post("/favorites", { data: { product_id: productId } });
  // Some apps return 200, some 201
  expect([200, 201]).toContain(res.status());
  return (await res.json()) as Favorite;
}

async function deleteFavorite(api: APIRequestContext, favoriteId: string) {
  const res = await api.delete(`/favorites/${favoriteId}`);
  expect([200, 204]).toContain(res.status());
}

test("Favorites state transition (Hybrid UI+API): NotFavorite -> Favorite -> NotFavorite", async ({ page }) => {
  const apiBaseURL = process.env.API_BASE_URL || "http://localhost:8091";

  // Use env if you have them; defaults work for the Toolshop demo data.
  const email = process.env.CUSTOMER_EMAIL || "customer@practicesoftwaretesting.com";
  const password = process.env.CUSTOMER_PASSWORD || "welcome01";

  // ---------------------------
  // 0) Login via UI (real user flow)
  // ---------------------------
  const home = new HomePage(page);
  const login = new LoginPage(page);

  await home.open();
  await login.openViaHome();
  await login.login(email, password);

  // Basic “logged in” smoke check: favorites nav exists in account sidebar
  // (If your UI lands elsewhere, you can remove this assertion)
  await expect(page.locator('[data-test="nav-favorites"]')).toBeVisible();

  // ---------------------------
  // 1) UI: discover a real product (no hardcoding)
  // ---------------------------
  // Go back to catalog/home to pick a product
  await home.open();

  const nav = new NavigationSection(page);
  await nav.goToHandTools();

  const firstProduct = await getFirstProductLink(page);
  await firstProduct.click();

  await expect(page).toHaveURL(/\/product\//i);

  const productId = extractProductIdFromPath(new URL(page.url()).pathname);
  expect(productId, `Could not extract productId from URL: ${page.url()}`).toBeTruthy();

  const productName = (await page.locator('[data-test="product-name"]').first().textContent())?.trim();
  expect(productName, "Could not read product name on product detail page").toBeTruthy();

  // ---------------------------
  // 2) API: get token + create authenticated API context
  // ---------------------------
  const token = await loginCustomer(apiBaseURL, email, password);
  const api = await newAuthedApi(apiBaseURL, token);

  try {
    // ---------------------------
    // 3) Negative check (logged out): POST /favorites should be rejected
    // ---------------------------
    const anon = await pwRequest.newContext({
      baseURL: apiBaseURL,
      extraHTTPHeaders: { Accept: "application/json", "Content-Type": "application/json" },
    });
    const anonRes = await anon.post("/favorites", { data: { product_id: productId } });
    expect([401, 403]).toContain(anonRes.status());
    await anon.dispose();

    // ---------------------------
    // 4) Ensure clean start: NotFavorite
    // ---------------------------
    const existing = await listFavorites(api);
    const already = existing.find((f) => f.product_id === productId);
    if (already) {
      await deleteFavorite(api, already.id);
    }

    await expect
      .poll(async () => (await listFavorites(api)).some((f) => f.product_id === productId))
      .toBe(false);

    // ---------------------------
    // 5) Transition: NotFavorite -> Favorite (API)
    // ---------------------------
    const created = await addFavorite(api, productId!);
    expect(created.product_id).toBe(productId);

    // verify backend state
    await expect
      .poll(async () => (await listFavorites(api)).some((f) => f.product_id === productId))
      .toBe(true);

    // ---------------------------
    // 6) UI: verify appears in Favorites page
    // ---------------------------
    await page.goto("/account/favorites", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-test="nav-favorites"]')).toBeVisible();

    // Use product name (more human meaningful than id)
    await expect(page.getByText(productName!)).toBeVisible();

    // ---------------------------
    // 7) Transition: Favorite -> NotFavorite (API delete)
    // ---------------------------
    // Find the favorite id from the list (don’t rely on create response shape only)
    const afterAdd = await listFavorites(api);
    const fav = afterAdd.find((f) => f.product_id === productId);
    expect(fav, "Expected favorite to exist after add").toBeTruthy();

    await deleteFavorite(api, fav!.id);

    // verify backend state
    await expect
      .poll(async () => (await listFavorites(api)).some((f) => f.product_id === productId))
      .toBe(false);

    // ---------------------------
    // 8) UI: verify removed (refresh Favorites page)
    // ---------------------------
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText(productName!)).toHaveCount(0);
  } finally {
    await api.dispose();
  }
});