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

    // 1. Dismiss "添加成功" dialog if present
    console.log('🔍 Checking for "添加成功" dialog...');
    await dnsPage.evaluate(() => {
      const modal = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim().includes('添加成功'));
      if (modal) {
        const confirmBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText && btn.innerText.trim() === '确认');
        if (confirmBtn) {
          confirmBtn.click();
          console.log('Dismissed "添加成功" dialog!');
        }
      }
    });

    await new Promise(r => setTimeout(r, 2000));

    // 2. Scan and list all rows in the table
    console.log('🔍 Scanning DNS records table...');
    const records = await dnsPage.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'));
      return trs.map((tr, index) => {
        const tds = Array.from(tr.querySelectorAll('td'));
        if (tds.length < 10) return null;
        
        // Host record is in tds[2], Type is in tds[3], Value is in tds[5]
        const host = tds[2].innerText ? tds[2].innerText.trim() : '';
        const type = tds[3].innerText ? tds[3].innerText.trim() : '';
        const value = tds[5].innerText ? tds[5].innerText.trim() : '';
        
        return { index, host, type, value };
      }).filter(Boolean);
    });

    console.log('📋 Current DNS Records:', JSON.stringify(records, null, 2));

    // 3. Delete any TXT record that matches _acme-challenge
    for (const record of records) {
      if (record.type === 'TXT' && record.host.includes('_acme-challenge')) {
        console.log(`🗑️ Deleting TXT record: Host="${record.host}", Value="${record.value}"`);
        
        // Let's click the delete button for this record
        await dnsPage.evaluate((hostVal, valVal) => {
          const trs = Array.from(document.querySelectorAll('tr'));
          const targetTr = trs.find(tr => {
            const tds = Array.from(tr.querySelectorAll('td'));
            if (tds.length < 10) return false;
            const h = tds[2].innerText ? tds[2].innerText.trim() : '';
            const t = tds[3].innerText ? tds[3].innerText.trim() : '';
            const v = tds[5].innerText ? tds[5].innerText.trim() : '';
            return t === 'TXT' && h === hostVal && v === valVal;
          });

          if (targetTr) {
            // Find delete button "删除"
            const deleteBtn = Array.from(targetTr.querySelectorAll('a, button')).find(el => el.innerText && el.innerText.trim() === '删除');
            if (deleteBtn) {
              deleteBtn.click();
            }
          }
        }, record.host, record.value);

        await new Promise(r => setTimeout(r, 2000));

        // Click "确认" in confirm modal
        await dnsPage.evaluate(() => {
          const modal = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim().includes('确认删除'));
          const buttons = Array.from(document.querySelectorAll('button'));
          // Find confirm button (usually has text "确认" or is primary button)
          const confirmBtn = buttons.find(btn => btn.innerText && (btn.innerText.trim() === '确认' || btn.innerText.trim() === '确定'));
          if (confirmBtn) {
            confirmBtn.click();
          }
        });

        console.log('   - Waiting for delete to persist...');
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    // Refresh page
    console.log('🔄 Reloading page to verify...');
    await dnsPage.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    // Capture screenshot after cleanup
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5';
    const detailPath = path.join(artifactDir, 'scratch\\dns_after_cleanup.png');
    await dnsPage.screenshot({ path: detailPath });
    console.log(`📸 Screenshot saved to: ${detailPath}`);

    await browser.disconnect();
    console.log('🎉 Cleanup Done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
