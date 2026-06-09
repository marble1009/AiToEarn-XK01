const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('Connected to Chrome. Creating a temporary tab...');

    // Open a completely new, temporary tab so we don't disturb the user's existing pages!
    const page = await browser.newPage();
    console.log('Temporary tab created. Navigating to local dev server http://localhost:6060/login to trigger the SSR crash...');

    // Navigate to local dev server to trigger the SSR crash!
    // Since Next.js will compile the page on demand, let's wait up to 25 seconds.
    await page.goto('http://localhost:6060/login', { waitUntil: 'networkidle0', timeout: 25000 }).catch(err => {
      console.log('Navigation finished or timed out. SSR request has been dispatched:', err.message);
    });

    console.log('Waiting 5 seconds to let SSR render and any async compilation settle...');
    await new Promise(r => setTimeout(r, 5000));

    // Close the temporary tab safely!
    await page.close();
    console.log('Safely closed the temporary tab. Disconnecting...');
    
    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during local SSR trigger:', err);
  }
})();
