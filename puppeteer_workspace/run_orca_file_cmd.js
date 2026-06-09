const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const cmdFilePath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\temp_vps_cmd.sh';
    if (!fs.existsSync(cmdFilePath)) {
      console.error('Command file not found:', cmdFilePath);
      return;
    }
    const command = fs.readFileSync(cmdFilePath, 'utf8');
    const waitMs = parseInt(process.argv[2], 10) || 5000;
    const screenshotName = process.argv[3] || 'file_output';

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

    console.log(`🔌 Connected to OrcaTerm!`);
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

    // Type the actual command from the file
    console.log(`➡️ Executing command from file...`);
    await orcaPage.keyboard.type(command, { delay: 15 });
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');

    console.log(`⏳ Waiting ${waitMs}ms for command output...`);
    await new Promise(resolve => setTimeout(resolve, waitMs));

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\${screenshotName}.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
