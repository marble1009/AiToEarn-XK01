const puppeteer = require('puppeteer-core');
(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    if (orcaPage) {
      const text = await orcaPage.evaluate(() => {
        const rows = document.querySelectorAll('.xterm-rows div');
        return Array.from(rows).map(row => row.innerText).join('\n');
      });
      console.log('--- Terminal Buffer Text ---');
      console.log(text);
      console.log('----------------------------');
    } else {
      console.log('OrcaPage not found');
    }
    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
