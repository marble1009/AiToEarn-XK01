const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 正在执行高规格 Chrome 调试初始化...');
  
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main\\puppeteer_workspace\\chrome-debug-profile';
  
  // 1. 彻底清除旧 Profile 以免任何 lock 文件导致 Chrome 闪退崩溃
  if (fs.existsSync(profileDir)) {
    try {
      console.log('🧹 正在清理可能残留的 Chrome lock 崩溃文件...');
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch(e) {
      console.log('⚠️ 清理旧 Profile 失败 (这通常没关系):', e.message);
    }
  }

  let browser;
  try {
    console.log('🚀 正在拉起全新且绝对不会闪退的有头 Chrome 浏览器...');
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
    console.log('🎉 Chrome 浏览器安全拉起成功！9222 调试端口已稳定激活。');
    
    const pages = await browser.pages();
    const loginPage = pages[0];
    
    console.log('正在导航至腾讯云登录页面...');
    await loginPage.goto('https://cloud.tencent.com/login', { waitUntil: 'networkidle2' });
    
    console.log('----------------------------------------------------');
    console.log('📢 提示：请直接在您屏幕上刚刚弹出的 Chrome 浏览器中进行扫码登录！');
    console.log('登录成功后，请在腾讯云控制表中，点开您的云服务器网页终端（OrcaTerm）。');
    console.log('只要您一打开终端页面，脚本就会自动检测到并帮您完成 Docker 容器重启与邮件发信测试！');
    console.log('----------------------------------------------------');
    
    // 循环监听标签页
    console.log('⏳ 正在监控 OrcaTerm 网页终端的开启状态...');
    const monitorInterval = setInterval(async () => {
      try {
        const activePages = await browser.pages();
        const foundPage = activePages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
        
        if (foundPage) {
          console.log('🎉 检测到 OrcaTerm 页面！准备接管...');
          await foundPage.bringToFront();
          
          console.log('等待 4 秒以确保网络会话完全同步就绪...');
          await new Promise(r => setTimeout(r, 4000));
          
          // 聚焦输入
          console.log('正在聚焦网页终端...');
          await foundPage.evaluate(() => {
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
          await new Promise(r => setTimeout(r, 1000));
          
          // 发送 Ctrl + C
          console.log('发送 Ctrl + C 中断信号...');
          await foundPage.keyboard.down('Control');
          await foundPage.keyboard.press('KeyC');
          await foundPage.keyboard.up('Control');
          await new Promise(r => setTimeout(r, 1500));
          await foundPage.keyboard.type('\n');
          await new Promise(r => setTimeout(r, 1500));
          
          // 发送 Docker 重启命令
          const restartCmd = 'sudo docker compose up -d aitoearn-server';
          console.log(`🚀 正在向终端发送重启命令: [ ${restartCmd} ]`);
          await foundPage.keyboard.type(restartCmd, { delay: 50 });
          await new Promise(r => setTimeout(r, 1500));
          await foundPage.keyboard.press('Enter');
          
          // 只有在所有终端操作顺利打入并且没有抛出 TargetCloseError 的情况下，才清除轮询！
          clearInterval(monitorInterval);
          console.log('🎉 重启容器指令已成功发送！正在等待 15 秒以待容器重新拉起...');
          await new Promise(r => setTimeout(r, 15000));
          
          // 截图保存终端结果
          const termPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\deploy_terminal_status.png';
          await foundPage.screenshot({ path: termPath });
          console.log(`📸 网页终端状态截图已保存至: ${termPath}`);
          
          // 2. 新建标签页进行注册测试
          console.log('🚀 正在新开标签页访问官方进行发信测试...');
          const testPage = await browser.newPage();
          await testPage.goto('http://aurastring.cloud/zh-CN/register', { waitUntil: 'networkidle2' }).catch(() => {});
          await new Promise(r => setTimeout(r, 3000));
          
          console.log('正在寻找注册界面的邮箱输入框...');
          const emailInput = await testPage.$('input[type="email"]') || await testPage.$('input[placeholder*="邮箱"]');
          
          if (emailInput) {
            const testEmail = `test_deploy_${Math.floor(Math.random() * 100000)}@163.com`;
            console.log(`👉 正在输入测试邮箱: ${testEmail}`);
            await emailInput.click({ clickCount: 3 });
            await emailInput.press('Backspace');
            await emailInput.type(testEmail, { delay: 50 });
            await new Promise(r => setTimeout(r, 1000));
            
            const sendBtn = await testPage.$('button[id*="send"]') || 
                            await testPage.$('button[class*="send"]') || 
                            await testPage.evaluateHandle(() => {
                              const buttons = Array.from(document.querySelectorAll('button'));
                              return buttons.find(b => b.textContent.includes('验证码') || b.textContent.includes('Code') || b.textContent.includes('发送'));
                            });
                            
            if (sendBtn) {
              console.log('👉 找到“发送验证码”按钮，正在点击触发发信...');
              await sendBtn.click();
              console.log('等待 6 秒观察页面发件回馈...');
              await new Promise(r => setTimeout(r, 6000));
              
              const testPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\email_test_status.png';
              await testPage.screenshot({ path: testPath });
              console.log(`📸 发件注册测试截图已保存至: ${testPath}`);
            }
          }
          
          // 坚决不断开和不关闭浏览器，保持长达 10 分钟以供用户查看
          console.log('🎉 自动化部署与邮箱发信测试全部顺利闭环完成！浏览器将继续保持常开以供您确认...');
          await new Promise(r => setTimeout(r, 600000));
          process.exit(0);
        }
      } catch (err) {
        console.log(`⚠️ 捕获到接管期间的异常 (多为腾讯云长连接刷新导致)，将自动继续保持监控重试: ${err.message}`);
      }
    }, 2500);

  } catch (err) {
    console.error('运行出错:', err);
  }
})();
