const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const orcaPages = pages.filter(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    const orcaPage = orcaPages[orcaPages.length - 1];
    if (orcaPage) {
      const spath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\current_orca_status.png';
      await orcaPage.screenshot({ path: spath });
      console.log('Screenshot saved to:', spath);
    } else {
      console.log('OrcaPage not found');
    }
    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
