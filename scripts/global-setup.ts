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

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to login and perform login
  try {
    await page.goto(process.env.BASE_URL || 'http://localhost:4200/auth/login', { waitUntil: 'networkidle' });
    await page.fill('[data-test="email"]', email);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-submit"]');

    // Wait for navigation to account or success indicator
    await page.waitForURL(/\/account/, { timeout: 20_000 }).catch(() => null);

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
