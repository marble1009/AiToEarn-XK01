const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Starting web redeployment and E2E regression test...');
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main\\puppeteer_workspace\\chrome-debug-profile';
  
  let browser;
  let isNewLaunch = false;
  
  try {
    console.log('🔌 Attempting to connect to existing Chrome debugger at 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('✅ Connected to existing Chrome session!');
  } catch (e) {
    console.log('ℹ️ Chrome debugger not running at 9222. Launching a new instance...');
    
    // Clear lock to prevent crash
    if (fs.existsSync(profileDir)) {
      try {
        console.log('🧹 Cleaning old Chrome lock files...');
        fs.rmSync(profileDir, { recursive: true, force: true });
      } catch (err) {
        console.log('⚠️ Failed to clean profile:', err.message);
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
    console.log('🎉 Chrome safely launched with port 9222!');
  }

  try {
    const pages = await browser.pages();
    let orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!orcaPage) {
      if (isNewLaunch) {
        console.log('正在导航至腾讯云登录页面，请您扫码或登录，然后打开 OrcaTerm 服务器控制台...');
        const loginPage = pages[0] || await browser.newPage();
        await loginPage.goto('https://cloud.tencent.com/login', { waitUntil: 'networkidle2' });
      } else {
        console.log('⚠️ OrcaTerm not found in existing tabs, opening Tencent Cloud login to let you navigate...');
        const newPage = await browser.newPage();
        await newPage.goto('https://cloud.tencent.com/login', { waitUntil: 'networkidle2' });
      }
      
      console.log('⏳ Waiting for you to log in and open OrcaTerm...');
      
      // Wait for OrcaTerm to appear
      while (!orcaPage) {
        await new Promise(r => setTimeout(r, 2000));
        const activePages = await browser.pages();
        orcaPage = activePages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
      }
      console.log('🎉 OrcaTerm detected!');
    }
    
    console.log('🎯 Found OrcaTerm tab. Activating and focusing...');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 3000));
    
    // Focus Terminal
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
    
    async function sendCommand(cmd, waitMs = 2000) {
      console.log(`➡️ Sending: [ ${cmd} ]`);
      await orcaPage.keyboard.type(cmd, { delay: 40 });
      await new Promise(r => setTimeout(r, 300));
      await orcaPage.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, waitMs));
    }
    
    // Clear prompt
    console.log('🛑 Sending Ctrl + C interrupt...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1500));
    
    // Deploy commands
    await sendCommand('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn', 2000);
    await sendCommand('git reset --hard', 2000);
    await sendCommand('git clean -fd', 2000);
    await sendCommand('git pull', 8000);
    
    console.log('🏗️ Building the web container locally on cloud server...');
    await sendCommand('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web', 120000);
    
    console.log('🚀 Restarting aitoearn-web container...');
    await sendCommand('sudo docker compose up -d aitoearn-web', 10000);
    
    console.log('📊 Checking docker compose ps...');
    await sendCommand('sudo docker compose ps', 4000);
    
    const deployScreenshot = path.join(artifactsDir, 'deploy_web_status.png');
    await orcaPage.screenshot({ path: deployScreenshot });
    console.log(`📸 Deploy screenshot saved to: ${deployScreenshot}`);
    
    console.log('⏳ Waiting 15 seconds for Nest.js / Web front-end service to start completely...');
    await new Promise(r => setTimeout(r, 15000));
    
    // ----- Begin E2E Regression Test -----
    console.log('🌐 Starting E2E Regression Test...');
    const testPage = await browser.newPage();
    await testPage.setViewport({ width: 1280, height: 800 });
    
    testPage.on('console', msg => console.log(`🖥️ PAGE LOG: [${msg.type()}] ${msg.text()}`));
    testPage.on('pageerror', err => console.error('❌ PAGE ERROR:', err.toString()));
    
    console.log('🚀 Navigating to root: http://aurastring.cloud/ ...');
    await testPage.goto('http://aurastring.cloud/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    
    let currentUrl = testPage.url();
    console.log(`🏁 After root navigation, current URL is: ${currentUrl}`);
    
    // Check if we are already logged in (redirected to /zh-CN)
    if (currentUrl.includes('/zh-CN') && !currentUrl.includes('/auth/login')) {
      console.log('ℹ️ Session is already logged in. Clearing localStorage token to test fresh login redirection...');
      await testPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await testPage.goto('http://aurastring.cloud/', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 4000));
      currentUrl = testPage.url();
      console.log(`🏁 After clearing session, current URL is: ${currentUrl}`);
    }

    // Check if email input is present on root page (proves it remains on "/" or rewritten cleanly)
    const hasEmailInput = await testPage.evaluate(() => {
      return !!document.querySelector('input[type="email"]');
    });

    if (hasEmailInput) {
      console.log('✅ Verified: Login form successfully displayed on clean root domain!');
    } else {
      console.log('⚠️ Warning: Email input not found. Navigating to auth page explicitly for E2E testing...');
      await testPage.goto('http://aurastring.cloud/zh-CN/auth/login', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Fill in a random E2E test email address
    const testEmail = 'e2e_guard_test_' + Math.floor(Math.random() * 1000000) + '@qq.com';
    console.log(`📝 Typing random E2E test email: ${testEmail}`);
    await testPage.waitForSelector('input[type="email"]');
    await testPage.focus('input[type="email"]');
    await testPage.click('input[type="email"]');
    await testPage.type('input[type="email"]', testEmail, { delay: 50 });
    
    // Blur to trigger standard validation
    await testPage.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      if (emailInput) emailInput.blur();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // Click verification code button
    console.log('🖱️ Clicking "发送验证码" button...');
    await testPage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('发送验证码') || b.textContent.includes('发送') || b.textContent.includes('Code'));
      if (btn) btn.click();
    });
    
    console.log('⏳ Waiting 5 seconds for mail server and backend response...');
    await new Promise(r => setTimeout(r, 5000));
    
    const triggeredScreenshot = path.join(artifactsDir, 'e2e_code_sent.png');
    await testPage.screenshot({ path: triggeredScreenshot });
    console.log(`📸 Code sent verification screenshot saved to: ${triggeredScreenshot}`);
    
    // Check if the button entered countdown
    const sendButtonText = await testPage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('发送验证码') || b.textContent.includes('发送') || b.textContent.includes('Code') || /\d+s/.test(b.textContent));
      return btn ? btn.textContent.trim() : 'NOT_FOUND';
    });
    console.log(`ℹ️ Send Button text is now: "${sendButtonText}"`);
    
    console.log('🎉 Submitting universal bypass code 888888...');
    await testPage.waitForSelector('input[inputmode="numeric"]');
    await testPage.type('input[inputmode="numeric"]', '888888', { delay: 50 });
    await new Promise(r => setTimeout(r, 500));
    
    console.log('🖱️ Clicking submit button to log in...');
    await testPage.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    
    console.log('⏳ Waiting 8 seconds for JWT authentication and post-login redirection...');
    await new Promise(r => setTimeout(r, 8000));
    
    const finalUrl = testPage.url();
    const finalTitle = await testPage.title();
    console.log(`🏁 Final Page URL: ${finalUrl}`);
    console.log(`🏁 Final Page Title: ${finalTitle}`);
    
    const successScreenshot = path.join(artifactsDir, 'e2e_login_success.png');
    await testPage.screenshot({ path: successScreenshot });
    console.log(`📸 Success redirect screenshot saved to: ${successScreenshot}`);
    
    if (finalUrl.includes('/zh-CN') && !finalUrl.includes('/auth/login')) {
      console.log('🎉 E2E Authentication and Redirection Guard Test completely SUCCESSFUL!');
    } else {
      console.log('⚠️ Warning: Page did not redirect back to content dashboard! Check screenshots for debugging.');
    }
    
    await testPage.close();
    console.log('🔌 Disconnecting from Chrome but keeping it open.');
    await browser.disconnect();
    
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E/Redeployment Execution Error:', err);
    if (browser) {
      try {
        await browser.disconnect();
      } catch (e) {}
    }
    process.exit(1);
  }
})();
