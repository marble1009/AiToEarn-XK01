const puppeteer = require('puppeteer-core');
const path = require('path');

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

    // Find the _acme-challenge row and click "删除"
    console.log('🔍 Locating _acme-challenge row...');
    const clicked = await dnsPage.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'));
      const targetTr = trs.find(tr => {
        const tds = Array.from(tr.querySelectorAll('td'));
        if (tds.length < 10) return false;
        const h = tds[2].innerText ? tds[2].innerText.trim() : '';
        const t = tds[3].innerText ? tds[3].innerText.trim() : '';
        return t === 'TXT' && h === '_acme-challenge';
      });

      if (targetTr) {
        const deleteBtn = Array.from(targetTr.querySelectorAll('a, button')).find(el => el.innerText && el.innerText.trim() === '删除');
        if (deleteBtn) {
          deleteBtn.click();
          return true;
        }
      }
      return false;
    });

    if (clicked) {
      console.log('✅ Clicked "删除" button! Waiting 2 seconds to inspect the modal...');
      await new Promise(r => setTimeout(r, 2000));

      const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5';
      const modalPath = path.join(artifactDir, 'scratch\\delete_confirm_modal.png');
      await dnsPage.screenshot({ path: modalPath });
      console.log(`📸 Saved delete modal screenshot to: ${modalPath}`);

      // Dump all visible buttons and text on the page to identify the confirm button
      const elements = await dnsPage.evaluate(() => {
        const els = Array.from(document.querySelectorAll('.tc-modal, [class*="modal"], [class*="dialog"], .tea-modal'));
        if (els.length === 0) return 'No modal container found by standard classes';
        return els.map(el => ({
          className: el.className,
          text: el.innerText
        }));
      });
      console.log('📋 Modal info:', JSON.stringify(elements, null, 2));

      // Dismiss by clicking Cancel/取消 to keep it clean for now
      await dnsPage.evaluate(() => {
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText && btn.innerText.trim() === '取消');
        if (cancelBtn) cancelBtn.click();
      });
    } else {
      console.log('❌ Could not find target _acme-challenge TXT record row to click.');
    }

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
