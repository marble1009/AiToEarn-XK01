const puppeteer = require('puppeteer-core');

(async () => {
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    const pages = await browser.pages();
    let orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    if (!orcaPage) {
      console.error('❌ OrcaTerm tab not found.');
      await browser.disconnect();
      return;
    }
    
    console.log('🎯 Bringing OrcaTerm tab to front...');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));
    
    // 聚焦终端
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
    
    console.log('🛑 Sending Ctrl + C to interrupt...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.type('\n');
    await new Promise(r => setTimeout(r, 1500));
    
    console.log('📂 Typing cd command like human...');
    await orcaPage.keyboard.type('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn\n', { delay: 50 });
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('🏗️ Typing docker build command...');
    await orcaPage.keyboard.type('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web\n', { delay: 50 });
    
    await browser.disconnect();
    console.log('✨ Typed successfully!');
  } catch (err) {
    console.error('❌ Failed to type:', err);
  }
})();
