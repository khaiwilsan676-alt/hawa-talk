const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:3000/owner');

  await page.evaluate(() => {
    localStorage.setItem('ownerPanelLoggedIn', 'true');
  });

  await page.reload();
  await page.waitForTimeout(2000);

  await browser.close();
})();
