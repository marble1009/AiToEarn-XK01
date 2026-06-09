const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('exmail') || p.url().includes('work.weixin'));
    if (!page) {
      console.error('❌ Exmail page not found!');
      await browser.disconnect();
      return;
    }

    const elements = await page.evaluate(() => {
      const results = [];
      // Find all buttons, inputs, links that are visible or in the dialog
      const dialog = document.querySelector('.dialog') || document.querySelector('.dialog_active') || document.body;
      
      dialog.querySelectorAll('input, button, a').forEach(el => {
        results.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          text: el.innerText || el.value || '',
          placeholder: el.getAttribute('placeholder') || '',
          value: el.value || '',
          type: el.getAttribute('type') || ''
        });
      });
      return results;
    });

    console.log('Dialog Elements:');
    console.log(JSON.stringify(elements, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
