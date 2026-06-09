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

    const reactProps = await orcaPage.evaluate(() => {
      const el = document.querySelector('.terminal') || document.querySelector('.xterm');
      if (!el) return 'No terminal element';
      
      // Let's traverse up to find react instance
      let current = el;
      while (current) {
        const keys = Object.keys(current);
        const reactKey = keys.find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
        if (reactKey) {
          const fiber = current[reactKey];
          // Let's extract some interesting parts of the fiber
          return {
            found: true,
            key: reactKey,
            type: fiber.type ? String(fiber.type) : 'unknown',
            // Traverse stateNode or memoizedProps to find the terminal instance
            memoizedPropsKeys: fiber.memoizedProps ? Object.keys(fiber.memoizedProps) : [],
            stateNodeKeys: fiber.stateNode ? Object.keys(fiber.stateNode) : [],
            parentKeys: fiber.return ? Object.keys(fiber.return) : []
          };
        }
        current = current.parentElement;
      }
      return 'No react fiber found';
    });

    console.log('React Props:', JSON.stringify(reactProps, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
