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

    console.log(`🔌 Connected! Refreshing console page to clear any stuck state...`);
    await consolePage.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));

    // 1. Click the "重置密码" button on the top bar
    console.log('🖱️ Clicking top bar "重置密码" button...');
    const clickedReset = await consolePage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const resetBtn = buttons.find(b => (b.innerText || b.textContent || '').trim() === '重置密码');
      if (resetBtn) {
        resetBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedReset) {
      console.error('❌ Could not click top bar Reset Password button!');
      await browser.disconnect();
      return;
    }

    await new Promise(r => setTimeout(r, 3000));

    // 2. Click the "离线重置" radio button
    console.log('🖱️ Selecting "离线重置" (Offline Reset) radio option...');
    const clickedRadio = await consolePage.evaluate(() => {
      // Find the element containing text "离线重置"
      const elements = Array.from(document.querySelectorAll('span, label, div, input'));
      const target = elements.find(el => {
        const text = (el.innerText || el.textContent || '').trim();
        return text === '离线重置';
      });

      if (target) {
        target.click();
        // Also click parent just in case of radio wrapper click capture
        if (target.parentElement) target.parentElement.click();
        return { success: true, tag: target.tagName };
      }
      return { success: false };
    });

    console.log('Click Offline Radio Result:', JSON.stringify(clickedRadio, null, 2));
    await new Promise(r => setTimeout(r, 1000));

    // 3. Physical Type password into both fields to ensure React validation triggers
    console.log('📝 Physically typing password "Antigravity2026!" into input fields...');
    
    // Select and type in New Password
    await consolePage.click('input[placeholder*="请输入实例密码"]');
    await consolePage.keyboard.down('Control');
    await consolePage.keyboard.press('KeyA');
    await consolePage.keyboard.up('Control');
    await consolePage.keyboard.press('Backspace');
    await consolePage.keyboard.type('Antigravity2026!', { delay: 40 });

    await new Promise(r => setTimeout(r, 8000));

    // Select and type in Confirm Password
    await consolePage.click('input[placeholder*="请再次输入实例密码"]');
    await consolePage.keyboard.down('Control');
    await consolePage.keyboard.press('KeyA');
    await consolePage.keyboard.up('Control');
    await consolePage.keyboard.press('Backspace');
    await consolePage.keyboard.type('Antigravity2026!', { delay: 40 });

    await new Promise(r => setTimeout(r, 1000));

    // Click the mandatory checkbox "已阅读并了解以上离线重置须知"
    console.log('🖱️ Clicking the mandatory offline reset checkbox...');
    const clickedCheckbox = await consolePage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('span, label, input'));
      const target = elements.find(el => {
        const text = (el.innerText || el.textContent || '').trim();
        return text.includes('离线重置须知');
      });
      if (target) {
        target.click();
        if (target.parentElement) target.parentElement.click();
        return { success: true };
      }
      return { success: false };
    });

    console.log('Click Checkbox Result:', JSON.stringify(clickedCheckbox, null, 2));

    await new Promise(r => setTimeout(r, 2000));

    // Save screenshot to confirm input was successful
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    let spath = path.join(artifactDir, 'scratch\\offline_reset_filled.png');
    await consolePage.screenshot({ path: spath });
    console.log(`📸 Offline Reset filled state screenshot saved to: ${spath}`);

    // 4. Click the blue "确定" button inside modal
    console.log('🖱️ Clicking modal "确定" button to submit...');
    const clickedSubmit = await consolePage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(b => {
        const text = (b.innerText || b.textContent || '').trim();
        return text === '确定';
      });

      if (submitBtn) {
        if (submitBtn.disabled || submitBtn.classList.contains('is-disabled')) {
          return { success: false, reason: 'Confirm button is still disabled' };
        }
        submitBtn.click();
        return { success: true };
      }
      return { success: false, reason: 'Confirm button not found' };
    });

    console.log('Click Confirm Button Result:', JSON.stringify(clickedSubmit, null, 2));

    if (!clickedSubmit.success) {
      console.log('⚠️ Automatic confirm click failed. Forcing physical mouse click on confirm button...');
      await consolePage.mouse.click(470, 760);
      console.log('🖱️ Physical mouse click executed at 470, 760.');
    }

    await new Promise(r => setTimeout(r, 3000));

    // 5. Handle any possible secondary confirmation popup (like "是否同意强制关机并将中断业务")
    console.log('🚪 Checking for secondary force-shutdown confirmation modal...');
    const handledSecondary = await consolePage.evaluate(() => {
      // Find secondary confirm button in Tencent popup
      // It usually has a primary style and text like "确定", "同意", or "强制重置"
      const dialogs = Array.from(document.querySelectorAll('.sdk-lighthouse-dialog, .el-message-box'));
      if (dialogs.length > 1 || (dialogs.length === 1 && document.body.innerText.includes('中断'))) {
        const btns = Array.from(document.querySelectorAll('button, .el-button--primary'));
        const secondaryBtn = btns.find(b => {
          const text = (b.innerText || b.textContent || '').trim();
          return text === '确定' || text === '同意' || text === '是';
        });
        if (secondaryBtn) {
          secondaryBtn.click();
          return { success: true, text: secondaryBtn.innerText };
        }
      }
      return { success: false };
    });

    console.log('Secondary Confirmation click result:', JSON.stringify(handledSecondary, null, 2));

    console.log('⏳ Waiting 15 seconds for offline password reset submission to register...');
    await new Promise(r => setTimeout(r, 15000));

    spath = path.join(artifactDir, 'scratch\\offline_reset_submitted.png');
    await consolePage.screenshot({ path: spath });
    console.log(`📸 Final offline reset submission screenshot saved to: ${spath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error during offline password reset:', err);
    if (browser) await browser.disconnect();
  }
})();
