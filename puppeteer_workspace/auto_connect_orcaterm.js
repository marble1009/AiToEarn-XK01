const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm.cloud.tencent.com'));

    if (!orcaPage) {
      console.error('❌ OrcaTerm tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to OrcaTerm! Current URL: ${orcaPage.url()}`);
    await orcaPage.bringToFront();

    // Dynamically find and click the "登录" button on the popup dialog
    const clickResult = await orcaPage.evaluate(() => {
      // Find buttons/elements in document that contain the word "登录" (but we need the one inside the dialog, not any header)
      // Usually, there is a prominent button with class containing "btn" or "primary" and inner text "登录"
      const buttons = Array.from(document.querySelectorAll('button, div, span')).filter(x => {
        if (x.children.length > 0) return false; // leaf only
        return x.innerText && x.innerText.trim() === '登录';
      });
      
      // Let's click the first matching visible leaf-element containing "登录"
      if (buttons.length > 0) {
        // Prefer the one that has active class or looks like a modal button
        const btn = buttons[buttons.length - 1]; // usually the modal button is rendered last in DOM
        btn.click();
        return { clicked: true, tagName: btn.tagName, text: btn.innerText.trim() };
      }
      return { clicked: false };
    });

    console.log('OrcaTerm login click result:', JSON.stringify(clickResult, null, 2));

    if (clickResult.clicked) {
      console.log('🎉 Clicked "登录" in the connection dialog successfully! Waiting 8 seconds for SSH session establishment...');
      await new Promise(r => setTimeout(r, 8000));

      const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
      const sshPath = path.join(artifactDir, 'orca_ssh_established.png');
      await orcaPage.screenshot({ path: sshPath });
      console.log(`📸 Established SSH state screenshot saved to: ${sshPath}`);
    } else {
      console.log('❌ "登录" button inside connection dialog not found. Maybe it is already connected?');
    }

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during OrcaTerm connection:', err);
  }
})();
