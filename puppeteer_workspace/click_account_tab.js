const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to Chrome...');
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('exmail') || p.url().includes('work.weixin'));
    if (!page) {
      console.error('❌ Exmail page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔗 Connected to page: ${page.url()}`);
    await page.bringToFront();

    // Click the "账户" tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('a, span, div, li'));
      const accountTab = tabs.find(el => el.textContent.trim() === '账户');
      if (accountTab) {
        accountTab.click();
        console.log('Clicked "账户" tab');
      } else {
        console.error('Could not find "账户" tab');
      }
    });

    await new Promise(r => setTimeout(r, 2000));

    const screenshotPath = path.join(artifactDir, 'scratch', 'exmail_account_tab.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
