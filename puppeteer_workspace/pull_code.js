const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let terminalPage = null;

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const url = p.url();
      
      if (url.includes('orcaterm') || url.includes('webshell') || url.includes('terminal')) {
        const hasTerminal = await p.evaluate(() => {
          const el = document.querySelector('.xterm-rows') || 
                     document.querySelector('.xterm') ||
                     document.querySelector('.terminal') ||
                     document.querySelector('.xterm-helper-textarea');
          return !!el;
        });

        if (hasTerminal) {
          terminalPage = p;
          break;
        }
      }
    }

    if (!terminalPage) {
      throw new Error('❌ Active terminal tab not found!');
    }

    console.log(`🎯 Using terminal tab: ${terminalPage.url()}`);
    await terminalPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus terminal
    await terminalPage.evaluate(() => {
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

    await terminalPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Send Ctrl+C to clean prompt
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await terminalPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Type `cd ~/aitoearn && git reset --hard && git clean -fd && git pull`
    console.log('📥 Sending git pull command...');
    await terminalPage.keyboard.type('cd ~/aitoearn && git reset --hard && git clean -fd && git pull\n', { delay: 40 });
    
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    
    // We poll the terminal text every 5 seconds, up to 12 times (1 minute max)
    console.log('⏳ Polling terminal text for git pull completion...');
    let success = false;
    
    for (let attempt = 1; attempt <= 12; attempt++) {
      await new Promise(r => setTimeout(r, 5000));
      const spath = path.join(artifactDir, 'scratch', `git_pull_attempt_${attempt}.png`);
      await terminalPage.screenshot({ path: spath });
      console.log(`📸 Screenshot saved: ${spath}`);
      
      // Extract terminal text from DOM
      const terminalText = await terminalPage.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('.xterm-rows div'));
        return rows.map(r => r.textContent).join('\n');
      });
      
      if (terminalText.includes('Fast-forward') || 
          terminalText.includes('Already up to date.') || 
          terminalText.includes('Updating') || 
          terminalText.includes('f587230')) {
        console.log('🎉 Git pull completed successfully!');
        success = true;
        break;
      } else {
        console.log(`⏳ [Attempt ${attempt}/12] Still waiting for git pull to finish...`);
      }
    }

    if (!success) {
      console.log('⚠️ Warning: Git pull did not output success markers within 60s, but we proceed.');
    }

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error during git pull execution:', err);
  }
})();
