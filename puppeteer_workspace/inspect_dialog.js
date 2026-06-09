const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('cloud.tencent.com'));

    if (!page) {
      console.error('❌ Tencent Cloud tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected! Current URL: ${page.url()}`);
    
    const elementsInfo = await page.evaluate(() => {
      // Find all inputs in the page
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map((input, idx) => ({
        index: idx,
        tagName: input.tagName,
        type: input.type,
        placeholder: input.placeholder,
        value: input.value,
        className: input.className,
        id: input.id,
        name: input.name
      }));
    });

    console.log('Inputs found in the page:', JSON.stringify(elementsInfo, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
