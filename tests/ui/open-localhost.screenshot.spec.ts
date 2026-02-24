import { test } from '@playwright/test';

test('open http://localhost:4200 and take screenshot', async ({ page }) => {
  // Navigate to the local app and wait until network is idle
  await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });

  // Use Playwright's test output directory so the file is placed under the run's artifacts
  const screenshotPath = test.info().outputPath('localhost-4200.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
});
