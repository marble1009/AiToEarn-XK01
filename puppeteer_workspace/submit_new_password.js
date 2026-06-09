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

    // Type new password into inputs
    console.log('📝 Typing new password "Antigravity2026!" into input fields...');
    const fillResult = await consolePage.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const newPwdInput = inputs.find(i => i.placeholder && i.placeholder.includes('请输入实例密码'));
      const confirmPwdInput = inputs.find(i => i.placeholder && i.placeholder.includes('请再次输入实例密码'));

      if (newPwdInput && confirmPwdInput) {
        // Clear value just in case
        newPwdInput.value = '';
        confirmPwdInput.value = '';
        return { success: true };
      }
      return { success: false };
    });

    console.log('Clearing Inputs Result:', JSON.stringify(fillResult, null, 2));

    // Force physical typing
    await consolePage.click('input[placeholder*="请输入实例密码"]');
    await consolePage.keyboard.down('Control');
    await consolePage.keyboard.press('KeyA');
    await consolePage.keyboard.up('Control');
    await consolePage.keyboard.press('Backspace');
    await consolePage.keyboard.type('Antigravity2026!', { delay: 40 });

    await new Promise(r => setTimeout(r, 500));

    await consolePage.click('input[placeholder*="请再次输入实例密码"]');
    await consolePage.keyboard.down('Control');
    await consolePage.keyboard.press('KeyA');
    await consolePage.keyboard.up('Control');
    await consolePage.keyboard.press('Backspace');
    await consolePage.keyboard.type('Antigravity2026!', { delay: 40 });

    await new Promise(r => setTimeout(r, 1000));

    // Save screenshot to check if "确定" button is active now
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    let spath = path.join(artifactDir, 'scratch\\reset_password_filled.png');
    await consolePage.screenshot({ path: spath });
    console.log(`📸 Screenshot after fill saved to: ${spath}`);

    // Click "确定" button inside modal
    console.log('🖱️ Clicking "确定" button...');
    const clickedSubmit = await consolePage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(b => {
        const text = (b.innerText || b.textContent || '').trim();
        return text === '确定';
      });

      if (submitBtn) {
        if (submitBtn.disabled || submitBtn.classList.contains('is-disabled')) {
          return { success: false, reason: 'Button is disabled in CSS/DOM' };
        }
        submitBtn.click();
        return { success: true };
      }
      return { success: false, reason: 'Button not found' };
    });

    console.log('Click Submit Result:', JSON.stringify(clickedSubmit, null, 2));

    if (!clickedSubmit.success) {
      console.log('⚠️ Automatic click failed. Trying physical mouse click on the blue "确定" button...');
      // Click coordinates of "确定" button based on screenshot (approx center of dialog's confirm button)
      // Usually around 470, 760
      await consolePage.mouse.click(470, 760);
      console.log('🖱️ Physical mouse clicked at 470, 760.');
    }

    console.log('⏳ Waiting 15 seconds for online password reset processing...');
    await new Promise(r => setTimeout(r, 15000));

    spath = path.join(artifactDir, 'scratch\\reset_password_submitted.png');
    await consolePage.screenshot({ path: spath });
    console.log(`📸 Post-submit screenshot saved to: ${spath}`);

    await browser.disconnect();
    console.log('🎉 Reset password submit completed.');
  } catch (err) {
    console.error('❌ Error submitting password:', err);
    if (browser) await browser.disconnect();
  }
})();
