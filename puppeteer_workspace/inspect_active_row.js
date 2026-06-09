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
    
    // Inspect the active row tds
    const tdsInfo = await page.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'));
      const activeTr = trs.find(tr => tr.innerText.includes('确认') && tr.innerText.includes('取消'));
      if (!activeTr) return { error: 'Active row not found' };

      const tds = Array.from(activeTr.querySelectorAll('td'));
      return tds.map((td, idx) => {
        const inputs = Array.from(td.querySelectorAll('input'));
        const buttons = Array.from(td.querySelectorAll('button'));
        const select = td.querySelector('select') || td.querySelector('.app-cns-console-dropdown') || td.querySelector('.app-cns-console-select');
        return {
          cellIndex: idx,
          className: td.className,
          innerHTML: td.innerHTML.substring(0, 150),
          inputsCount: inputs.length,
          inputs: inputs.map(i => ({ className: i.className, placeholder: i.placeholder, type: i.type })),
          buttonsCount: buttons.length,
          buttons: buttons.map(b => b.innerText),
          hasSelect: !!select
        };
      });
    });

    console.log('Active edit row cells info:', JSON.stringify(tdsInfo, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
