import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Generate storage state for an authenticated customer if credentials provided
export default async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    console.log('global-setup: No E2E_USER_EMAIL/E2E_USER_PASSWORD found; skipping storageState generation');
    return;
  }

  // Avoid running storage generation against localhost unless explicitly requested
  const base = process.env.BASE_URL || '';
  const allowLocal = (process.env.GENERATE_STORAGE_ON_LOCAL ?? 'false').toLowerCase() === 'true';
  if (/localhost|127\.0\.0\.1/.test(base) && !allowLocal) {
    console.log('global-setup: BASE_URL is localhost and GENERATE_STORAGE_ON_LOCAL is not true; skipping storageState generation');
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Helper to attempt navigation with retries
  async function gotoWithRetries(url: string, attempts = 3) {
    let lastErr: any = null;
    for (let i = 0; i < attempts; i++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
        return;
      } catch (err) {
        lastErr = err;
        console.warn(`global-setup: navigation attempt ${i + 1} failed`, err);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    throw lastErr;
  }

  // Navigate to login and perform login
  try {
    const loginUrl = (process.env.BASE_URL || 'http://localhost:4200') + '/auth/login';
    await gotoWithRetries(loginUrl, 3);

    // Wait for email input up to 60s
    await page.waitForSelector('[data-test="email"]', { timeout: 60_000 });
    await page.fill('[data-test="email"]', email);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-submit"]');

    // Wait for navigation to account or success indicator
    await page.waitForURL(/\/account/, { timeout: 30_000 }).catch(() => null);

    const outDir = path.resolve(process.cwd(), 'storage');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const statePath = path.join(outDir, 'customer.storageState.json');
    const storage = await context.storageState();
    fs.writeFileSync(statePath, JSON.stringify(storage, null, 2));
    console.log('global-setup: Wrote storage state to', statePath);
  } catch (err) {
    console.warn('global-setup: login failed during storage generation', err);
  } finally {
    await browser.close();
  }
}
