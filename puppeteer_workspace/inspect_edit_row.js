const puppeteer = require('puppeteer-core');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome on 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const dnsPage = pages.find(p => p.url().includes('console.cloud.tencent.com/cns/detail'));

    if (!dnsPage) {
      console.error('❌ DNS console page tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected! Active Tab: ${dnsPage.url()}`);
    await dnsPage.bringToFront();

    // Let's click "添加记录" to spawn an active edit row first so we can inspect it!
    console.log('   - Clicking "添加记录" button to spawn active row...');
    await dnsPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(btn => btn.innerText && btn.innerText.trim() === '添加记录');
      if (addBtn) addBtn.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    // Now inspect all cells (td) in the active edit row
    console.log('🔍 Inspecting active edit row cells...');
    const cellsInfo = await dnsPage.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'));
      const activeTr = trs.find(tr => tr.innerText.includes('确认') && tr.innerText.includes('取消'));
      if (!activeTr) return 'No active edit row found!';
      
      const tds = Array.from(activeTr.querySelectorAll('td'));
      return tds.map((td, index) => {
        const input = td.querySelector('input');
        const select = td.querySelector('select, .app-cns-console-dropdown, .app-cns-console-select');
        return {
          index,
          html: td.innerHTML.substring(0, 100),
          text: td.innerText.trim(),
          hasInput: !!input,
          inputName: input ? input.name || input.placeholder || 'unnamed input' : null,
          hasSelect: !!select
        };
      });
    });

    console.log('📋 Active Edit Row Cells Info:', JSON.stringify(cellsInfo, null, 2));

    // Cancel edit row
    await dnsPage.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'));
      const activeTr = trs.find(tr => tr.innerText.includes('确认') && tr.innerText.includes('取消'));
      if (activeTr) {
        const cancelBtn = Array.from(activeTr.querySelectorAll('button')).find(btn => btn.innerText.includes('取消'));
        if (cancelBtn) cancelBtn.click();
      }
    });

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
