import { test, expect, Page, Locator } from "@playwright/test";
import { getProductById } from "../../api/_helpers/productsApi.js";
import { HomePage } from "../../../src/pages/HomePage.js";

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

async function goToPageSafely(page: Page, pageNumber: number) {
  const firstBefore = await getFirstProductLink(page);
  const hrefBefore = await firstBefore.getAttribute("href");

  await page
    .getByRole("button", { name: new RegExp(`^Page-${pageNumber}$`, "i") })
    .click();

  await expect
    .poll(async () => {
      const firstAfter = await getFirstProductLink(page);
      return await firstAfter.getAttribute("href");
    }, { timeout: 15_000 })
    .not.toBe(hrefBefore);
}

test("Catalog: click product in UI and verify via API (safe pagination)", async ({ page }) => {
  const apiBaseURL = process.env.API_BASE_URL || "http://localhost:8091";

  const home = new HomePage(page);
  await home.open();
  await home.waitForCatalogReady();

  // ---------- Page 1 ----------
  let firstProduct = await getFirstProductLink(page);
  const href1 = await firstProduct.getAttribute("href");
  expect(href1).toBeTruthy();

  await firstProduct.click();
  await expect(page).toHaveURL(/product/i);

  const id1 = extractProductIdFromUrl(page.url());
  expect(id1, `Could not extract product id from URL: ${page.url()}`).toBeTruthy();

  const apiProduct1 = await getProductById(apiBaseURL, id1!);
  expect(apiProduct1).toBeTruthy();
  expect(apiProduct1.id ?? apiProduct1.product_id ?? id1).toBeTruthy();

  await page.goBack({ waitUntil: "domcontentloaded" });
  await home.waitForCatalogReady();

  // ---------- Page 2 ----------
  await goToPageSafely(page, 2);

  firstProduct = await getFirstProductLink(page);
  const href2 = await firstProduct.getAttribute("href");
  expect(href2).toBeTruthy();

  await firstProduct.click();
  await expect(page).toHaveURL(/product/i);

  const id2 = extractProductIdFromUrl(page.url());
  expect(id2, `Could not extract product id from URL: ${page.url()}`).toBeTruthy();

  const apiProduct2 = await getProductById(apiBaseURL, id2!);
  expect(apiProduct2).toBeTruthy();
});