const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    // Let's find the OrcaTerm page
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    
    if (!orcaPage) {
      console.error('OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`Found OrcaTerm page: ${orcaPage.url()}`);
    
    // Take a screenshot
    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\orcaterm.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Let's check some selectors or iframe / elements
    const elements = await orcaPage.evaluate(() => {
      const results = [];
      // Look for iframes
      document.querySelectorAll('iframe').forEach((iframe, i) => {
        results.push({ type: 'iframe', index: i, src: iframe.src, id: iframe.id, className: iframe.className });
      });
      // Look for textareas or input elements
      document.querySelectorAll('textarea, input, [contenteditable]').forEach(el => {
        results.push({ type: el.tagName.toLowerCase(), id: el.id, className: el.className, placeholder: el.placeholder });
      });
      return results;
    });
    console.log('DOM Elements found:', JSON.stringify(elements, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
