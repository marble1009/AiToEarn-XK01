const puppeteer = require('puppeteer-core');

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

    console.log('Focusing terminal...');
    // Click somewhere inside the xterm container to ensure focus
    await orcaPage.click('.xterm-helper-textarea');
    
    console.log('Typing command...');
    // We send a newline first to clear any half-typed commands, then our command
    await orcaPage.keyboard.type('\nls -la\n');

    console.log('Waiting for command to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\orcaterm_after.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Try to extract terminal text
    const textLines = await orcaPage.evaluate(() => {
      const rows = document.querySelectorAll('.xterm-rows div');
      return Array.from(rows).map(row => row.innerText);
    });
    console.log('--- Terminal Rows ---');
    console.log(textLines.join('\n'));
    console.log('---------------------');

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
