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
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(btn => btn.innerText && btn.innerText.trim() === '添加记录');
      if (addBtn) addBtn.click();
    });

    console.log('⏳ Waiting 2 seconds...');
    await new Promise(r => setTimeout(r, 2000));

    console.log('Searching for and clicking "记录类型" dropdown (currently "A")...');
    const dropdownClickResult = await page.evaluate(() => {
      // Find the dropdown element in the active row. The active row's dropdown has text "A".
      // Let's search for any div or span or a that has text "A" and has class containing "select" or "dropdown" or is clickable.
      const elements = Array.from(document.querySelectorAll('*'));
      const typeDropdown = elements.find(el => {
        if (el.children.length > 0) return false;
        return el.innerText && el.innerText.trim() === 'A' && el.tagName !== 'SPAN' && el.tagName !== 'INPUT' && el.tagName !== 'TH';
      });

      if (typeDropdown) {
        // Let's find its nearest parent that looks like a dropdown button
        let target = typeDropdown;
        while (target && !target.className.includes('select') && !target.className.includes('dropdown')) {
          target = target.parentElement;
        }
        if (!target) target = typeDropdown;
        target.click();
        return { success: true, tagName: target.tagName, className: target.className };
      }
      
      // Alternative: let's try finding the select or select-like element in cell index 2
      const trs = Array.from(document.querySelectorAll('tr'));
      const newTr = trs.find(tr => tr.innerText.includes('确认') && tr.innerText.includes('取消'));
      if (newTr) {
        const tds = Array.from(newTr.querySelectorAll('td'));
        // Cell 2 is Record Type
        const cell = tds[2];
        if (cell) {
          const clickEl = cell.querySelector('.app-cns-console-select') || cell.querySelector('*');
          if (clickEl) {
            clickEl.click();
            return { success: true, tagName: clickEl.tagName, className: clickEl.className, viaCell: true };
          }
        }
      }

      return { success: false };
    });

    console.log('Dropdown click result:', JSON.stringify(dropdownClickResult));

    if (dropdownClickResult.success) {
      console.log('⏳ Waiting 2 seconds for the options to render...');
      await new Promise(r => setTimeout(r, 2000));

      const dropdownScreenshotPath = path.join(scratchDir, 'dns_dropdown_options.png');
      await page.screenshot({ path: dropdownScreenshotPath });
      console.log(`📸 Dropdown screenshot saved to: ${dropdownScreenshotPath}`);

      // Inspect options
      const optionsInfo = await page.evaluate(() => {
        const listItems = Array.from(document.querySelectorAll('li, div, a, span'));
        return listItems
          .filter(el => {
            if (el.children.length > 0) return false;
            const text = el.innerText ? el.innerText.trim() : '';
            return ['A', 'CNAME', 'TXT', 'MX', 'AAAA'].includes(text);
          })
          .map(el => ({
            tagName: el.tagName,
            className: el.className,
            text: el.innerText.trim()
          }));
      });

      console.log('Found dropdown options:', JSON.stringify(optionsInfo, null, 2));

      // Click "取消" to clean up
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
