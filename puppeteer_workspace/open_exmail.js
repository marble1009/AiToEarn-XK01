const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to Chrome and opening Exmail login page...');
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    console.log(`🔌 Connected to Chrome, total pages: ${pages.length}`);

    // Check if an exmail page is already open
    let exmailPage = pages.find(p => p.url().includes('exmail') || p.url().includes('work.weixin'));
    if (!exmailPage) {
      console.log('🌐 Opening new page to https://exmail.qq.com/login ...');
      exmailPage = await browser.newPage();
      await exmailPage.goto('https://exmail.qq.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    } else {
      console.log('🔗 Found existing Exmail page! Bringing to front...');
      await exmailPage.bringToFront();
    }

    await new Promise(r => setTimeout(r, 3000));

    const screenshotPath = path.join(artifactDir, 'scratch', 'exmail_check.png');
    await exmailPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Script finished.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
