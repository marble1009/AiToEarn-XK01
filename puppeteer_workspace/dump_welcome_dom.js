const puppeteer = require('puppeteer-core');
(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const testPage = await browser.newPage();
    await testPage.goto('http://aurastring.cloud', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    
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
