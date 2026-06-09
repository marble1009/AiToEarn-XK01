const puppeteer = require('puppeteer-core');

(async () => {
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const terminalPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('terminal'));

    if (!terminalPage) {
      throw new Error('❌ Active terminal tab not found!');
    }

    console.log(`🎯 Found terminal: ${terminalPage.url()}`);
    await terminalPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Force focus
    await terminalPage.evaluate(() => {
      const ta = document.querySelector('textarea') || document.querySelector('.xterm-helper-textarea');
      if (ta) {
        ta.focus();
        ta.click();
      }
    });

    // Absolute fallback: mouse click to focus
    await terminalPage.mouse.click(500, 400);
    await new Promise(r => setTimeout(r, 500));

    // Ctrl+C to clear prompt
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await terminalPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Send command
    console.log('⌨️ Typing Nginx restart command...');
    const cmd = 'cd ~/aitoearn && sudo docker compose restart nginx\n';
    await terminalPage.keyboard.type(cmd, { delay: 40 });

    console.log('⏳ Waiting 12 seconds for Nginx to complete restart...');
    await new Promise(r => setTimeout(r, 12000));

    await terminalPage.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\robust_nginx_restarted.png' });
    console.log('📸 Screenshot saved: scratch/robust_nginx_restarted.png');

    await browser.disconnect();
    console.log('✨ Done!');
  } catch (err) {
    console.error('❌ Error during robust command execution:', err);
  }
})();
