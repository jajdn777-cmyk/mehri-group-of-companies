const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 2000 });
  await page.goto('http://localhost:3000');

  // Wait for animations
  await page.waitForTimeout(2000);

  // Take screenshot of sections
  await page.screenshot({ path: 'landing_full.png', fullPage: true });

  console.log('Screenshots taken');
  await browser.close();
})();
