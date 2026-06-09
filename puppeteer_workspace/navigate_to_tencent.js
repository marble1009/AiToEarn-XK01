const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages[0];
    
    console.log('Navigating page to Tencent Cloud login...');
    await page.goto('https://cloud.tencent.com/login', { waitUntil: 'networkidle2' });
    
    const textContent = await page.evaluate(() => document.body.innerText);
    console.log('--- Tencent Login Page inner text ---');
    console.log(textContent.substring(0, 1000));
    console.log('--------------------------------------');

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\tencent_login.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
