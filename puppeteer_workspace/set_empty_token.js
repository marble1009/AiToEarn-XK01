const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages[0];
    
    console.log('Setting localStorage User token to null...');
    await page.evaluate(() => {
      const userState = {
        state: {
          token: null,
          userInfo: null,
          isAddAccountPorxy: false,
          lang: "zh-CN",
          sidebarCollapsed: false,
          hasEverLoggedIn: false,
          lastUpdateTime: 0,
          _hasHydrated: true
        },
        version: 0
      };
      localStorage.setItem('User', JSON.stringify(userState));
    });
    
    console.log('Reloading page...');
    await page.reload({ waitUntil: 'networkidle2' });
    
    const textContent = await page.evaluate(() => document.body.innerText);
    console.log('--- Page text after setting empty token ---');
    console.log(textContent.substring(0, 1000));
    console.log('-------------------------------------------');

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\empty_token_login.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
