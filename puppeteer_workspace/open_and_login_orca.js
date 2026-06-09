const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🔌 Connecting to Chrome debugger...');
  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let orcaPage = pages.find(p => p.url().includes('orcaterm.cloud.tencent.com'));

    if (!orcaPage) {
      console.log('🌐 OrcaTerm tab not found. Creating a new one...');
      orcaPage = await browser.newPage();
      await orcaPage.setViewport({ width: 1280, height: 800 });
      
      const orcaUrl = 'https://orcaterm.cloud.tencent.com/terminal?type=lighthouse&instanceId=lhins-1ffo71cw&region=ap-shanghai&from=lh_console_login_btn';
      console.log(`🧭 Navigating to OrcaTerm URL: ${orcaUrl}`);
      await orcaPage.goto(orcaUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } else {
      console.log('🎯 Found existing OrcaTerm tab!');
      await orcaPage.bringToFront();
    }

    console.log('⏳ Waiting 10 seconds for page to load and dialog to pop up...');
    await new Promise(r => setTimeout(r, 10000));

    // Screenshot before click
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    await orcaPage.screenshot({ path: path.join(artifactDir, 'orca_before_login.png') });
    console.log('📸 Before login screenshot saved.');

    // Click login
    console.log('🖱️ Attempting to click "登录" button on connection dialog...');
    const clickResult = await orcaPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, div, span')).filter(x => {
        if (x.children.length > 0) return false;
        return x.innerText && x.innerText.trim() === '登录';
      });
      
      if (buttons.length > 0) {
        const btn = buttons[buttons.length - 1];
        btn.click();
        return { clicked: true, tagName: btn.tagName, text: btn.innerText.trim() };
      }
      return { clicked: false };
    });

    console.log('OrcaTerm login click result:', JSON.stringify(clickResult, null, 2));

    if (clickResult.clicked) {
      console.log('⏳ Waiting 8 seconds for SSH session to be established...');
      await new Promise(r => setTimeout(r, 8000));
      await orcaPage.screenshot({ path: path.join(artifactDir, 'orca_after_login.png') });
      console.log('📸 After login screenshot saved.');
    } else {
      console.log('⚠️ Login button not clicked. It might already be logged in or page did not load dialog.');
      // Click at a generic location if it might be an xterm helper focus issue
      await orcaPage.mouse.click(400, 300);
    }

    await browser.disconnect();
    console.log('🎉 Open and Login OrcaTerm script execution done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
