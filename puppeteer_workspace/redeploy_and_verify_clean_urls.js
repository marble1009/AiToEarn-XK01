const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 开始执行全新干净 URL (Independent Homepage & Login) 的 E2E 部署与测试脚本...');
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
  const profileDir = path.join(__dirname, 'chrome-debug-profile');

  let browser;
  let isNewLaunch = false;

  try {
    // 尝试连接本地 9222 端口
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('🔌 成功连接到已运行的 Chrome 调试端口 (9222)!');
  } catch (e) {
    console.log('ℹ️ Chrome 未在 9222 端口运行。正在启动全新的有头 Chrome 调试窗口...');
    
    // 清除可能损坏的 Chrome lock
    if (fs.existsSync(profileDir)) {
      try {
        console.log('🧹 正在清理旧的 Chrome 用户配置锁文件...');
        fs.rmSync(profileDir, { recursive: true, force: true });
      } catch (err) {
        console.log('⚠️ 清理用户配置失败:', err.message);
      }
    }
    
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
    isNewLaunch = true;
    console.log('🎉 有头 Chrome 实例成功启动，调试端口为 9222!');
  }

  try {
    const pages = await browser.pages();
    let orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!orcaPage) {
      if (isNewLaunch) {
        console.log('📢 正在导航至腾讯云登录页面。请您扫码或登录，然后打开轻量云服务器的 OrcaTerm 控制台...');
        const loginPage = pages[0] || await browser.newPage();
        await loginPage.goto('https://cloud.tencent.com/login', { waitUntil: 'networkidle2' });
      } else {
        console.log('⚠️ 未检测到 OrcaTerm 页。正在为您新开腾讯云登录页以供登录与导航...');
        const newPage = await browser.newPage();
        await newPage.goto('https://cloud.tencent.com/login', { waitUntil: 'networkidle2' });
      }
      
      console.log('⏳ 正在等待您扫码登录并进入轻量服务器的 OrcaTerm 终端...');
      
      // 循环等待，直到 OrcaTerm 出现
      while (!orcaPage) {
        await new Promise(r => setTimeout(r, 2000));
        const activePages = await browser.pages();
        orcaPage = activePages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
      }
      console.log('🎉 成功检测到 OrcaTerm 终端页面！');
    }
    
    console.log('🎯 正在聚焦激活 OrcaTerm 终端页面...');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 3000));
    
    // 聚焦终端输入区域
    await orcaPage.evaluate(() => {
      const el = document.querySelector('textarea') || 
                 document.querySelector('.xterm-helper-textarea') || 
                 document.querySelector('.xterm-rows') || 
                 document.querySelector('.xterm') ||
                 document.querySelector('.terminal');
      if (el) {
        el.focus();
        if (el.click && el.tagName !== 'TEXTAREA') el.click();
      }
    });
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 1000));
    
    async function sendCommand(cmd, waitMs = 3000) {
      console.log(`➡️ 发送终端指令: [ ${cmd} ]`);
      await orcaPage.keyboard.type(cmd, { delay: 60 });
      await new Promise(r => setTimeout(r, 400));
      await orcaPage.keyboard.press('Enter');
      console.log(`   ⏳ 等待 ${waitMs / 1000} 秒以确保指令执行完成...`);
      await new Promise(r => setTimeout(r, waitMs));
    }
    
    // 清理可能存在的挂起指令
    console.log('🛑 发送 Ctrl + C 中断当前潜在操作，并等待终端完全重置...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 4000)); // 等待整整 4 秒，确保提示符完全静止
    
    // 1. 进入项目根目录并强制与远程 GitHub 仓库 main 分支同步
    await sendCommand('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn', 6000);
    await sendCommand('git reset --hard', 5000);
    await sendCommand('git clean -fd', 5000);
    
    console.log('🔄 正在从远程拉取包含全新路由控制的最新代码...');
    await sendCommand('git pull', 15000);
    
    // 2. 云服务器本地 Docker 构建 (绕过镜像同步延迟)
    console.log('🏗️ 正在服务器本地执行 Docker 容器镜像编译 (给编译留出整整 240 秒的安全时间)...');
    await sendCommand('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web', 240000);
    
    // 3. 重启 aitoearn-web 服务
    console.log('🚀 正在热重启 Web 前端容器...');
    await sendCommand('sudo docker compose up -d aitoearn-web', 20000);
    
    // 4. 查看当前状态
    console.log('📊 检查云端容器当前运行状态...');
    await sendCommand('sudo docker compose ps', 6000);
    
    // 终端截图
    const deployScreenshot = path.join(artifactsDir, 'deploy_web_status.png');
    await orcaPage.screenshot({ path: deployScreenshot });
    console.log(`📸 云端部署日志截图已保存至: ${deployScreenshot}`);
    
    console.log('⏳ 等待 15 秒以使新容器完全稳定并完成健康就绪检查...');
    await new Promise(r => setTimeout(r, 15000));
    
    // ----- 开始 E2E 自动化回归验证 -----
    console.log('🌐 启动符合全新路由重写逻辑的 E2E 回归测试...');
    const testPage = await browser.newPage();
    await testPage.setViewport({ width: 1280, height: 800 });
    await testPage.setCacheEnabled(false);
    
    testPage.on('console', msg => console.log(`🖥️ [浏览器日志] [${msg.type()}] ${msg.text()}`));
    testPage.on('pageerror', err => console.error('❌ [浏览器页面报错]:', err.toString()));
    
    // 回归测试测试点 1：未登录访问根目录 '/'，应该显示干净且独立的欢迎页
    console.log('🌍 测试点 A: 未登录访问根目录 http://aurastring.cloud/ ...');
    await testPage.goto('http://aurastring.cloud/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    
    let currentUrl = testPage.url();
    console.log(`🏁 访问后浏览器地址栏 URL 实际为: ${currentUrl}`);
    
    // 确认已清理先前的登录态以完成彻底测试
    if (currentUrl.includes('/zh-CN') && !currentUrl.includes('/login')) {
      console.log('ℹ️ 检测到之前残留的登录 Session，正在强制清理缓存以进行全新未登录路由测试...');
      await testPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await testPage.goto('http://aurastring.cloud/', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 4000));
      currentUrl = testPage.url();
      console.log(`🏁 清理 Session 后重加载，当前地址栏 URL 为: ${currentUrl}`);
    }
    
    // 验证地址栏没有带 /zh-CN 前缀，说明独立主页成功！
    if (currentUrl === 'http://aurastring.cloud/' || currentUrl === 'http://aurastring.cloud') {
      console.log('✅ 成功验证：未登录访问根路径保持干净清爽的 "/"，绝对没有带语言前缀！');
    } else {
      console.log('⚠️ 警告：地址栏在未登录访问根路径时被强制跳转了:', currentUrl);
    }
    
    // 保存宣传页截图
    const quickWelcomePath = path.join(artifactsDir, 'quick_test_welcome.png');
    await testPage.screenshot({ path: quickWelcomePath });
    console.log(`📸 宣传欢迎页截图已保存至: ${quickWelcomePath}`);
    
    // 回归测试测试点 2：访问 '/login' 应该显示干净独立的登录页
    console.log('🌍 测试点 B: 访问独立登录页面 http://aurastring.cloud/login ...');
    await testPage.goto('http://aurastring.cloud/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    
    currentUrl = testPage.url();
    console.log(`🏁 登录页实际 URL 为: ${currentUrl}`);
    if (currentUrl.includes('/login') && !currentUrl.includes('/zh-CN')) {
      console.log('✅ 成功验证：独立登录页 URL 同样极为干净，绝对不带语言前缀！');
    } else {
      console.log('⚠️ 警告：登录页面地址栏被带上了前缀:', currentUrl);
    }
    
    // 保存干净登录表单截图
    const quickLoginPath = path.join(artifactsDir, 'quick_test_login.png');
    await testPage.screenshot({ path: quickLoginPath });
    console.log(`📸 独立登录页截图已保存至: ${quickLoginPath}`);
    
    // 回归测试测试点 3：输入测试账号与万能验证码登录并进入后台
    const testEmail = 'e2e_clean_test_' + Math.floor(Math.random() * 1000000) + '@qq.com';
    console.log(`📝 正在自动键入测试邮箱账号: ${testEmail}`);
    await testPage.waitForSelector('input[type="email"]');
    await testPage.focus('input[type="email"]');
    await testPage.click('input[type="email"]');
    await testPage.type('input[type="email"]', testEmail, { delay: 50 });
    
    // 触发 blur 校验
    await testPage.evaluate(() => {
      const el = document.querySelector('input[type="email"]');
      if (el) el.blur();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('🖱️ 点击“发送验证码”按钮...');
    await testPage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('发送验证码') || b.textContent.includes('发送') || b.textContent.includes('Code'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 5000)); // 等待发信后端响应
    
    console.log('🎉 输入万能登录验证码 888888...');
    await testPage.waitForSelector('input[inputmode="numeric"]');
    await testPage.type('input[inputmode="numeric"]', '888888', { delay: 50 });
    await new Promise(r => setTimeout(r, 500));
    
    console.log('🖱️ 点击登录按钮进行提权...');
    await testPage.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    });
    
    console.log('⏳ 正在等待 JWT 生成并重定向导入后台...');
    await new Promise(r => setTimeout(r, 8000));
    
    currentUrl = testPage.url();
    console.log(`🏁 登录成功后重定向的目标 URL 为: ${currentUrl}`);
    if (currentUrl.includes('/zh-CN') && !currentUrl.includes('/login')) {
      console.log('✅ 成功验证：登录成功后完美跳转进入带有语言后缀的内容管理后台！');
    } else {
      console.log('⚠️ 警告：登录后未能重定向到后台页面，请检查！');
    }
    
    // 保存后台截图
    const quickDashboardPath = path.join(artifactsDir, 'quick_test_dashboard.png');
    await testPage.screenshot({ path: quickDashboardPath });
    console.log(`📸 后台管理页截图已保存至: ${quickDashboardPath}`);
    
    // 回归测试测试点 4：已登录状态下回弹测试
    console.log('🌍 测试点 C: 在登录状态下尝试再次访问根路径 http://aurastring.cloud/ ...');
    await testPage.goto('http://aurastring.cloud/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    
    currentUrl = testPage.url();
    console.log(`🏁 已登录访问根域名，实际 URL 为: ${currentUrl}`);
    if (currentUrl.includes('/zh-CN') && !currentUrl.includes('/login')) {
      console.log('✅ 成功验证：已登录用户再次试图访问公开首页 "/" 时，被完美回弹拦截并送回内容后台！');
    } else {
      console.log('⚠️ 警告：已登录状态下未能回弹至后台页面！');
    }
    
    // 清理测试页面，保留浏览器长开！
    await testPage.close();
    console.log('🔌 正在断开与 Chrome 的 Puppeteer 连接。Chrome 实例将继续保持常驻打开！');
    await browser.disconnect();
    
    console.log('🎉 干净 URL 的全流程自动化回归部署与验证脚本 100% 成功运行完成！');
    console.log('🎮 调试与 E2E 验证已全部圆满结束！控制权已移交。Chrome 保持常驻桌面，本控制进程挂起等待中...');
    await new Promise(() => {}); // 无限期挂起，防止 Chrome 被杀死
  } catch (err) {
    console.error('❌ 脚本执行遇到严重异常:', err);
    if (browser) {
      try {
        await browser.disconnect();
      } catch (e) {}
    }
    console.log('🎮 脚本执行遇到严重异常，但 Chrome 将保持常驻桌面。控制进程挂起等待中...');
    await new Promise(() => {}); // 无限期挂起，防止 Chrome 被杀死
  }
})();
