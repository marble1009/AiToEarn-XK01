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

    const componentNames = await orcaPage.evaluate(() => {
      const el = document.querySelector('.terminal') || document.querySelector('.xterm');
      if (!el) return 'No terminal element';
      
      let fiberKey = null;
      let current = el;
      let fiber = null;
      while (current) {
        const keys = Object.keys(current);
        fiberKey = keys.find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
        if (fiberKey) {
          fiber = current[fiberKey];
          break;
        }
        current = current.parentElement;
      }

      if (!fiber) return 'No react fiber found';

      const names = [];
      const queue = [fiber];
      const visited = new Set();
      
      while (queue.length > 0) {
        const node = queue.shift();
        if (!node || visited.has(node)) continue;
        visited.add(node);
        
        let typeName = 'unknown';
        if (node.type) {
          if (typeof node.type === 'string') {
            typeName = node.type;
          } else if (typeof node.type === 'function') {
            typeName = node.type.name || 'AnonymousFunction';
          } else if (node.type.displayName) {
            typeName = node.type.displayName;
          } else if (node.type.$$typeof) {
            typeName = String(node.type.$$typeof);
          }
        }
        
        names.push({
          tag: node.tag,
          type: typeName,
          hasStateNode: !!node.stateNode,
          stateNodeProps: node.stateNode ? Object.keys(node.stateNode).filter(k => !k.startsWith('__react')) : []
        });

        if (node.child) queue.push(node.child);
        if (node.sibling) queue.push(node.sibling);
        if (node.return) queue.push(node.return);
      }
      
      return names;
    });

    console.log('React Component tree dump (first 40 nodes):');
    console.log(JSON.stringify(componentNames.slice(0, 40), null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
