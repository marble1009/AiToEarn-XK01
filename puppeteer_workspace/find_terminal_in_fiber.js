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

    const terminalInstance = await orcaPage.evaluate(() => {
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

      if (!fiber) return 'No react fiber found in hierarchy';
      
      // BFS search in fiber tree
      const visited = new Set();
      const queue = [fiber];
      
      while (queue.length > 0) {
        const node = queue.shift();
        if (!node || visited.has(node)) continue;
        visited.add(node);
        
        if (node.stateNode) {
          const sn = node.stateNode;
          if (sn.terminal || sn._xterm || sn.xterm || sn.addon || sn.write) {
            return { foundIn: 'stateNode', keys: Object.keys(sn) };
          }
          for (const k in sn) {
            try {
              if (sn[k] && (sn[k].terminal || sn[k]._xterm || sn[k].xterm || sn[k].write)) {
                return { foundIn: `stateNode.${k}`, keys: Object.keys(sn[k]) };
              }
            } catch (e) {}
          }
        }
        
        if (node.memoizedProps) {
          const mp = node.memoizedProps;
          for (const k in mp) {
            try {
              if (mp[k] && (mp[k].terminal || mp[k]._xterm || mp[k].xterm || mp[k].write)) {
                return { foundIn: `memoizedProps.${k}`, keys: Object.keys(mp[k]) };
              }
            } catch (e) {}
          }
        }

        if (node.memoizedState) {
          let state = node.memoizedState;
          while (state) {
            if (state.memoizedState && (state.memoizedState.terminal || state.memoizedState._xterm || state.memoizedState.xterm || state.memoizedState.write)) {
              return { foundIn: 'memoizedState', keys: Object.keys(state.memoizedState) };
            }
            if (state.memoizedState && typeof state.memoizedState === 'object') {
              for (const k in state.memoizedState) {
                try {
                  const val = state.memoizedState[k];
                  if (val && (val.terminal || val._xterm || val.xterm || val.write)) {
                    return { foundIn: `memoizedState.${k}`, keys: Object.keys(val) };
                  }
                } catch (e) {}
              }
            }
            state = state.next;
          }
        }
        
        if (node.child) queue.push(node.child);
        if (node.sibling) queue.push(node.sibling);
        if (node.return) queue.push(node.return);
      }
      
      return 'Terminal instance not found in fiber tree';
    });

    console.log('Terminal Instance Search:', JSON.stringify(terminalInstance, null, 2));

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
