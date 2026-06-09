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

    const textContent = await orcaPage.evaluate(() => {
      const el = document.querySelector('.terminal');
      if (!el) return 'No .terminal element';
      
      // Let's inspect properties of el
      const props = [];
      for (const k in el) {
        if (k.toLowerCase().includes('term') || k.startsWith('_')) {
          props.push(k);
        }
      }
      
      // Check if there is an xterm instance
      const xterm = el.terminal || el._xterm || el._xtermTerminal;
      if (xterm) {
        // If xterm instance exists, we can try to get the buffer text
        const lines = [];
        const buffer = xterm.buffer.active;
        for (let i = 0; i < buffer.length; i++) {
          const line = buffer.getLine(i);
          if (line) {
            lines.push(line.translateToString(true));
          }
        }
        return { success: true, props, text: lines.join('\n') };
      }
      
      // Check global window objects
      const winKeys = [];
      for (const k in window) {
        if (k.toLowerCase().includes('term') || k.toLowerCase().includes('xterm')) {
          winKeys.push(k);
        }
      }
      
      return { success: false, props, winKeys };
    });

    console.log('Result:', JSON.stringify(textContent, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
