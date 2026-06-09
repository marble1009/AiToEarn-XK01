const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🚀 正在启动有头 Chrome 浏览器，以便在您的桌面上直接显示并进行调试...');
  
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main\\puppeteer_workspace\\chrome-debug-profile';
  
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  let browser;
  try {
    console.log('🔌 尝试连接到已在 9222 端口运行的浏览器...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('🎉 成功连接到已有 Chrome 浏览器！');
  } catch (err) {
    console.log('💡 未在 9222 端口检测到浏览器，正在为您全新拉起 GUI 窗口 (保留您的 Profile 会话)...');
    try {
      browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        defaultViewport: null,
        args: [
          '--start-maximized', 
          '--remote-debugging-port=9222', 
          `--user-data-dir=${profileDir}`,
          '--no-first-run',
          '--no-default-browser-check'
        ]
      });
      console.log('🎉 Chrome 浏览器安全拉起成功，9222 端口已激活！');
    } catch (launchErr) {
      console.error('❌ 启动 Chrome 失败。请确保您已经关闭了桌面上其他可能占用该 Profile 目录的 Chrome 窗口。');
      process.exit(1);
    }
  }

  try {
    const pages = await browser.pages();
    
    // 打开主页
    console.log('🌐 正在为您打开主页: http://aurastring.cloud ...');
    let homePage = pages.find(p => p.url() === 'http://aurastring.cloud/' || p.url() === 'http://aurastring.cloud');
    if (!homePage) {
      homePage = pages[0] || await browser.newPage();
      await homePage.goto('http://aurastring.cloud', { timeout: 10000 }).catch(() => {});
    } else {
      await homePage.bringToFront();
    }
    
    // 打开登录页
    console.log('🌐 正在为您打开登录页: http://aurastring.cloud/login ...');
    let loginPage = pages.find(p => p.url().includes('/login'));
    if (!loginPage) {
      loginPage = await browser.newPage();
      await loginPage.goto('http://aurastring.cloud/login', { timeout: 10000 }).catch(() => {});
    }

    console.log('----------------------------------------------------');
    console.log('🎉 已为您在屏幕上成功拉起 Chrome 并打开主页和登录页！');
    console.log('您可以直接在您屏幕上弹出的 Chrome 中观察当前的页面错误。');
    console.log('我们将保持该浏览器绝对不关闭！您可以继续查看或让我进行下一步排查。');
    console.log('----------------------------------------------------');

    // 挂起 15 分钟让用户能看清并检查
    await new Promise(r => setTimeout(r, 900000));
    process.exit(0);

  } catch (err) {
    console.error('❌ 执行失败:', err);
  }
})();
