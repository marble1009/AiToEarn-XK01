const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main\\puppeteer_workspace\\chrome-debug-profile';
  
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  console.log('🚀 正在为您拉起有头 Chrome 浏览器...');
  try {
    const browser = await puppeteer.launch({
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
    console.log('🎉 Chrome 浏览器安全拉起成功！9222 端口已稳定激活。');
    
    const pages = await browser.pages();
    const page = pages[0];
    
    console.log('正在为您直达腾讯云安全组配置台...');
    await page.goto('https://console.cloud.tencent.com/cvm/securitygroup', { waitUntil: 'networkidle2' });
    
    console.log('📢 提示：请在屏幕上刚刚弹出的浏览器中进行扫码/账号登录！');
    console.log('登录成功后，页面会自动跳转进【安全组列表】。');
    
    // 保持进程存活 10 分钟
    await new Promise(r => setTimeout(r, 600000));
    process.exit(0);
  } catch (err) {
    console.error('❌ 启动浏览器失败:', err);
    process.exit(1);
  }
})();
