const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('exmail') || p.url().includes('work.weixin'));
    if (!page) {
      console.error('❌ Exmail page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔗 Connected to page: ${page.url()}`);
    
    // Dump outerHTML of elements containing "设置" or "邮箱首页"
    const elementsInfo = await page.evaluate(() => {
      const results = [];
      
      function searchDoc(doc, name) {
        const els = Array.from(doc.querySelectorAll('*'));
        for (const el of els) {
          if (el.textContent && el.textContent.includes('设置') && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
            results.push({
              tag: el.tagName,
              id: el.id,
              className: el.className,
              text: el.textContent.trim().substring(0, 100),
              name: name
            });
          }
        }
      }

      searchDoc(document, 'main');

      const frames = Array.from(document.querySelectorAll('iframe'));
      for (const frame of frames) {
        try {
          const doc = frame.contentDocument || frame.contentWindow.document;
          searchDoc(doc, 'frame_' + (frame.id || frame.name || 'unnamed'));
        } catch (e) {
          results.push({ error: e.message, frameId: frame.id });
        }
      }
      return results;
    });

    console.log(JSON.stringify(elementsInfo, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
