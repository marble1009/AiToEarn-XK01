const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    console.log(`Connected. Found ${pages.length} pages.`);

    const targetPage = pages.find(p => p.url().includes('aurastring.cloud'));
    if (!targetPage) {
      console.log('No tab found with "aurastring.cloud" in URL. Exiting safely without action.');
      await browser.disconnect();
      return;
    }

    console.log(`\n--- Selected Target Tab: ${targetPage.url()} ---`);

    // Setup logging handlers
    targetPage.on('console', msg => {
      console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
    });
    targetPage.on('pageerror', err => {
      console.error(`❌ [BROWSER EXCEPTION]:`, err.toString());
    });

    console.log('Reloading target tab to capture the runtime client-side crash...');
    await targetPage.reload({ waitUntil: 'load', timeout: 15000 }).catch(err => {
      console.log('Reload encountered timeout/error but proceeding:', err.message);
    });

    console.log('Waiting 5 seconds for React components to finish rendering and throwing exceptions...');
    await new Promise(r => setTimeout(r, 5000));

    await browser.disconnect();
    console.log('Inspection complete.');
  } catch (err) {
    console.error('Error during live reload inspection:', err);
  }
})();
