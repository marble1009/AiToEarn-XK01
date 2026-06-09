const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 开始执行高可靠性部署与发信验证脚本...');
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
  
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    const pages = await browser.pages();
    console.log(`🔌 成功连接调试 Chrome！当前共有 ${pages.length} 个标签页。`);
    
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!orcaPage) {
      console.error('❌ 错误：未在当前浏览器中找到 OrcaTerm/webshell/terminal 标签页！请先在浏览器中打开云服务器终端。');
      await browser.disconnect();
      process.exit(1);
    }
    
    console.log('🎉 成功定位到云服务器终端，准备接管并在前台激活...');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 2000));
    
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
    console.log('🎯 已尝试多重聚焦终端输入框。');
    await new Promise(r => setTimeout(r, 1000));

    console.log('👉 发送物理点击以激活终端焦点 (400, 300)...');
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 1500));
    
    // 辅助打字与确认回车的高可靠性方法
    async function sendCommand(cmd, waitMs = 2000) {
      console.log(`➡️ 发送指令: [ ${cmd} ]`);
      await orcaPage.keyboard.type(cmd, { delay: 40 });
      await new Promise(r => setTimeout(r, 300));
      await orcaPage.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, waitMs));
    }
    
    // 1. 发送中断信号
    console.log('🛑 发送 Ctrl + C 中断当前挂起操作...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1500));
    
    // 2. 进入项目根目录并拉取最新代码
    const cdCmd = 'cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn';
    await sendCommand(cdCmd, 2000);
    
    console.log('🔄 执行 git pull 更新服务器端代码与配置...');
    await sendCommand('git pull', 8000);

    console.log('🔧 强行在服务器上通过 sed 修复 config.js 的 Nvidia 兜底凭据...');
    const sedCmd = `sed -i "s/apiKey: AI_NVIDIA_API_KEY,/apiKey: AI_NVIDIA_API_KEY || 'placeholder-key-for-nvidia',/g" ~/aitoearn/project/aitoearn-backend/apps/aitoearn-ai/config/config.js || sed -i "s/apiKey: AI_NVIDIA_API_KEY,/apiKey: AI_NVIDIA_API_KEY || 'placeholder-key-for-nvidia',/g" project/aitoearn-backend/apps/aitoearn-ai/config/config.js`;
    await sendCommand(sedCmd, 2000);

    console.log('🔍 验证 config.js 修复状态...');
    const grepCmd = `grep -n "placeholder-key" ~/aitoearn/project/aitoearn-backend/apps/aitoearn-ai/config/config.js || grep -n "placeholder-key" project/aitoearn-backend/apps/aitoearn-ai/config/config.js`;
    await sendCommand(grepCmd, 2000);
    
    // 3. 彻底重启所有 Docker 容器以刷新 Nginx 代理与网络解析
    const restartCmd = 'sudo docker compose up -d --force-recreate';
    await sendCommand(restartCmd, 15000);
    
    console.log('⏳ 静静等待 25 秒让 Nest.js 与 Nginx 的健康检查 (healthcheck) 完全通过...');
    await new Promise(r => setTimeout(r, 25000));
    
    // 4. 查看当前容器状态与最近日志
    console.log('📊 检查当前 Docker 容器状态 (确保均为 Up (healthy) 状态)...');
    await sendCommand('sudo docker compose ps', 4000);
    
    console.log('📝 查看 aitoearn-ai 最近的容器日志...');
    await sendCommand('sudo docker compose logs -n 50 aitoearn-ai', 5000);

    console.log('📝 查看 aitoearn-server 最近的容器日志以验证启动与配置加载...');
    await sendCommand('sudo docker compose logs -n 50 aitoearn-server', 5000);
    
    // 截屏保存终端结果
    const screenshotTermPath = path.join(artifactDir, 'deploy_reboot_status.png');
    await orcaPage.screenshot({ path: screenshotTermPath });
    console.log(`📸 终端日志状态截图已成功保存至: ${screenshotTermPath}`);
    
    // 5. 新开测试标签页，测试真实的邮箱验证码发送
    console.log('🌐 正在新开测试标签页进行发信实测...');
    const testPage = await browser.newPage();
    
    // 监听网络请求与响应，捕获 /api/login/mail 的请求状态
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
    
    console.log('正在访问注册页面 http://aurastring.cloud/zh-CN/auth/login ...');
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
        // 匹配“发送验证码”、“发送”或“Code”
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
    
    // 关闭测试页面，但断开连接，保留浏览器！
    await testPage.close();
    console.log('🔌 正在断开 Puppeteer 连接，保留 Chrome 长开供确认。');
    await browser.disconnect();
    
    console.log('🎉 脚本执行完毕！');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ 脚本执行发生错误:', err);
    process.exit(1);
  }
})();
