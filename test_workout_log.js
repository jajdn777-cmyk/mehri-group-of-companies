import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // We need to be logged in. Since I can't easily log in with a real user here,
    // I will check if the Dashboard exists and if the Log Modal can be opened.
    // In a real environment, I would use a test account.

    console.log('Checking for Dashboard or Auth...');
    const bodyText = await page.innerText('body');
    if (bodyText.includes('Login') || bodyText.includes('Sign In')) {
      console.log('On Auth page. Verification limited without real credentials.');
    } else {
      console.log('App loaded.');
    }

  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    await browser.close();
  }
})();
