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

    const mainFrame = page.frames().find(f => f.name() === 'mainFrame');
    if (!mainFrame) {
      console.error('❌ mainFrame not found!');
      await browser.disconnect();
      return;
    }

    const elementInfo = await mainFrame.evaluate(() => {
      const els = Array.from(document.querySelectorAll('*'));
      const target = els.find(el => el.textContent.trim() === '生成新密码');
      if (!target) return 'Not found';
      return {
        tag: target.tagName,
        id: target.id,
        className: target.className,
        outerHTML: target.outerHTML,
        parentId: target.parentElement ? target.parentElement.id : null,
        parentTag: target.parentElement ? target.parentElement.tagName : null,
        parentOuterHTML: target.parentElement ? target.parentElement.outerHTML : null
      };
    });

    console.log('Element Info for "生成新密码":');
    console.log(JSON.stringify(elementInfo, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
