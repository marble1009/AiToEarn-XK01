const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🚀 正在为您拉起有头 Chrome 调试浏览器...');
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main\\puppeteer_workspace\\chrome-debug-profile';
  
  if (fs.existsSync(profileDir)) {
    try {
      console.log('🧹 正在清理浏览器缓存锁文件...');
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch(e) {
      console.log('⚠️ 清理旧 Profile 失败:', e.message);
    }
  }

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
    console.log('🎉 Chrome 浏览器安全拉起成功！9222 端口已就绪。');
    
    const pages = await browser.pages();
    const page = pages[0];
    
    console.log('正在为您直达腾讯云安全组配置台（未登录会自动跳转至登录页）...');
    await page.goto('https://console.cloud.tencent.com/cvm/securitygroup', { waitUntil: 'networkidle2' });
    
    console.log('📢 提示：Chrome 窗口已在您屏幕上弹出，请在浏览器中扫码/账号登录。');
    console.log('登录成功后，页面会自动进入【安全组列表】。');
    
    // 保持进程存活 10 分钟以供我们随时连接和操作
    await new Promise(r => setTimeout(r, 600000));
    process.exit(0);
  } catch (err) {
    console.error('Failed to launch Chrome:', err.message);
  }
})();
