const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  let browser;
  try {
    console.log('🔌 Launching Chrome...');
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: false,
      defaultViewport: null
    });

    const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\997e1d57-7510-4157-ac1d-9daac857540b\\scratch';
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    // --- Part 1: Navigate to http://aurastring.cloud ---
    console.log('\n🌐 [Tab 1] Opening/Reusing tab for http://aurastring.cloud ...');
    const pages = await browser.pages();
    let homePage = pages.find(p => p.url() === 'http://aurastring.cloud/' || (p.url().includes('aurastring.cloud') && !p.url().includes('login') && !p.url().includes('auth')));
    if (!homePage) {
      homePage = await browser.newPage();
    }
    
    await homePage.setViewport({ width: 1280, height: 800 });
    console.log('Navigating to http://aurastring.cloud ...');
    await homePage.goto('http://aurastring.cloud', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000)); // Wait for render/hydration
    
    const homeUrl = homePage.url();
    const homeTitle = await homePage.title();
    const homeText = await homePage.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log(`🏠 Home Page URL: ${homeUrl}`);
    console.log(`🏠 Home Page Title: ${homeTitle}`);
    console.log(`🏠 Home Page Content Snippet:\n---\n${homeText}\n---`);
    
    const homeScreenshot = path.join(scratchDir, 'aurastring_home.png');
    await homePage.screenshot({ path: homeScreenshot });
    console.log(`📸 Home screenshot saved to: ${homeScreenshot}`);

    // --- Part 2: Navigate to http://aurastring.cloud/login ---
    console.log('\n🔐 [Tab 2] Opening/Reusing tab for http://aurastring.cloud/login ...');
    let loginPage = pages.find(p => p.url().includes('login') || p.url().includes('auth'));
    if (!loginPage) {
      loginPage = await browser.newPage();
    }
    
    await loginPage.setViewport({ width: 1280, height: 800 });
    console.log('Navigating to http://aurastring.cloud/login ...');
    await loginPage.goto('http://aurastring.cloud/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    const loginUrl = loginPage.url();
    const loginTitle = await loginPage.title();
    const loginText = await loginPage.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log(`🔑 Login Page URL: ${loginUrl}`);
    console.log(`🔑 Login Page Title: ${loginTitle}`);
    console.log(`🔑 Login Page Content Snippet:\n---\n${loginText}\n---`);
    
    const loginScreenshot = path.join(scratchDir, 'aurastring_login.png');
    await loginPage.screenshot({ path: loginScreenshot });
    console.log(`📸 Login screenshot saved to: ${loginScreenshot}`);

    console.log('\n🔌 Disconnecting from Chrome (browser windows remain open)...');
    await browser.disconnect();
    console.log('✨ Script execution complete!');
  } catch (err) {
    console.error('❌ Error executing script:', err);
    if (browser) {
      try {
        await browser.disconnect();
      } catch (e) {}
    }
    process.exit(1);
  }
})();
