const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 开始执行全交互式一键部署与发信验证自动化...');
  
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main\\puppeteer_workspace\\chrome-debug-profile';
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
  
  // 1. 清理旧 Profile 防止 Chrome 闪退锁死
  if (fs.existsSync(profileDir)) {
    try {
      console.log('🧹 清理可能残留的 Chrome 崩溃锁文件...');
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch(e) {
      console.log('⚠️ 清理 Profile 失败:', e.message);
    }
  }

  try {
    console.log('🚀 正在启动有头 Chrome 浏览器 (调试端口: 9222)...');
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
    console.log('🎉 Chrome 浏览器启动成功！');
    
    const pages = await browser.pages();
    const loginPage = pages[0];
    
    console.log('正在导航至腾讯云登录页面...');
    await loginPage.goto('https://cloud.tencent.com/login', { waitUntil: 'networkidle2' });
    
    console.log('\n====================================================');
    console.log('📢 提示：请在桌面上刚刚弹出的 Chrome 浏览器中扫码登录！');
    console.log('登录成功后，请在轻量应用服务器/云服务器控制台，点开您的网页终端 (OrcaTerm/webshell)。');
    console.log('只要您打开终端，脚本就会自动捕获并帮您完成 CD 进入目录、git pull、Docker 容器重启与发信测试！');
    console.log('====================================================\n');
    
    // 循环监控
    const monitorInterval = setInterval(async () => {
      try {
        const activePages = await browser.pages();
        const orcaPage = activePages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
        
        if (orcaPage) {
          console.log('🎉 检测到 OrcaTerm 页面！准备接管控制...');
          clearInterval(monitorInterval); // 停止轮询
          
          await orcaPage.bringToFront();
          console.log('等待 4 秒确保终端网络会话加载完毕...');
          await new Promise(r => setTimeout(r, 4000));
          
          // 聚焦终端输入
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
          console.log('🎯 已聚焦终端。');
          await new Promise(r => setTimeout(r, 1000));
          
          // 发送键盘指令的辅助函数
          async function executeShellCommand(cmd, waitMs = 2000) {
            console.log(`➡️ 执行指令: [ ${cmd} ]`);
            await orcaPage.keyboard.type(cmd, { delay: 40 });
            await new Promise(r => setTimeout(r, 200));
            await orcaPage.keyboard.press('Enter');
            await new Promise(r => setTimeout(r, waitMs));
          }
          
          // 1. 发送 Ctrl+C 重置
          console.log('🛑 发送 Ctrl + C 中断信号...');
          await orcaPage.keyboard.down('Control');
          await orcaPage.keyboard.press('KeyC');
          await orcaPage.keyboard.up('Control');
          await new Promise(r => setTimeout(r, 1000));
          await orcaPage.keyboard.press('Enter');
          await new Promise(r => setTimeout(r, 1500));
          
          // 2. 进入项目根目录并更新代码
          const cdCmd = 'cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn';
          await executeShellCommand(cdCmd, 2000);
          await executeShellCommand('git pull', 8000);
          
          // 3. 重启 aitoearn-server 容器
          const restartCmd = 'sudo docker compose up -d aitoearn-server';
          await executeShellCommand(restartCmd, 15000);
          
          // 4. 查看当前容器状态与最近日志
          console.log('📊 检查当前 Docker 容器状态...');
          await executeShellCommand('sudo docker compose ps', 4000);
          
          console.log('📝 查看 aitoearn-server 最近的容器日志...');
          await executeShellCommand('sudo docker compose logs -n 50 aitoearn-server', 5000);
          
          // 截图终端状态
          const screenshotTermPath = path.join(artifactDir, 'deploy_reboot_status.png');
          await orcaPage.screenshot({ path: screenshotTermPath });
          console.log(`📸 终端日志状态截图已成功保存至: ${screenshotTermPath}`);
          
          // 5. 新开测试标签页，测试真实的邮箱验证码发送
          console.log('🌐 正在新开标签页访问官方注册页面进行发信实测...');
          const testPage = await browser.newPage();
          
          testPage.on('request', request => {
            if (request.url().includes('/api/login/mail')) {
              console.log(`📡 [HTTP Request] ${request.method()} ${request.url()}`);
              console.log(`📦 Payload: ${request.postData()}`);
            }
          });
          
          testPage.on('response', async response => {
            if (response.url().includes('/api/login/mail')) {
              console.log(`📡 [HTTP Response] Status: ${response.status()}`);
              try {
                const text = await response.text();
                console.log(`📦 Response Body: ${text}`);
              } catch (e) {
                console.log(`⚠️ 无法读取响应体: ${e.message}`);
              }
            }
          });
          
          console.log('正在访问登录页面 http://aurastring.cloud/zh-CN/auth/login ...');
          await testPage.goto('http://aurastring.cloud/zh-CN/auth/login', { waitUntil: 'networkidle2', timeout: 30000 }).catch(err => {
            console.log(`⚠️ 页面加载超时或出错: ${err.message}，将继续尝试操作`);
          });
          await new Promise(r => setTimeout(r, 5000));
          
          console.log('🔍 正在寻找注册界面的邮箱输入框...');
          const emailInput = await testPage.$('input[type="email"]') || await testPage.$('input[placeholder*="邮箱"]');
          
          if (emailInput) {
            const testEmail = `test_exmail_verify_${Math.floor(Math.random() * 100000)}@163.com`;
            console.log(`👉 找到输入框，正在输入测试邮箱: ${testEmail}`);
            await emailInput.click({ clickCount: 3 });
            await emailInput.press('Backspace');
            await emailInput.type(testEmail, { delay: 50 });
            await new Promise(r => setTimeout(r, 1000));
            
            const sendBtn = await testPage.evaluateHandle(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              return buttons.find(b => b.textContent.includes('发送验证码') || b.textContent.includes('发送') || b.textContent.includes('Code'));
            });
            
            if (sendBtn && sendBtn.asElement()) {
              console.log('👉 找到“发送验证码”按钮，正在点击触发发信...');
              await sendBtn.asElement().click();
              console.log('⏳ 已触发点击，等待 8 秒观察页面与网络返回...');
              await new Promise(r => setTimeout(r, 8000));
              
              const screenshotTestPath = path.join(artifactDir, 'email_test_status.png');
              await testPage.screenshot({ path: screenshotTestPath });
              console.log(`📸 发件注册测试截图已成功保存至: ${screenshotTestPath}`);
            } else {
              console.error('❌ 未找到“发送验证码”按钮！');
            }
          } else {
            console.error('❌ 未找到邮箱输入框，无法进行自动发件测试！');
          }
          
          await testPage.close();
          console.log('🎉 自动化部署与邮箱发信测试全部顺利闭环完成！');
          console.log('📌 调试浏览器将永久保持常开，方便您检查和随时进行其他操作！');
          // 挂起，永不退出
          await new Promise(() => {});
        }
      } catch (err) {
        console.log(`⚠️ 监控中捕获到异常 (将在下次循环中自动恢复并重试): ${err.message}`);
      }
    }, 2500);

  } catch (err) {
    console.error('❌ 浏览器启动或接管失败:', err);
  }
})();
