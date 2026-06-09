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
    const consolePage = pages.find(p => p.url().includes('console.cloud.tencent.com/lighthouse'));

    if (!consolePage) {
      console.error('❌ Tencent Cloud Console (Lighthouse) tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to console! Title: ${await consolePage.title()}`);
    await consolePage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Find and click the "重置密码" button on the top bar
    console.log('🖱️ Clicking "重置密码" button...');
    const clickedReset = await consolePage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, div, span'));
      const resetBtn = buttons.find(b => (b.innerText || b.textContent || '').trim() === '重置密码' && b.tagName === 'BUTTON');
      if (resetBtn) {
        resetBtn.click();
        return { success: true, text: resetBtn.innerText };
      }
      return { success: false };
    });

    console.log('Reset Password click result:', JSON.stringify(clickedReset, null, 2));

    if (clickedReset.success) {
      console.log('⏳ Waiting 4 seconds for Reset Password modal to render...');
      await new Promise(r => setTimeout(r, 4000));

      // Save screenshot of the password reset modal
      const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
      const spath = path.join(artifactDir, 'scratch\\reset_password_modal.png');
      await consolePage.screenshot({ path: spath });
      console.log(`📸 Screenshot saved to: ${spath}`);

      // Let's also dump all input fields and buttons inside the modal for styling & analysis
      const modalInfo = await consolePage.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          className: i.className
        }));
        const btns = Array.from(document.querySelectorAll('.el-dialog button, button')).map(b => ({
          text: (b.innerText || b.textContent || '').trim(),
          className: b.className
        }));
        return { inputs, buttons: btns };
      });
      console.log('Modal elements:', JSON.stringify(modalInfo, null, 2));
    } else {
      console.error('❌ Failed to click the top bar Reset Password button!');
    }

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
