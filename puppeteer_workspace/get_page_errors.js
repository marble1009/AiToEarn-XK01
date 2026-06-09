const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    console.log(`Connected. Found ${pages.length} pages.`);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const url = page.url();
      console.log(`\n--- Inspecting Tab ${i}: ${url} ---`);
      
      // Capturing logs
      page.on('console', msg => console.log(`[BROWSER CONSOLE ${i}]: [${msg.type()}] ${msg.text()}`));
      page.on('pageerror', err => console.error(`❌ [BROWSER EXCEPTION ${i}]:`, err.toString()));
      
      // Read body tag outerHTML or some structure
      const body = await page.evaluate(() => {
        return document.body ? {
          tagName: document.body.tagName,
          text: document.body.innerText.substring(0, 1000),
          htmlLength: document.body.innerHTML.length
        } : 'No body';
      });
      console.log('Body Info:', JSON.stringify(body, null, 2));
      
      // Reload and wait 5 seconds to capture any immediate console exceptions!
      console.log(`Reloading Tab ${i}...`);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => console.log('Reload timeout, continuing...'));
      await new Promise(r => setTimeout(r, 4000));
    }
    
    await browser.disconnect();
    console.log('\n✨ Inspection finished successfully!');
  } catch (err) {
    console.error('Error during inspection:', err);
  }
})();
