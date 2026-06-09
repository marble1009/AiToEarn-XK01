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
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));

    if (!orcaPage) {
      console.error('❌ OrcaTerm tab not found!');
      await browser.disconnect();
      return;
    }

    console.log('🔄 Found OrcaTerm tab! Reloading page to reconnect SSH...');
    try {
      await orcaPage.reload({ waitUntil: 'domcontentloaded', timeout: 6000 });
    } catch (reloadErr) {
      console.log('💡 Reload command finished with timeout/non-critical warning (expected):', reloadErr.message);
    }

    console.log('⏳ Waiting 8 seconds for SSH handshakes and login...');
    await new Promise(r => setTimeout(r, 8000));

    // Focus and click inside terminal to make it active
    console.log('🖱️ Clicking inside terminal...');
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 1000));

    // Save screenshot of the newly reconnected terminal
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const spath = path.join(artifactDir, 'scratch\\reconnected_terminal.png');
    await orcaPage.screenshot({ path: spath });
    console.log(`📸 Screenshot saved to: ${spath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
