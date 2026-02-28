import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173/';
const path = process.argv[3] || '/home/jules/verification/screenshot.png';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait for blog cards to load if they are there
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path, fullPage: true });
    console.log(`Screenshot saved to ${path}`);
  } catch (e) {
    console.error('Failed to take screenshot:', e);
  }
  await browser.close();
  process.exit(0);
})();
