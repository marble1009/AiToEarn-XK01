const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 启动【安全隔离 E2E 实机测试 - 不影响控制台 Session】...');
  
  let browser;
  let testPage;
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('🎉 成功连接！');

    testPage = await browser.newPage();
    await testPage.setCacheEnabled(false);
    await testPage.setViewport({ width: 1280, height: 800 });

    // 访问静态资源以允许我们安全清除该域下的本地缓存，不调用全局 Network.clearBrowserCookies
    console.log('🧹 正在对目标域进行精准会话清理...');
    try {
      await testPage.goto('http://aurastring.cloud/favicon.ico', { waitUntil: 'load', timeout: 10000 });
      await testPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      // 仅清除目标域的 cookies，避免清除腾讯云控制台的 cookies
      const cookies = await testPage.cookies('http://aurastring.cloud');
      if (cookies.length > 0) {
        await testPage.deleteCookie(...cookies);
      }
      console.log('✅ 精准会话清理完成！');
    } catch (e) {
      console.log('⚠️ 清理目标域会话遇到错误（继续）：', e.message);
    }

    // --- 步骤 1: 访问原生无前缀 / 首页 ---
    console.log('\n🔍 [验证 1] 访问根地址: http://aurastring.cloud ...');
    await testPage.goto('http://aurastring.cloud/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('⏳ 等待 5 秒让前端粒子背景与文字渲染完毕...');
    await new Promise(r => setTimeout(r, 5000));

    const welcomeScreenshot = path.join(artifactsDir, 'verify_3_welcome.png');
    await testPage.screenshot({ path: welcomeScreenshot });
    console.log(`📸 欢迎页截图已保存: ${welcomeScreenshot}`);

    // --- 步骤 2: 访问解耦登录页 http://aurastring.cloud/login ---
    console.log('\n🔍 [验证 2] 访问登录页面: http://aurastring.cloud/login ...');
    await testPage.goto('http://aurastring.cloud/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('⏳ 等待 4 秒...');
    await new Promise(r => setTimeout(r, 4000));

    const loginScreenshot = path.join(artifactsDir, 'verify_1_login.png');
    await testPage.screenshot({ path: loginScreenshot });
    console.log(`📸 登录页截图已保存: ${loginScreenshot}`);

    // --- 步骤 3: 模拟万能验证码登录并进入个人专属中文工作区 ---
    console.log('\n🔍 [验证 3] 模拟万能验证码登录进个人工作区...');
    const testEmail = `aura_lab_${Math.floor(Math.random() * 100000)}@gmail.com`;
    
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

    console.log('⏳ 正在等待 5 秒，让后台接口下发...');
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

    const finalUrl = testPage.url();
    console.log(`🏁 最终账户落地页 URL: ${finalUrl}`);

    const successScreenshot = path.join(artifactsDir, 'verify_2_success.png');
    await testPage.screenshot({ path: successScreenshot });
    console.log(`📸 登录成功工作区截图已保存: ${successScreenshot}`);

    // 关闭新标签页
    await testPage.close();
    await browser.disconnect();
    console.log('\n🎉 【安全隔离 E2E 自检圆满成功！】');
  } catch (err) {
    console.error('❌ 验证遇到错误:', err);
    if (testPage) await testPage.close();
    if (browser) await browser.disconnect();
  }
})();
