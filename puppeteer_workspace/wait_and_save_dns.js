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

    console.log('⏳ Waiting for you to scan the WeChat QR code on your screen...');
    
    let mfaExists = true;
    while (mfaExists) {
      mfaExists = await dnsPage.evaluate(() => {
        const modal = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim().includes('身份验证'));
        return !!modal;
      });
      if (mfaExists) {
        console.log('⏳ WeChat QR Verification (MFA) is still visible. Please scan it now...');
        await new Promise(r => setTimeout(r, 4000));
      }
    }

    console.log('🎉 WeChat MFA verification cleared! Waiting 2 seconds...');
    await new Promise(r => setTimeout(r, 2000));

    // Try to find if there is an active edit row and click Cancel or Confirm
    console.log('🔍 Checking if there is an active editing row to cancel/save...');
    const hasActiveRow = await dnsPage.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'));
      const activeTr = trs.find(tr => tr.innerText.includes('确认') && tr.innerText.includes('取消'));
      if (activeTr) {
        const cancelBtn = Array.from(activeTr.querySelectorAll('button')).find(btn => btn.innerText.includes('取消'));
        if (cancelBtn) {
          cancelBtn.click();
          return true;
        }
      }
      return false;
    });

    if (hasActiveRow) {
      console.log('✅ Active editing row cancelled to restore clean state.');
    } else {
      console.log('ℹ️ No active editing row found.');
    }

    // Capture screenshot after clearing
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5';
    const detailPath = path.join(artifactDir, 'scratch\\dns_after_mfa_clear.png');
    await dnsPage.screenshot({ path: detailPath });
    console.log(`📸 Screenshot saved to: ${detailPath}`);

    await browser.disconnect();
    console.log('🎉 Clean slate restored!');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
