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
    
    const tableInfo = await page.evaluate(() => {
      // Find all rows
      const rows = Array.from(document.querySelectorAll('tr'));
      if (rows.length === 0) {
        return { error: 'No tr elements found' };
      }
      
      return rows.map((row, rIdx) => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return {
          rowIndex: rIdx,
          cells: cells.map((cell, cIdx) => ({
            cellIndex: cIdx,
            text: cell.innerText.trim(),
            links: Array.from(cell.querySelectorAll('a, button, span')).map(el => ({
              tagName: el.tagName,
              className: el.className,
              text: el.innerText.trim()
            }))
          }))
        };
      });
    });

    console.log('Table structure:', JSON.stringify(tableInfo, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
