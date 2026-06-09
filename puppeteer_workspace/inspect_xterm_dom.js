const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    
    if (!orcaPage) {
      console.error('OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    const domHTML = await orcaPage.evaluate(() => {
      const container = document.querySelector('.xterm-rows') || document.querySelector('.xterm');
      return container ? container.outerHTML : 'Not Found';
    });

    console.log('--- Xterm DOM HTML ---');
    console.log(domHTML.substring(0, 2000));
    console.log('----------------------');

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
