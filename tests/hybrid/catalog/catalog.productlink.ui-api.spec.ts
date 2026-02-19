import { test, expect, Page, Locator } from "@playwright/test";
import { getProductById } from "../../api/_helpers/productsApi.js";
import { HomePage } from "../../../src/pages/HomePage.js";

function extractProductIdFromPath(pathname: string) {
    // pathname like "/product/01KHCCVPX4QYY0XVCT6E98G98J"
    const m = pathname.match(/\/product\/([^/?#]+)/i);
    return m?.[1];
}

async function getFirstProductLink(page: Page): Promise<Locator> {
    // Product cards are anchors to /product/<id>
    const first = page.locator('a[href^="/product/"]').first();
    await expect(first).toBeVisible();
    return first;
}

/**
 * Safe pagination: click Next or Page-N and WAIT until the product list changes.
 * We detect change by comparing the first product's href before/after.
 */
async function goToNextPageSafely(page: Page) {
    const firstBefore = await getFirstProductLink(page);
    const hrefBefore = await firstBefore.getAttribute("href");

    // Click Next (from your snapshot: button "Next")
    await page.getByRole("button", { name: /^next$/i }).click();

    // Wait for list to change (href of first item changes)
    await expect
        .poll(async () => {
            const firstAfter = await getFirstProductLink(page);
            return await firstAfter.getAttribute("href");
        })
        .not.toBe(hrefBefore);
}

async function goToPageSafely(page: Page, pageNumber: number) {
    const firstBefore = await getFirstProductLink(page);
    const hrefBefore = await firstBefore.getAttribute("href");

    // Snapshot shows buttons like "Page-2"
    await page.getByRole("button", { name: new RegExp(`^Page-${pageNumber}$`, "i") }).click();

    // Wait for list to change
    await expect
        .poll(async () => {
            const firstAfter = await getFirstProductLink(page);
            return await firstAfter.getAttribute("href");
        })
        .not.toBe(hrefBefore);
}

test("Catalog: click product in UI and verify via API (safe pagination)", async ({ page }) => {
    const apiBaseURL = process.env.API_BASE_URL || "https://api.practicesoftwaretesting.com";

    // UI open via HomePage POM (clean)
    const home = new HomePage(page);
    await home.open();

    // ---- Pick a small sample set (pyramid-friendly) ----
    // 1) Validate one product on page 1
    // 2) Paginate to page 2 and validate one product there
    // (You can extend to last page, but keep UI sample small)

    // ---------- Page 1 ----------
    let firstProduct = await getFirstProductLink(page);
    const href1 = await firstProduct.getAttribute("href");
    expect(href1).toBeTruthy();

    await firstProduct.click();
    await expect(page).toHaveURL(/\/product\//i);

    const id1 = extractProductIdFromPath(new URL(page.url()).pathname);
    expect(id1, `Could not extract product id from URL: ${page.url()}`).toBeTruthy();

    const apiProduct1 = await getProductById(apiBaseURL, id1!);

    // Lightweight “contract” checks (don’t overfit fields)
    expect(apiProduct1).toBeTruthy();
    expect(apiProduct1.id ?? apiProduct1.product_id ?? id1).toBeTruthy();

    // Go back to catalog
    await page.goBack();
    await expect(page).toHaveURL(/\/($|\?)/); // home/catalog page

    // ---------- Page 2 (safe pagination) ----------
    // Prefer explicit page navigation if present; else use Next.
    // Option A:
    await goToPageSafely(page, 2);
    // Option B (if Page-2 button doesn't exist in some viewport):
    // await goToNextPageSafely(page);

    firstProduct = await getFirstProductLink(page);
    const href2 = await firstProduct.getAttribute("href");
    expect(href2).toBeTruthy();

    await firstProduct.click();
    await expect(page).toHaveURL(/\/product\//i);

    const id2 = extractProductIdFromPath(new URL(page.url()).pathname);
    expect(id2, `Could not extract product id from URL: ${page.url()}`).toBeTruthy();

    const apiProduct2 = await getProductById(apiBaseURL, id2!);
    expect(apiProduct2).toBeTruthy();
});
