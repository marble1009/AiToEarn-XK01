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

    const html = await orcaPage.evaluate(() => {
      const el = document.querySelector('.terminal') || document.querySelector('.xterm');
      return el ? el.innerHTML : 'No terminal element';
    });

    console.log('--- Terminal Inner HTML ---');
    console.log(html);
    console.log('---------------------------');

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
