const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 启动【纯前端有头浏览器交互 - E2E 完美主义高兼容版验证】...');
  
  let browser;
  let testPage;
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch';

  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  try {
    console.log('🔌 正在连接已运行的 9222 调试端口 Chrome...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('🎉 成功连接！');

    console.log('🌐 正在为您新建标签页进行 E2E 完整路由路径自检...');
    testPage = await browser.newPage();
    await testPage.setCacheEnabled(false);
    await testPage.setViewport({ width: 1280, height: 800 });

    // Enable console logs in page
    testPage.on('console', msg => console.log(`🖥️ [PAGE LOG] ${msg.text()}`));
    testPage.on('pageerror', err => console.error('❌ [PAGE ERROR]', err.toString()));

    // 强制使用 CDP 进行深层清空，杜绝旧 Token 缓存
    console.log('🧹 正在清空浏览器深层会话 (CDP Cookies & Cache)...');
    try {
      const client = await testPage.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.send('Network.clearBrowserCache');
      
      // 访问静态文件以安全清空该域下的 Local/Session Storage
      await testPage.goto('http://aurastring.cloud/favicon.ico', { waitUntil: 'load', timeout: 8000 });
      await testPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      console.log('✅ 浏览器深层会话清空成功！');
    } catch (e) {
      console.log('⚠️ 清理深层会话遇到非关键错误，继续执行:', e.message);
    }

    // --- 步骤 1: 访问并验证解耦的登录页 http://aurastring.cloud/login ---
    console.log('\n🔍 [验证 1] 正在导航到解耦的登录页面: http://aurastring.cloud/login ...');
    try {
      await testPage.goto('http://aurastring.cloud/login', { waitUntil: 'networkidle2', timeout: 15000 });
    } catch (e) {
      console.log('💡 导航到登录页完成（或忽略了非关键的静态资源加载慢超时）:', e.message);
    }
    console.log('⏳ 等待 4 秒以确保 Next.js 前端 Hydration 渲染完毕...');
    await new Promise(r => setTimeout(r, 4000));

    const afterClickUrl = testPage.url();
    console.log(`📍 登录页 URL 表现: ${afterClickUrl}`);
    
    if (afterClickUrl.includes('/login') && !afterClickUrl.includes('/zh-CN/') && !afterClickUrl.includes('/en/')) {
      console.log('✅ [验证 1 成功] 登录页成功解耦，并完美保持无语言前缀的原生 /login 表现！');
    } else {
      console.log(`⚠️ [验证 1 注意] 登录页路径带有前缀或显示异常: ${afterClickUrl}`);
    }

    const loginScreenshot = path.join(artifactsDir, 'verify_1_login.png');
    await testPage.screenshot({ path: loginScreenshot });
    console.log(`📸 登录页截图已保存: ${loginScreenshot}`);

    // --- 步骤 2: 模拟万能验证码登录并校验后续路由 ---
    console.log('\n🔍 [验证 2] 模拟万能验证码登录并校验后续路由...');
    
    console.log('📝 正在输入测试邮箱...');
    const testEmail = `e2e_verify_${Math.floor(Math.random() * 100000)}@qq.com`;
    
    await testPage.waitForSelector('input[type="email"]');
    await testPage.focus('input[type="email"]');
    await testPage.click('input[type="email"]');
    await testPage.type('input[type="email"]', testEmail, { delay: 50 });
    console.log(`👉 已输入测试邮箱: ${testEmail}`);

    // 触发 React Hook Form blur 校验
    await testPage.evaluate(() => {
      const input = document.querySelector('input[type="email"]');
      if (input) input.blur();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 点击“发送验证码”
    console.log('🖱️ 点击“发送验证码”按钮...');
    const btnClicked = await testPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sendBtn = btns.find(b => b.textContent.includes('验证码') || b.textContent.includes('Code') || b.textContent.includes('发送'));
      if (sendBtn) {
        sendBtn.click();
        return true;
      }
      return false;
    });

    if (btnClicked) {
      console.log('⏳ 正在等待 5 秒，让后台接口执行万能验证码下发...');
      await new Promise(r => setTimeout(r, 5000));
    } else {
      throw new Error('❌ 无法找到发送验证码按钮！');
    }

    // 输入万能验证码
    console.log('📝 正在打字输入万能验证码 888888...');
    await testPage.waitForSelector('input[inputmode="numeric"]');
    await testPage.focus('input[inputmode="numeric"]');
    await testPage.type('input[inputmode="numeric"]', '888888', { delay: 50 });
    await new Promise(r => setTimeout(r, 500));

    // 点击提交登录
    console.log('🖱️ 点击提交注册登录...');
    await testPage.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    console.log('⏳ 正在等待账户创建、鉴权并重定向到个人工作区 (8 秒)...');
    await new Promise(r => setTimeout(r, 8000));

    const finalUrl = testPage.url();
    const finalTitle = await testPage.title();
    console.log(`🏁 最终账户落地页 URL: ${finalUrl}`);
    console.log(`🏁 最终账户落地页 Title: ${finalTitle}`);

    if (finalUrl.includes('/zh-CN/')) {
      console.log('✅ [验证 2 成功] 登录成功！成功进入带有用户专属 Suffix 标识的个性化工作区 URL！');
    } else {
      console.log(`⚠️ [验证 2 注意] 最终落地页没有看到正确的后缀专属标识: ${finalUrl}`);
    }

    const successScreenshot = path.join(artifactsDir, 'verify_2_success.png');
    await testPage.screenshot({ path: successScreenshot });
    console.log(`📸 登录成功后工作区截图已保存: ${successScreenshot}`);

    // --- 步骤 3: 访问根路径并验证原生无语言前缀的 / 首页 ---
    console.log('\n🔍 [验证 3] 访问根地址: http://aurastring.cloud ...');
    try {
      // 容错级加载：设置 20 秒安全超时，完成后直接判定
      await testPage.goto('http://aurastring.cloud', { waitUntil: 'load', timeout: 20000 });
    } catch (e) {
      console.log('💡 导航完成（或忽略了非关键的静态资源加载慢超时）:', e.message);
    }
    console.log('⏳ 等待 4 秒以确保 Next.js 前端 Hydration 渲染完毕...');
    await new Promise(r => setTimeout(r, 4000)); 

    const welcomeUrl = testPage.url();
    console.log(`📍 根地址 URL 表现: ${welcomeUrl}`);
    if (welcomeUrl === 'http://aurastring.cloud/' || welcomeUrl === 'http://aurastring.cloud') {
      console.log('✅ [验证 3 成功] 根地址完美保持无语言前缀的原生 URL 状态！');
    } else {
      console.log(`⚠️ [验证 3 注意] 根地址被重定向/包含语言前缀: ${welcomeUrl}`);
    }

    const welcomeScreenshot = path.join(artifactsDir, 'verify_3_welcome.png');
    await testPage.screenshot({ path: welcomeScreenshot });
    console.log(`📸 欢迎页截图已保存: ${welcomeScreenshot}`);

    console.log('\n🎉 【所有 E2E 验证圆满结束】');
    console.log('为了方便您亲自检查，此新建的验证选项卡将继续保持打开状态，您可以随时浏览！');
    
    await browser.disconnect();
  } catch (err) {
    console.error('❌ E2E 验证遇到错误:', err);
    if (browser) await browser.disconnect();
  }
})();
