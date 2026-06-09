const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let webPage = pages.find(p => p.url().includes('aurastring.cloud'));
    
    if (!webPage) {
      console.log('No aurastring.cloud page found, opening a new one...');
      webPage = await browser.newPage();
      await webPage.goto('http://aurastring.cloud/zh-CN', { waitUntil: 'networkidle2' });
    }

    console.log('Setting localStorage to bypass mock token...');
    await webPage.evaluate(() => {
      const userState = {
        state: {
          token: "", // Set token to empty string to overwrite the mock token
          userInfo: {},
          isAddAccountPorxy: false,
          lang: "zh-CN",
          sidebarCollapsed: false,
          hasEverLoggedIn: false,
          lastUpdateTime: Date.now(),
          _hasHydrated: true
        },
        version: 0
      };
      localStorage.setItem('User', JSON.stringify(userState));
    });

    console.log('Reloading the page to apply empty token...');
    await webPage.reload({ waitUntil: 'networkidle2' });

    console.log('Waiting 3 seconds for hydration and dialogs to appear...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\after_bypass.png`;
    await webPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Click "立刻开始" (Start now) button or log the text if there's any
    const bodyText = await webPage.evaluate(() => document.body.innerText);
    console.log('Page text snapshot:');
    console.log(bodyText.substring(0, 500));

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
