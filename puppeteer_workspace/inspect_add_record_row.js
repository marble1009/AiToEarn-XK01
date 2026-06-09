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

    console.log('Clicking "添加记录" button...');
    const clickResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(btn => btn.innerText && btn.innerText.trim() === '添加记录');
      if (addBtn) {
        addBtn.click();
        return { success: true };
      }
      return { success: false, error: 'Add Record button not found' };
    });

    console.log('Click result:', JSON.stringify(clickResult));

    if (clickResult.success) {
      console.log('⏳ Waiting 3 seconds for the new row to appear...');
      await new Promise(r => setTimeout(r, 3000));
      
      const newRowScreenshotPath = path.join(scratchDir, 'new_record_row.png');
      await page.screenshot({ path: newRowScreenshotPath });
      console.log(`📸 New row screenshot saved to: ${newRowScreenshotPath}`);

      // Inspect inputs in the new row
      const inputsInfo = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.map((input, idx) => ({
          index: idx,
          tagName: input.tagName,
          type: input.type,
          placeholder: input.placeholder,
          value: input.value,
          className: input.className
        }));
      });

      console.log('Inputs after clicking "添加记录":', JSON.stringify(inputsInfo, null, 2));

      // Click "取消" (Cancel) button to clean up this test click
      console.log('Clicking "取消" to clean up...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cancelBtn = buttons.find(btn => btn.innerText && btn.innerText.trim() === '取消');
        if (cancelBtn) cancelBtn.click();
      });
    }

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
