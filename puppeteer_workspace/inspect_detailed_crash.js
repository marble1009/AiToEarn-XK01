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
      console.log('No tab found with "aurastring.cloud" in URL.');
      await browser.disconnect();
      return;
    }

    console.log(`\n--- Inspecting Target Tab: ${targetPage.url()} ---`);

    // Intercept console messages including detailed arguments
    targetPage.on('console', async msg => {
      try {
        const args = await Promise.all(msg.args().map(async arg => {
          try {
            return await arg.jsonValue();
          } catch (e) {
            return arg.toString();
          }
        }));
        console.log(`[BROWSER CONSOLE] [${msg.type()}]`, ...args);
      } catch (err) {
        console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
      }
    });

    // Intercept unhandled page exceptions
    targetPage.on('pageerror', err => {
      console.error(`❌ [BROWSER EXCEPTION]:`, err.stack || err.toString());
    });

    // Inject listener on new document before any scripts execute
    await targetPage.evaluateOnNewDocument(() => {
      window.addEventListener('error', function(e) {
        console.error('Captured Window Error Event:', e.message, 'at', e.filename, ':', e.lineno, ':', e.colno, 'Error object:', e.error ? e.error.stack : 'none');
      }, true);
      window.addEventListener('unhandledrejection', function(e) {
        console.error('Captured Unhandled Rejection:', e.reason ? (e.reason.stack || e.reason) : 'none');
      }, true);
    });

    console.log('Reloading target tab to capture crash logs...');
    await targetPage.reload({ waitUntil: 'load', timeout: 20000 }).catch(err => {
      console.log('Reload reached timeout/error:', err.message);
    });

    console.log('Waiting 6 seconds for any hydration or rendering exceptions to settle...');
    await new Promise(r => setTimeout(r, 6000));

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error in inspect script:', err);
  }
})();
