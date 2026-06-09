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
      console.error('❌ Exmail page not found! Please run open_exmail.js first.');
      await browser.disconnect();
      return;
    }

    console.log(`🔗 Connected to page: ${page.url()}`);
    await page.bringToFront();

    // Find and click "其他方式登录" or any element containing "其他方式登录"
    console.log('👉 Clicking "其他方式登录"...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, span, div, button'));
      const otherLoginLink = links.find(el => el.textContent.includes('其他方式登录'));
      if (otherLoginLink) {
        otherLoginLink.click();
      } else {
        console.error('Could not find other login method link in page context');
      }
    });

    await new Promise(r => setTimeout(r, 2000));

    const screenshotPath = path.join(artifactDir, 'scratch', 'exmail_other_login.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
