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
    console.log(`Connected! Found ${pages.length} pages total.`);

    let terminalPage = null;

    // We will search all pages to find the one with an active shell terminal
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const url = p.url();
      const title = await p.title();
      
      if (url.includes('orcaterm') || url.includes('webshell') || url.includes('terminal')) {
        // Let's check if it has the xterm terminal element in its DOM
        const hasTerminal = await p.evaluate(() => {
          const el = document.querySelector('.xterm-rows') || 
                     document.querySelector('.xterm') ||
                     document.querySelector('.terminal') ||
                     document.querySelector('.xterm-helper-textarea');
          return !!el;
        });

        console.log(`[Page ${i}] URL: ${url} | Title: ${title} | Has Terminal DOM: ${hasTerminal}`);
        
        // Tab 2 has been identified visually as the logged-in shell tab, but checking hasTerminal is highly robust!
        if (hasTerminal && i === 2) {
          terminalPage = p;
          console.log(`🎯 Identified active terminal page at Tab ${i}!`);
        } else if (hasTerminal && !terminalPage) {
          terminalPage = p;
          console.log(`💡 fallback active terminal page at Tab ${i}`);
        }
      }
    }

    if (!terminalPage) {
      console.warn('⚠️ Could not find explicit terminal page, falling back to page index 2...');
      terminalPage = pages[2];
    }

    if (!terminalPage) {
      throw new Error('❌ No active page found at index 2 or elsewhere.');
    }

    console.log(`🎯 Using terminal tab: ${terminalPage.url()}`);
    await terminalPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus terminal DOM elements
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

    // Physical click inside the terminal window to focus it completely
    await terminalPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Interrupt any partial commands
    console.log('🛑 Sending Ctrl+C to clean the terminal prompt...');
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await terminalPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Change directory
    console.log('📂 Navigating to aitoearn directory...');
    await terminalPage.keyboard.type('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 1500));

    // Run docker compose up
    console.log('🐋 Starting Docker Compose containers...');
    await terminalPage.keyboard.type('sudo docker compose up -d\n', { delay: 40 });
    
    // We wait 30 seconds for all containers to pull, start, and initialize
    console.log('⏳ Waiting 30 seconds for container initialization...');
    await new Promise(r => setTimeout(r, 30000));

    // Verify container statuses
    console.log('📊 Verifying container status with docker compose ps...');
    await terminalPage.keyboard.type('sudo docker compose ps\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 5000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'scratch', 'up_completed_v2.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Progress screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('✨ Script completed successfully!');
  } catch (err) {
    console.error('❌ Error during Orca docker up execution:', err);
  }
})();
