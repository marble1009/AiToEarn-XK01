const puppeteer = require('puppeteer-core');

const command = process.argv[2] || 'ls -la';
const waitMs = parseInt(process.argv[3], 10) || 2000;
const screenshotName = process.argv[4] || 'output';

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    
    if (!orcaPage) {
      console.error('OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`Focusing terminal and executing command: ${command}`);
    await orcaPage.click('.xterm-helper-textarea');
    
    // Send backspaces to clear any half-typed commands, then send our command
    // We send a few Ctrl+C and newlines to make sure we're at a clean prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await orcaPage.keyboard.type('\n');
    
    await orcaPage.keyboard.type(command + '\n');

    console.log(`Waiting ${waitMs}ms for command to complete...`);
    await new Promise(resolve => setTimeout(resolve, waitMs));

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\${screenshotName}.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
