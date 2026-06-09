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

    console.log('Navigating to DNS Pod Console...');
    await page.goto('https://console.cloud.tencent.com/cns', { waitUntil: 'networkidle2' });
    
    console.log('⏳ Waiting 8 seconds for DNS console to load...');
    await new Promise(r => setTimeout(r, 8000));
    
    const dnsScreenshotPath = path.join(scratchDir, 'dns_console.png');
    await page.screenshot({ path: dnsScreenshotPath });
    console.log(`📸 DNS Console screenshot saved to: ${dnsScreenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
