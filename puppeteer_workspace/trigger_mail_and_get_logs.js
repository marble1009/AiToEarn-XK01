const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 启动邮箱测试并抓取日志脚本...');
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    console.log(`🔌 已连接 Chrome，共有 ${pages.length} 个标签页`);

    // 1. 定位 OrcaTerm 页面
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    if (!orcaPage) {
      console.error('❌ 未找到 OrcaTerm 页面！');
      await browser.disconnect();
      return;
    }

    // 2. 打开一个新的标签页访问登录页
    console.log('🌐 打开新标签页访问注册登录页...');
    const testPage = await browser.newPage();
    await testPage.goto('http://aurastring.cloud/zh-CN/auth/login', { waitUntil: 'networkidle2', timeout: 30000 }).catch(err => {
      console.log(`⚠️ 页面加载超时或出错: ${err.message}`);
    });
    await new Promise(r => setTimeout(r, 3000));

    // 3. 寻找邮箱输入框并输入邮箱
    console.log('✍️ 输入测试邮箱...');
    const emailInput = await testPage.$('input[type="email"]') || await testPage.$('input[placeholder*="邮箱"]');
    if (!emailInput) {
      console.error('❌ 未找到邮箱输入框！正在截图并退出...');
      await testPage.screenshot({ path: path.join(artifactDir, 'scratch', 'email_not_found.png') });
      await testPage.close();
      await browser.disconnect();
      return;
    }

    const testEmail = `test_${Math.floor(Math.random() * 10000)}@qq.com`;
    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await emailInput.type(testEmail, { delay: 50 });
    await new Promise(r => setTimeout(r, 1000));

    // 4. 点击发送验证码按钮
    console.log('👉 点击“发送验证码”...');
    const sendBtn = await testPage.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('发送验证码') || b.textContent.includes('发送') || b.textContent.includes('Code'));
    });

    if (sendBtn && sendBtn.asElement()) {
      await sendBtn.asElement().click();
      console.log('⏳ 已触发点击，等待 4 秒以允许后端处理并报错...');
      await new Promise(r => setTimeout(r, 4000));

      // 截取前端页面错误提示
      await testPage.screenshot({ path: path.join(artifactDir, 'scratch', 'test_page_triggered.png') });
      console.log('📸 前端错误截图已保存');
    } else {
      console.error('❌ 未找到“发送验证码”按钮！');
    }

    // 5. 关闭测试页面
    await testPage.close();

    // 6. 激活 OrcaTerm 页面
    console.log('🎯 切换至 OrcaTerm 并激活焦点...');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

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
    await new Promise(r => setTimeout(r, 500));

    // 7. 发送 Control+C 并执行 docker compose logs
    console.log('🛑 清理终端提示符...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    console.log('➡️ 执行日志输出指令...');
    const cmd = "sudo docker compose logs -n 80 aitoearn-server";
    await orcaPage.keyboard.type(cmd, { delay: 40 });
    await new Promise(r => setTimeout(r, 300));
    await orcaPage.keyboard.press('Enter');

    console.log('⏳ 等待 6 秒让日志在终端上完全显示...');
    await new Promise(r => setTimeout(r, 6000));

    // 截屏保存
    const termScreenshotPath = path.join(artifactDir, 'scratch', 'mail_error_logs.png');
    await orcaPage.screenshot({ path: termScreenshotPath });
    console.log(`📸 终端日志截图已保存至: ${termScreenshotPath}`);

    await browser.disconnect();
    console.log('🎉 脚本执行完毕。');

  } catch (err) {
    console.error('❌ 执行过程中出错:', err);
  }
})();
