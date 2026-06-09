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

    console.log('🖱️ Trying to find and click the "登录" (Login) button inside OrcaTerm...');
    const clicked = await orcaPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const loginBtn = btns.find(b => b.textContent.includes('登录') || b.innerText.includes('登录'));
      if (loginBtn) {
        loginBtn.click();
        return true;
      }
      
      // Let's try deep selectors
      const blueBtns = Array.from(document.querySelectorAll('.el-button--primary, button'));
      const anyLogin = blueBtns.find(b => b.textContent.includes('登录') || b.innerText.includes('登录'));
      if (anyLogin) {
        anyLogin.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('✅ Clicked login button! Waiting 8 seconds for shell session to open...');
      await new Promise(r => setTimeout(r, 8000));
    } else {
      console.log('⚠️ Could not find "登录" button via simple search. Let us try physical mouse click at middle of page...');
      // Click at the approximate coordinates of the blue button shown in the screenshot
      // Page size is defaultViewport or actual window size. Typically the dialog is centered.
      // Let's click at 500, 560
      await orcaPage.mouse.click(500, 560);
      console.log('🖱️ Physical clicked at 500, 560. Waiting 8 seconds...');
      await new Promise(r => setTimeout(r, 8000));
    }

    // Save screenshot to check if terminal is loaded
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const spath = path.join(artifactDir, 'scratch\\after_orca_login.png');
    await orcaPage.screenshot({ path: spath });
    console.log(`📸 Screenshot saved to: ${spath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
