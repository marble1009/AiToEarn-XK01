const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Fetching claude-code-router log files inside Docker...');
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));

    if (!orcaPage) {
      console.error('❌ OrcaTerm terminal tab not found!');
      await browser.disconnect();
      return;
    }

    console.log('🔌 Connected! Focusing terminal...');
    await orcaPage.bringToFront();
    await orcaPage.evaluate(() => {
      const el = document.querySelector('textarea') || 
                 document.querySelector('.xterm-helper-textarea') || 
                 document.querySelector('.xterm') ||
                 document.querySelector('.terminal');
      if (el) el.focus();
    });
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 1000));

    // Clear current prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('c');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));

    // Fetch the list of files in .claude-session
    const findCmd = "sudo docker exec -it aitoearn-ai find /app/.claude-session -type f";
    console.log(`⌨️ Typing: ${findCmd}`);
    await orcaPage.keyboard.type(findCmd, { delay: 10 });
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3000));

    // Read the claude-code-router.log
    const catCmd = "sudo docker exec -it aitoearn-ai tail -n 80 /app/.claude-session/.claude-code-router/claude-code-router.log";
    console.log(`⌨️ Typing: ${catCmd}`);
    await orcaPage.keyboard.type(catCmd, { delay: 10 });
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 4000));

    // Take screenshot of terminal output
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const diagPath = path.join(artifactDir, 'cloud_ccr_logs.png');
    await orcaPage.screenshot({ path: diagPath });
    console.log(`📸 Diagnostics screenshot saved to: ${diagPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during ccr logs diagnostics:', err);
  }
})();
