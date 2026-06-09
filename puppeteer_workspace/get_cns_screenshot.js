const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('cloud.tencent.com'));

    if (!page) {
      console.error('❌ Tencent Cloud tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected! Current URL: ${page.url()}`);
    await page.bringToFront();

    const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch';
    const screenshotPath = path.join(scratchDir, 'dns_cns_live_state.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Deployed records screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
