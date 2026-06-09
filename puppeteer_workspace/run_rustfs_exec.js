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
      console.error('❌ OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to OrcaTerm!`);
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

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

    // Clear prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Execute direct write command
    const cmd = 'sudo docker exec aitoearn-rustfs sh -c "echo \'hello_world_123\' > /data/aitoearn/test_hello.txt"';
    console.log(`➡️ Sending command...`);
    await orcaPage.keyboard.type(cmd, { delay: 10 });
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');

    console.log(`⏳ Waiting 4 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 4000));

    await browser.disconnect();
    console.log('🎉 Executed rustfs exec command.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
