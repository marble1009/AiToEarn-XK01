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
      // Find all elements containing the text "解析"
      const all = Array.from(document.querySelectorAll('*'));
      return all
        .filter(el => el.innerText && el.innerText.trim().includes('解析'))
        .map(el => ({
          tagName: el.tagName,
          className: el.className,
          text: el.innerText.substring(0, 100),
          childrenCount: el.children.length
        }));
    });

    console.log('Elements with "解析":', JSON.stringify(elementsInfo.slice(0, 30), null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
