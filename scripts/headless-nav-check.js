const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleMessages = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  try {
    console.log('Opening http://localhost:3000/');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    const navOuterHTML = await page.evaluate(() => {
      const nav = document.querySelector('nav, [data-main-nav], header');
      if (!nav) return null;
      return nav.outerHTML;
    });

    const menuItemsCount = await page.evaluate(() => {
      // try common selectors used for nav menu items
      const selectors = ['nav a', 'nav li a', '[data-nav-item]', '.main-nav a', '.menu-item', 'header a'];
      for (const sel of selectors) {
        const nodes = document.querySelectorAll(sel);
        if (nodes && nodes.length) return nodes.length;
      }
      return 0;
    });

    console.log('--- FIRST LOAD ---');
    console.log('Menu items count:', menuItemsCount);
    console.log('Nav outer HTML present:', Boolean(navOuterHTML));

    // now reload and check again
    await page.reload({ waitUntil: 'networkidle' });
    const menuItemsCountAfter = await page.evaluate(() => {
      const selectors = ['nav a', 'nav li a', '[data-nav-item]', '.main-nav a', '.menu-item', 'header a'];
      for (const sel of selectors) {
        const nodes = document.querySelectorAll(sel);
        if (nodes && nodes.length) return nodes.length;
      }
      return 0;
    });

    console.log('--- AFTER RELOAD ---');
    console.log('Menu items count after reload:', menuItemsCountAfter);

    console.log('--- Console messages from page ---');
    consoleMessages.forEach(m => console.log(m.type, m.text));

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during headless check:', err);
    await browser.close();
    process.exit(2);
  }
})();