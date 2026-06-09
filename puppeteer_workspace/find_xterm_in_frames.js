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

    console.log('Main Page URL:', orcaPage.url());
    
    // List all frames
    const frames = orcaPage.frames();
    console.log(`Total Frames: ${frames.length}`);
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      console.log(`[Frame ${i}] Name: "${frame.name()}" | URL: ${frame.url()}`);
      
      const xtermExists = await frame.evaluate(() => {
        const rows = document.querySelectorAll('.xterm-rows div');
        const terminal = document.querySelector('.terminal') || document.querySelector('.xterm');
        return {
          rowsCount: rows ? rows.length : 0,
          terminalExists: !!terminal,
          bodyHtml: document.body ? document.body.innerHTML.substring(0, 500) : 'No body'
        };
      }).catch(err => ({ error: err.message }));
      
      console.log(`  Xterm check:`, JSON.stringify(xtermExists, null, 2));
    }

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
