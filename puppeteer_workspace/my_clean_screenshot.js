const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));

    if (!orcaPage) {
      console.error('❌ OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch\\deploy_progress.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`📸 Progress screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error taking clean screenshot:', err);
  }
})();
