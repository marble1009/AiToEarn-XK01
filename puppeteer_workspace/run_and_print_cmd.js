const puppeteer = require('puppeteer-core');

const command = process.argv[2] || 'ls -la ~/aitoearn';
const waitMs = parseInt(process.argv[3], 10) || 3000;

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

    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 500));

    // Focus
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
    await new Promise(r => setTimeout(r, 200));

    // Interrupt any active command
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 200));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));

    // Type the actual command
    await orcaPage.keyboard.type(command, { delay: 10 });
    await new Promise(r => setTimeout(r, 200));
    await orcaPage.keyboard.press('Enter');

    await new Promise(resolve => setTimeout(resolve, waitMs));

    // Extract terminal text using the best method
    const textLines = await orcaPage.evaluate(() => {
      const rows = document.querySelectorAll('.xterm-rows div');
      if (rows && rows.length > 0) {
        return Array.from(rows).map(row => row.innerText);
      }
      return ['No xterm-rows div elements found'];
    });

    console.log('--- Terminal Output ---');
    console.log(textLines.join('\n'));
    console.log('-----------------------');

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
