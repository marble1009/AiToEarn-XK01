const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    console.log('Connected to Chrome!');
    
    const pages = await browser.pages();
    let targetPage = pages.find(p => p.url().includes('aurastring.cloud'));
    if (!targetPage) {
      console.log('Creating new tab for aurastring.cloud/login...');
      targetPage = await browser.newPage();
    } else {
      console.log('Reusing existing tab:', targetPage.url());
    }
    
    await targetPage.setViewport({ width: 1280, height: 800 });
    
    // Capture page console logs
    const consoleLogs = [];
    const pageErrors = [];
    
    targetPage.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`[PAGE CONSOLE] [${msg.type()}] ${msg.text()}`);
    });
    
    targetPage.on('pageerror', err => {
      pageErrors.push(err.toString());
      console.error(`[PAGE EXCEPTION]`, err.toString());
    });
    
    console.log('Navigating to http://aurastring.cloud/login...');
    await targetPage.goto('http://aurastring.cloud/login', { waitUntil: 'networkidle2', timeout: 15000 }).catch(err => {
      console.log('Navigation navigation timed out or encountered error, continuing:', err.message);
    });
    
    console.log('Waiting 5s for React hydration...');
    await new Promise(r => setTimeout(r, 5000));
    
    const url = targetPage.url();
    const title = await targetPage.title();
    console.log(`Current URL: ${url}`);
    console.log(`Page Title: ${title}`);
    
    // Check DOM Elements
    const bodyHtml = await targetPage.evaluate(() => document.body.innerHTML);
    const bodyText = await targetPage.evaluate(() => document.body.innerText);
    const inputElements = await targetPage.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, button, select, textarea'));
      return inputs.map(el => ({
        tagName: el.tagName,
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || '',
        id: el.id,
        className: el.className,
        text: el.innerText || el.value || '',
        placeholder: el.getAttribute('placeholder') || ''
      }));
    });
    
    console.log('=== Input elements on page ===');
    console.log(JSON.stringify(inputElements, null, 2));
    console.log('=== Body Text ===');
    console.log(bodyText.substring(0, 1000));
    
    const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\direct_login_check.png';
    await targetPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    await browser.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error during direct login check:', err);
  }
})();
