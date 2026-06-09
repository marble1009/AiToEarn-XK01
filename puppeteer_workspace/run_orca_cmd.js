const puppeteer = require('puppeteer-core');
const path = require('path');

const command = process.argv[2] || 'ls -la';
const waitMs = parseInt(process.argv[3], 10) || 3000;
const screenshotName = process.argv[4] || 'output';

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!orcaPage) {
      console.error('❌ OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to OrcaTerm! Page Title: ${await orcaPage.title()}`);
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus using evaluate
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

    // Also physical click at 400, 300
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Interrupt any active command
    console.log('🛑 Sending Control+C to clear prompt...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Type the actual command
    console.log(`➡️ Executing command: [ ${command} ]`);
    await orcaPage.keyboard.type(command, { delay: 40 });
    await new Promise(r => setTimeout(r, 300));
    await orcaPage.keyboard.press('Enter');

    console.log(`⏳ Waiting ${waitMs}ms for command output...`);
    await new Promise(resolve => setTimeout(resolve, waitMs));

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch\\${screenshotName}.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
