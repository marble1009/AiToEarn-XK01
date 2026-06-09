const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!orcaPage) {
      console.error('OrcaTerm page not found');
      await browser.disconnect();
      return;
    }
    
    console.log('Page found. Searching for exact 立即刷新 button...');
    const result = await orcaPage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, div, span, a'));
      // Find element whose text is exactly "立即刷新"
      let refreshBtn = elements.find(el => el.textContent.trim() === '立即刷新');
      if (refreshBtn) {
        refreshBtn.click();
        return { success: true, tag: refreshBtn.tagName, text: refreshBtn.textContent, method: 'exact' };
      }
      
      // Fallback: look for button or div containing "立即刷新" but is not the outer container
      const candidates = elements.filter(el => (el.tagName === 'BUTTON' || el.tagName === 'DIV' || el.tagName === 'SPAN') && el.textContent.includes('立即刷新'));
      // Sort by text length ascending to get the deepest element
      candidates.sort((a, b) => a.textContent.length - b.textContent.length);
      if (candidates.length > 0) {
        candidates[0].click();
        return { success: true, tag: candidates[0].tagName, text: candidates[0].textContent, method: 'deepest_contains' };
      }
      
      return { success: false };
    });
    
    console.log('Result:', result);
    if (result.success) {
      console.log('Waiting 12 seconds for reload...');
      await new Promise(r => setTimeout(r, 12000));
      const spath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\after_click_refresh.png';
      await orcaPage.screenshot({ path: spath });
      console.log('Screenshot saved to:', spath);
    }
    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
