const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    console.log(`Connected. Found ${pages.length} pages.`);

    const targetPage = pages.find(p => p.url().includes('aurastring.cloud'));
    if (!targetPage) {
      console.log('No tab found with "aurastring.cloud" in URL.');
      await browser.disconnect();
      return;
    }

    const url = targetPage.url();
    const title = await targetPage.title();
    console.log(`\n=== Found Target Tab ===`);
    console.log(`URL: ${url}`);
    console.log(`Title: ${title}`);

    // Get DOM HTML body snippet or summary
    const domSummary = await targetPage.evaluate(() => {
      if (!document.body) return 'No body element';
      return {
        htmlLength: document.body.innerHTML.length,
        textSnippet: document.body.innerText.substring(0, 1500),
        firstElementTags: Array.from(document.body.children).map(el => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          text: el.innerText ? el.innerText.substring(0, 100) : ''
        }))
      };
    });

    console.log('DOM Summary:', JSON.stringify(domSummary, null, 2));

    // Let's capture the console log history if possible (we can't get past logs retroactively via Puppeteer's 'console' event, but we can check window errors or trigger a fresh reload to see exceptions).
    // Let's look for standard React crash root or window error properties.
    const windowErrors = await targetPage.evaluate(() => {
      return {
        __next_loaded: typeof window !== 'undefined' && !!window.__NEXT_DATA__,
        reactErrors: window.__react_errors || [],
        href: window.location.href
      };
    });
    console.log('Window Error Flags:', JSON.stringify(windowErrors, null, 2));

    // Save a screenshot!
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'aurastring_live_screenshot.png');
    await targetPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Get complete body innerHTML for in-depth debugging
    const fullHtml = await targetPage.evaluate(() => document.documentElement.outerHTML);
    const htmlPath = path.join(artifactDir, 'aurastring_live_dom.html');
    fs.writeFileSync(htmlPath, fullHtml, 'utf8');
    console.log(`Complete DOM HTML saved to: ${htmlPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error in inspect script:', err);
  }
})();
