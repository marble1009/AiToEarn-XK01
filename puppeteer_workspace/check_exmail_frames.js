const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('exmail') || p.url().includes('work.weixin'));
    if (!page) {
      console.error('❌ Exmail page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔗 Connected to page: ${page.url()}`);
    
    const frames = page.frames();
    console.log(`Found ${frames.length} frames.`);
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      console.log(`\nFrame [${i}] name: "${frame.name()}" URL: ${frame.url()}`);
      try {
        const text = await frame.evaluate(() => document.body.innerText);
        console.log(`  Inner text snippet (first 300 chars):`);
        console.log(text.substring(0, 300).replace(/\n+/g, ' '));
        
        // Find links
        const links = await frame.evaluate(() => {
          return Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.innerText.trim(),
            href: a.getAttribute('href'),
            id: a.id
          })).filter(l => l.text);
        });
        console.log(`  Links in frame:`, links);
      } catch (err) {
        console.log(`  Failed to evaluate inside frame: ${err.message}`);
      }
    }

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
