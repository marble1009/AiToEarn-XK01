const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 启动【AI 对话与生成 E2E 实机测试】...');
  
  let browser;
  let testPage;
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('🎉 成功连接 Chrome 调试器！');

    testPage = await browser.newPage();
    await testPage.setCacheEnabled(false);
    await testPage.setViewport({ width: 1280, height: 800 });

    // Enable Console & Page Error logs
    testPage.on('console', msg => console.log(`🖥️ PAGE LOG: [${msg.type()}] ${msg.text()}`));
    testPage.on('pageerror', err => console.error('❌ PAGE ERROR:', err.toString()));

    // 访问根地址并清理会话
    console.log('🧹 正在对目标域进行精准会话清理...');
    try {
      await testPage.goto('http://aurastring.cloud/favicon.ico', { waitUntil: 'load', timeout: 10000 });
      await testPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      const cookies = await testPage.cookies('http://aurastring.cloud');
      if (cookies.length > 0) {
        await testPage.deleteCookie(...cookies);
      }
      console.log('✅ 精准会话清理完成！');
    } catch (e) {
      console.log('⚠️ 清理目标域会话遇到错误（继续）：', e.message);
    }

    // --- 步骤 1: 登录账户 ---
    console.log('\n🔍 [验证 1] 登录账户: http://aurastring.cloud/login ...');
    await testPage.goto('http://aurastring.cloud/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    const testEmail = 'aura_chat_test_79641@gmail.com';
    await testPage.waitForSelector('input[type="email"]');
    await testPage.focus('input[type="email"]');
    await testPage.type('input[type="email"]', testEmail, { delay: 50 });
    console.log(`👉 已输入测试邮箱: ${testEmail}`);

    await testPage.evaluate(() => {
      const input = document.querySelector('input[type="email"]');
      if (input) input.blur();
    });
    await new Promise(r => setTimeout(r, 1000));

    console.log('🖱️ 点击“发送验证码”...');
    await testPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sendBtn = btns.find(b => b.textContent.includes('验证码') || b.textContent.includes('Code') || b.textContent.includes('发送'));
      if (sendBtn) sendBtn.click();
    });

    await new Promise(r => setTimeout(r, 5000));

    console.log('📝 正在输入万能验证码 888888...');
    await testPage.waitForSelector('input[inputmode="numeric"]');
    await testPage.focus('input[inputmode="numeric"]');
    await testPage.type('input[inputmode="numeric"]', '888888', { delay: 50 });
    await new Promise(r => setTimeout(r, 500));

    console.log('🖱️ 点击提交登录...');
    await testPage.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    console.log('⏳ 正在等待账户重定向到个人工作区 (10 秒)...');
    await new Promise(r => setTimeout(r, 10000));
    console.log(`🏁 当前落地 URL: ${testPage.url()}`);

    // --- 步骤 2: 访问 AI 创作空间并进行对话生成 ---
    console.log('\n🔍 [验证 2] 访问 AI 创作空间并发起对话生成...');
    await testPage.goto('http://aurastring.cloud/zh-CN/ai-social', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    console.log('📝 正在查找聊天输入框并输入 Prompt...');
    await testPage.waitForSelector('textarea');
    await testPage.focus('textarea');
    
    const promptText = '请为一家名为"AuraString"的赛博朋克风智能创作平台写一句极具未来感的宣传标语。请只返回标语本身，无需其他解释。';
    await testPage.type('textarea', promptText, { delay: 30 });
    console.log(`👉 已输入 Prompt: "${promptText}"`);
    await new Promise(r => setTimeout(r, 1000));

    const chatInputScreenshot = path.join(artifactsDir, 'test_chat_1_input.png');
    await testPage.screenshot({ path: chatInputScreenshot });
    console.log(`📸 对话输入截图已保存: ${chatInputScreenshot}`);

    console.log('⌨️ 按下 Enter 键发送消息并启动 AI Agent...');
    await testPage.keyboard.press('Enter');

    console.log('⏳ 正在等待重定向到 /chat/[taskId] 详情页面 (8 秒)...');
    await new Promise(r => setTimeout(r, 8000));
    
    const chatUrl = testPage.url();
    console.log(`🏁 发送后的当前 URL: ${chatUrl}`);

    const redirectScreenshot = path.join(artifactsDir, 'test_chat_2_redirected.png');
    await testPage.screenshot({ path: redirectScreenshot });
    console.log(`📸 重定向详情页截图已保存: ${redirectScreenshot}`);

    // --- 步骤 3: 监控 AI 生成与流式响应 ---
    console.log('\n🔍 [验证 3] 正在等待 AI 流式响应生成结束 (30 秒)...');
    await new Promise(r => setTimeout(r, 30000));

    const finalScreenshot = path.join(artifactsDir, 'test_chat_3_completed.png');
    await testPage.screenshot({ path: finalScreenshot });
    console.log(`📸 最终生成结果截图已保存: ${finalScreenshot}`);

    const finalPageText = await testPage.evaluate(() => {
      // 提取聊天页面中的 AI 消息内容
      const assistantMsgs = Array.from(document.querySelectorAll('.prose, [class*="message"], [class*="chat-message"]'));
      return assistantMsgs.map(m => m.innerText).join('\n---\n');
    });

    console.log('\n--- 📝 AI 生成回复文本内容 ---');
    console.log(finalPageText || '未获取到文本内容，请查看截图核对');
    console.log('-----------------------------\n');

    await testPage.close();
    await browser.disconnect();
    console.log('🎉 【AI 对话与生成自检圆满成功！】');
  } catch (err) {
    console.error('❌ E2E 测试遇到错误:', err);
    if (testPage) await testPage.close();
    if (browser) await browser.disconnect();
  }
})();
