const puppeteer = require('puppeteer-core');
const path = require('path');

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
    await page.bringToFront();

    const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch';

    console.log('Searching for "添加规则" button...');
    const clickResult = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const addBtn = elements.find(el => {
        if (el.children.length > 0) return false;
        return el.innerText && el.innerText.trim() === '添加规则';
      });

      if (addBtn) {
        // Find clickable parent if any, or click it
        let target = addBtn;
        while (target && target.tagName !== 'BUTTON' && !target.classList.contains('tea-btn')) {
          target = target.parentElement;
        }
        if (!target) target = addBtn;
        
        target.click();
        return { clicked: true, tagName: target.tagName, text: target.innerText };
      }
      return { clicked: false };
    });

    console.log('Click result:', JSON.stringify(clickResult));

    if (clickResult.clicked) {
      console.log('⏳ Waiting 3 seconds for the dialog to open...');
      await new Promise(r => setTimeout(r, 3000));
      
      const dialogScreenshotPath = path.join(scratchDir, 'add_rule_dialog.png');
      await page.screenshot({ path: dialogScreenshotPath });
      console.log(`📸 Dialog screenshot saved to: ${dialogScreenshotPath}`);
    } else {
      console.log('❌ Could not click "添加规则" button.');
    }

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
