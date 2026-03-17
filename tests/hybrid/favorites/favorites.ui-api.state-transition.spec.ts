import {
  test,
  expect,
  request as pwRequest,
  APIRequestContext,
  Page,
  Locator,
} from "@playwright/test";
import { getProductById } from "../../api/_helpers/productsApi.js";
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

function extractProductIdFromUrl(url: string) {
  const decoded = decodeURIComponent(url);
  const m = decoded.match(/\/product\/([^/?#]+)/i) || decoded.match(/#\/product\/([^/?#]+)/i);
  return m?.[1];
}

async function getFirstProductLink(page: Page): Promise<Locator> {
  const first = page
    .locator('a[href*="/product/"], a[href*="#/product/"]')
    .first();

  await expect(first).toBeVisible({ timeout: 15_000 });
  return first;
}

async function newAuthedApi(
  apiBaseURL: string,
  token: string
): Promise<APIRequestContext> {
  return pwRequest.newContext({
    baseURL: apiBaseURL,
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function listFavorites(api: APIRequestContext): Promise<Favorite[]> {
  const res = await api.get("/favorites");
  expect(res.status(), `GET /favorites failed`).toBe(200);
  return (await res.json()) as Favorite[];
}

async function addFavorite(api: APIRequestContext, productId: string) {
  const res = await api.post("/favorites", { data: { product_id: productId } });
  expect([200, 201]).toContain(res.status());
  return (await res.json()) as Favorite;
}

async function deleteFavorite(api: APIRequestContext, favoriteId: string) {
  const res = await api.delete(`/favorites/${favoriteId}`);
  expect([200, 204]).toContain(res.status());
}

test("Favorites state transition (Hybrid UI+API): NotFavorite -> Favorite -> NotFavorite", async ({
  page,
}) => {
  const apiBaseURL = process.env.API_BASE_URL || "http://localhost:8091";
  const email =
    process.env.CUSTOMER_EMAIL || "customer@practicesoftwaretesting.com";
  const password = process.env.CUSTOMER_PASSWORD || "welcome01";

  const home = new HomePage(page);
  const login = new LoginPage(page);

  await home.open();
  await login.openViaHome();
  await login.login(email, password);

  // Go to catalog and pick a real product
  await home.open();
  await home.waitForCatalogReady();

  const nav = new NavigationSection(page);
  await nav.goToHandTools();

  const firstProduct = await getFirstProductLink(page);
  await firstProduct.click();

  await expect(page).toHaveURL(/product/i);

  const productId = extractProductIdFromUrl(page.url());
  expect(
    productId,
    `Could not extract productId from URL: ${page.url()}`
  ).toBeTruthy();

  // More defensive product name capture
  const apiProduct = await getProductById(apiBaseURL, productId!);
const productName = (apiProduct.name || "").trim();
expect(productName, "Could not resolve product name from API").toBeTruthy();

  const token = await loginCustomer(apiBaseURL, email, password);
  const api = await newAuthedApi(apiBaseURL, token);

  try {
    const anon = await pwRequest.newContext({
      baseURL: apiBaseURL,
      extraHTTPHeaders: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const anonRes = await anon.post("/favorites", {
      data: { product_id: productId },
    });
    expect([401, 403]).toContain(anonRes.status());
    await anon.dispose();

    const existing = await listFavorites(api);
    const already = existing.find((f) => f.product_id === productId);
    if (already) {
      await deleteFavorite(api, already.id);
    }

    await expect
      .poll(async () =>
        (await listFavorites(api)).some((f) => f.product_id === productId)
      )
      .toBe(false);

    const created = await addFavorite(api, productId!);
    expect(created.product_id).toBe(productId);

    await expect
      .poll(async () =>
        (await listFavorites(api)).some((f) => f.product_id === productId)
      )
      .toBe(true);

    await page.goto("/#/account/favorites", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/favorites/i);

    await expect(page.getByText(productName!)).toBeVisible();

    const afterAdd = await listFavorites(api);
    const fav = afterAdd.find((f) => f.product_id === productId);
    expect(fav, "Expected favorite to exist after add").toBeTruthy();

    await deleteFavorite(api, fav!.id);

    await expect
      .poll(async () =>
        (await listFavorites(api)).some((f) => f.product_id === productId)
      )
      .toBe(false);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText(productName!)).toHaveCount(0);
  } finally {
    await api.dispose();
  }
});