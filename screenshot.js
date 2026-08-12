const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  // Set local storage directly on an empty page on localhost
  await page.goto('http://localhost:3000');

  await page.evaluate(() => {
    localStorage.setItem('userEmail', 'test@example.com');
    localStorage.setItem('userUID', 'test12345');
    localStorage.setItem('userName', 'Test User');
    localStorage.setItem('userPhoto', '');
    localStorage.setItem('accountNumber', '10000001');
  });

  // Reload to apply state
  await page.reload();

  await page.waitForTimeout(2000); // wait for page to render

  await page.screenshot({ path: 'frontend_screenshot_verify.png' });

  await browser.close();
})();
