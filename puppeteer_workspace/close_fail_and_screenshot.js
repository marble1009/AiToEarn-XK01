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
    const orcaPages = pages.filter(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    const orcaPage = orcaPages[orcaPages.length - 1];

    if (!orcaPage) {
      console.error('❌ OrcaTerm tab not found!');
      await browser.disconnect();
      return;
    }

    console.log('🖱️ Clicking "确定" or "关闭" on the Login Fail dialog...');
    const clicked = await orcaPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const targetBtn = btns.find(b => {
        const text = (b.innerText || b.textContent || '').trim();
        return text === '确定' || text === '关闭';
      });

      if (targetBtn) {
        targetBtn.click();
        return { success: true, text: targetBtn.innerText };
      }
      return { success: false };
    });

    console.log('Click Result:', JSON.stringify(clicked, null, 2));

    await new Promise(r => setTimeout(r, 3000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const spath = path.join(artifactDir, 'scratch\\after_close_fail.png');
    await orcaPage.screenshot({ path: spath });
    console.log(`📸 Screenshot saved to: ${spath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
