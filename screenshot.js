import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/home/jules/verification/final_landing.png', fullPage: true });
    console.log('Screenshot saved to /home/jules/verification/final_landing.png');
  } catch (e) {
    console.error('Failed to take screenshot:', e);
  }
  await browser.close();
  process.exit(0);
})();
