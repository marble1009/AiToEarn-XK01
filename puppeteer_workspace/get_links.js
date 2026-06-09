const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages[0];
    
    const elements = await page.evaluate(() => {
      const results = [];
      // Get all buttons
      document.querySelectorAll('button').forEach(btn => {
        results.push({
          tag: 'button',
          text: btn.innerText.trim(),
          id: btn.id,
          className: btn.className,
          visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
        });
      });
      // Get all links
      document.querySelectorAll('a').forEach(a => {
        results.push({
          tag: 'a',
          text: a.innerText.trim(),
          href: a.href,
          className: a.className,
          visible: a.offsetWidth > 0 && a.offsetHeight > 0
        });
      });
      return results;
    });

    console.log(JSON.stringify(elements, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
