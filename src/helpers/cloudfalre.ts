import { Page, expect } from "@playwright/test";

/**
 * Best-effort Cloudflare checkbox handler.
 * Works sometimes for simple "Verify you are human" checkbox challenges.
 * Will NOT reliably bypass Turnstile/managed challenges (by design).
 */
export async function handleCloudflareIfPresent(page: Page, opts?: { timeoutMs?: number }) {
  const timeoutMs = opts?.timeoutMs ?? 12000;

  // Common Cloudflare/Turnstile markers
  const cfIndicators = [
    page.getByText(/verify you are human/i),
    page.getByText(/checking your browser/i),
    page.locator("iframe[title*='challenge' i]"),
    page.locator("iframe[src*='turnstile' i]"),
    page.locator("#challenge-form"),
  ];

  // Quick check: is any indicator visible?
  const isChallenge = await Promise.race(
    cfIndicators.map(async (l) => (await l.first().isVisible().catch(() => false)) ? true : false)
  ).catch(() => false);

  if (!isChallenge) return; // no CF challenge

  // If challenge page, try to click checkbox inside iframe
  const iframeLocator =
    page.frameLocator("iframe[src*='turnstile' i], iframe[title*='challenge' i], iframe");

  const checkbox = iframeLocator.locator("input[type='checkbox'], label:has(input[type='checkbox'])").first();

  // Some challenges render as "Verify you are human" with a checkbox
  if (await checkbox.isVisible().catch(() => false)) {
    await checkbox.click({ timeout: timeoutMs }).catch(() => {});
  } else {
    // Sometimes checkbox is inside a smaller nested frame; try common container
    await iframeLocator.locator("label").first().click({ timeout: timeoutMs }).catch(() => {});
  }

  // Give Cloudflare time to validate and redirect
  await page.waitForLoadState("networkidle", { timeout: timeoutMs }).catch(() => {});
}