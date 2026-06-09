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
    
    // Find the A tag with text "设置" and get its attributes
    const aInfo = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const settingsLink = links.find(el => el.textContent.trim() === '设置');
      if (settingsLink) {
        return {
          href: settingsLink.getAttribute('href'),
          onclick: settingsLink.getAttribute('onclick'),
          outerHTML: settingsLink.outerHTML,
          text: settingsLink.textContent
        };
      }
      return null;
    });

    console.log('Settings link info:', JSON.stringify(aInfo, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
