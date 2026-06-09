const puppeteer = require('puppeteer-core');

(async () => {
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let page = pages[0];
    if (!page) {
      page = await browser.newPage();
    }

    console.log('🌐 Directing to OrcaTerm...');
    await page.goto('https://orcaterm.cloud.tencent.com/terminal?type=lighthouse&instanceId=lhins-1ffo71cw&region=ap-shanghai&from=lh_console_login_btn', { waitUntil: 'domcontentloaded' });
    
    console.log('⏳ Waiting 10 seconds for login session or terminals to load...');
    await new Promise(r => setTimeout(r, 10000));

    await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch\\opened_orca_direct.png' });
    console.log('📸 Screenshot saved to scratch/opened_orca_direct.png');

    await browser.disconnect();
    console.log('✨ Done!');
  } catch (err) {
    console.error('❌ Error during opening OrcaTerm:', err);
  }
})();
