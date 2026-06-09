const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome on 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const dnsPage = pages.find(p => p.url().includes('console.cloud.tencent.com/cns/detail'));

    if (!dnsPage) {
      console.error('❌ DNS console page tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to DNS console! URL: ${dnsPage.url()}`);
    await dnsPage.bringToFront();
    await new Promise(r => setTimeout(r, 2000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5';
    const detailPath = path.join(artifactDir, 'scratch\\dns_current_records.png');
    await dnsPage.screenshot({ path: detailPath });
    console.log(`📸 DNS current records screenshot saved to: ${detailPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
