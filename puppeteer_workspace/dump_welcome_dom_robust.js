const puppeteer = require('puppeteer-core');
(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const testPage = await browser.newPage();
    
    console.log('Navigating with commit...');
    try {
      await testPage.goto('http://aurastring.cloud', { waitUntil: 'commit', timeout: 5000 });
    } catch (e) {
      console.log('Ignored timeout during commit');
    }
    
    // Wait for the body or container to appear
    console.log('Waiting 5s for hydration...');
    await new Promise(r => setTimeout(r, 5000));
    
    const elements = await testPage.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).map(el => ({
        tagName: el.tagName.toLowerCase(),
        text: el.innerText.trim(),
        href: el.href || null,
        className: el.className || null,
        id: el.id || null
      }));
    });
    console.log('--- Interactive Elements on Welcome Page ---');
    console.log(JSON.stringify(elements, null, 2));
    console.log('---------------------------------------------');
    
    await testPage.close();
    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
