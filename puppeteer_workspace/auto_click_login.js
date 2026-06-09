const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const loginPage = pages.find(p => p.url().includes('cloud.tencent.com/login'));

    if (!loginPage) {
      console.error('❌ Tencent Cloud login page tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected! Page Title: ${await loginPage.title()}`);
    await loginPage.bringToFront();

    // Find the "立即登录" element dynamically by inner text
    const buttonFound = await loginPage.evaluate(() => {
      // Find element containing "立即登录"
      const el = Array.from(document.querySelectorAll('*')).find(x => {
        if (x.children.length > 0) return false; // leaf node only
        return x.innerText && x.innerText.trim() === '立即登录';
      });
      if (el) {
        // Return its position to let Puppeteer click physically, or click directly via JS
        const rect = el.getBoundingClientRect();
        el.click(); // Trigger JavaScript click
        return {
          found: true,
          tagName: el.tagName,
          rect: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        };
      }
      return { found: false };
    });

    console.log('Dynamic element search result:', JSON.stringify(buttonFound, null, 2));

    if (buttonFound.found) {
      console.log('🎉 Clicked "立即登录" successfully! Waiting 12 seconds for redirection...');
      await new Promise(r => setTimeout(r, 12000));
      
      const newUrl = loginPage.url();
      const newTitle = await loginPage.title();
      console.log(`📡 Redirected State: URL="${newUrl}", Title="${newTitle}"`);

      // Take screenshot of the post-login state!
      const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
      const postLoginPath = path.join(artifactDir, 'post_login_state.png');
      await loginPage.screenshot({ path: postLoginPath });
      console.log(`📸 Screenshot saved to: ${postLoginPath}`);
    } else {
      console.log('❌ "立即登录" button not found. Maybe it is already logged in?');
    }

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during auto login click:', err);
  }
})();
