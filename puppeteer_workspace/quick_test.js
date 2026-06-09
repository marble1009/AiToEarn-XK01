const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🔍 Starting clean root navigation check...');
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // 1. 先去一个空页面，确保能清空所有的 Storage
    await page.goto('http://aurastring.cloud/robots.txt', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // 清除 Cookies
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    
    console.log('🧹 Cleaned cookies, localStorage and sessionStorage.');
    
    // 2. 导航到根路径
    console.log('🌐 Navigating to http://aurastring.cloud/ ...');
    await page.goto('http://aurastring.cloud/', { waitUntil: 'networkidle2' });
    
    console.log('⏳ Waiting 6 seconds for any potential hydration/auth redirects...');
    await new Promise(r => setTimeout(r, 6000));
    
    const finalUrl = page.url();
    const finalTitle = await page.title();
    console.log(`🏁 Final Page URL: "${finalUrl}"`);
    console.log(`🏁 Final Page Title: "${finalTitle}"`);
    
    // 检查是否有登录表单元素
    const hasEmailInput = await page.evaluate(() => {
      return !!document.querySelector('input[type="email"]');
    });
    console.log(`📝 Has Email Input (Login Form): ${hasEmailInput}`);
    
    // 检查侧边栏或移动导航底栏是否存在
    const hasSidebar = await page.evaluate(() => {
      const sidebar = document.querySelector('aside') || document.querySelector('[class*="sidebar"]');
      return !!sidebar && sidebar.offsetHeight > 0;
    });
    const hasMobileNav = await page.evaluate(() => {
      const mobNav = document.querySelector('[class*="MobileNav"]') || document.querySelector('[class*="mobileNav"]');
      return !!mobNav && mobNav.offsetHeight > 0;
    });
    console.log(`🛡️ Has LayoutSidebar rendered: ${hasSidebar}`);
    console.log(`🛡️ Has MobileNav rendered: ${hasMobileNav}`);
    
    const screenshotPath = path.join(artifactsDir, 'quick_test_root.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);
    
    if (finalUrl === 'http://aurastring.cloud/' || finalUrl === 'http://aurastring.cloud') {
      console.log('🎉 SUCCESS: Clean URL successfully kept without any language redirects!');
    } else {
      console.log('⚠️ FAILURE: URL still redirected to: ' + finalUrl);
    }
    
  } catch (err) {
    console.error('❌ Error during test:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
