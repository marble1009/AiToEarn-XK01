const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch';
    
    console.log(`Connected to Chrome. Found ${pages.length} pages.`);
    for (let i = 0; i < pages.length; i++) {
      const url = pages[i].url();
      const title = await pages[i].title();
      console.log(`[Tab ${i}] URL: ${url} | Title: ${title}`);
      
      const spath = path.join(scratchDir, `tab_${i}_page.png`);
      await pages[i].screenshot({ path: spath });
      console.log(`Screenshot saved to: ${spath}`);
    }
    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
