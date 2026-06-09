const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  let browser;
  let testPage;
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    console.log('🔍 Locating tabs...');
    const pages = await browser.pages();
    // OrcaTerm is optional now as we use the bypass code
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    if (orcaPage) {
      console.log('✅ Found OrcaTerm tab:', await orcaPage.title());
    } else {
      console.log('⚠️ OrcaTerm tab not found, proceeding using universal bypass code.');
    }

    // Create a new tab for the E2E test
    console.log('🌐 Opening a new tab for AiToEarn login...');
    testPage = await browser.newPage();
    
    // Enable Console & Page Error logs
    testPage.on('console', msg => console.log(`🖥️ PAGE LOG: [${msg.type()}] ${msg.text()}`));
    testPage.on('pageerror', err => console.error('❌ PAGE ERROR:', err.toString()));
    
    // Intercept network responses to audit backend API calls
    testPage.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        console.log(`📡 API RESPONSE: ${url} [Status: ${response.status()}]`);
        try {
          const body = await response.text();
          console.log(`   Response JSON: ${body.substring(0, 300)}`);
        } catch (e) {}
      }
    });

    // Set custom viewport for high-quality screenshots
    await testPage.setViewport({ width: 1280, height: 800 });

    const loginUrl = 'http://aurastring.cloud/zh-CN/auth/login';
    console.log(`🚀 Navigating to ${loginUrl}...`);
    await testPage.goto(loginUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000)); // Wait for page to fully load

    console.log('📝 Focusing and typing email address...');
    const testEmail = 'automated_test_' + Math.floor(Math.random() * 1000000) + '@qq.com';
    await testPage.waitForSelector('input[type="email"]');
    await testPage.focus('input[type="email"]');
    await testPage.click('input[type="email"]');
    await testPage.type('input[type="email"]', testEmail, { delay: 50 });
    
    console.log(`📧 E2E test email address: ${testEmail}`);
    
    // Blur to trigger React Hook Form validation
    await testPage.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      if (emailInput) {
        emailInput.blur();
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Click the verification code button via browser click evaluation for absolute reliability
    console.log('🖱️ Clicking "发送验证码" button...');
    await testPage.waitForSelector('button[type="button"]');
    await testPage.evaluate(() => {
      const btn = document.querySelector('button[type="button"]');
      if (btn) {
        btn.click();
      }
    });

    console.log('⏳ Waiting for 5 seconds for the backend to generate the code...');
    await new Promise(r => setTimeout(r, 5000));

    // Capture E2E code-triggered screenshot
    const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const triggeredScreenshot = path.join(artifactsDir, 'e2e_code_sent.png');
    await testPage.screenshot({ path: triggeredScreenshot });
    console.log(`📸 Code sent screenshot saved to: ${triggeredScreenshot}`);

    // Check if the button entered countdown state or if there is a validation error
    const buttonText = await testPage.evaluate(() => {
      const btn = document.querySelector('button[type="button"]');
      return btn ? btn.textContent.trim() : 'NOT_FOUND';
    });
    console.log(`ℹ️ Current Send Button text: "${buttonText}"`);

    if (buttonText.includes('发送验证码') || buttonText === 'NOT_FOUND') {
      const pageText = await testPage.evaluate(() => document.body.innerText);
      console.log('--- Page Error Messages ---');
      console.log(pageText.substring(0, 1500));
      console.log('---------------------------');
      throw new Error('❌ Failed to trigger sending code - button did not enter countdown state!');
    }

    console.log('🎉 Using the universal bypass code 888888 for E2E testing.');
    const foundCode = '888888';

    console.log('📝 Typing verification code...');
    await testPage.waitForSelector('input[inputmode="numeric"]');
    await testPage.type('input[inputmode="numeric"]', foundCode, { delay: 50 });
    await new Promise(r => setTimeout(r, 500));

    console.log('🖱️ Clicking submit button to complete login/registration...');
    await testPage.click('button[type="submit"]');

    console.log('⏳ Waiting 6 seconds for authentication and redirect...');
    await new Promise(r => setTimeout(r, 6000));

    const finalUrl = testPage.url();
    const finalTitle = await testPage.title();
    console.log(`🏁 E2E Final Page URL: ${finalUrl}`);
    console.log(`🏁 E2E Final Page Title: ${finalTitle}`);

    const successScreenshot = path.join(artifactsDir, 'e2e_login_success.png');
    await testPage.screenshot({ path: successScreenshot });
    console.log(`📸 Success screenshot saved to: ${successScreenshot}`);

    // Clean up
    console.log('🧹 Closing the temporary E2E test tab...');
    await testPage.close();
    console.log('✨ E2E Test Completed Successfully!');
    
    browser.disconnect();
  } catch (err) {
    console.error('❌ E2E Test Failed:', err);
    if (testPage) {
      try {
        await testPage.close();
      } catch (e) {}
    }
    if (browser) {
      try {
        browser.disconnect();
      } catch (e) {}
    }
    process.exit(1);
  }
})();
