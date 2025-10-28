// Headless Playwright check for instructor lesson edit page
// Usage: node scripts/headless-lesson-check.js http://localhost:3001/instructor/courses/edit/<courseId>/lessons/<lessonId>

const playwright = require('playwright');
const fs = require('fs');

(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/headless-lesson-check.js <url>');
    process.exit(2);
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
    page.on('console', msg => logs.push({ type: 'console', text: msg.text() }));
    page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));

    // Capture full responses for network requests
    page.on('response', async (res) => {
      try {
        const url = res.url();
        const status = res.status();
        let body = null;
        try {
          // Try text first, fall back silently for binary
          body = await res.text();
        } catch (e) {
          body = `<non-text response: ${e.message}>`;
        }
        logs.push({ type: 'response', url, status, body });
      } catch (e) {
        // ignore
      }
    });

    page.on('requestfailed', async (req) => {
      const failure = req.failure();
      // Try to get any response attached to the request
      let respBody = null;
      try {
        const resp = await req.response();
        if (resp) {
          try { respBody = await resp.text(); } catch (e) { respBody = `<non-text response: ${e.message}>`; }
        }
      } catch (e) {
        // ignore
      }
      logs.push({ type: 'requestfailed', url: req.url(), failure, responseBody: respBody });
    });

  try {
    // If credentials provided, sign in first via the login page to create a valid session cookie
    const testEmail = process.env.SUPABASE_TEST_EMAIL;
    const testPassword = process.env.SUPABASE_TEST_PASSWORD;
    if (testEmail && testPassword) {
      console.log('Attempting automatic sign-in with provided env credentials');
      const loginUrl = new URL('/login', url).toString();
      await page.goto(loginUrl, { waitUntil: 'networkidle' });
      // Fill email/password fields and submit form
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('button[type="submit"]'),
      ]);
      console.log('Sign-in navigation completed, now navigating to target page');
    }

    console.log('Navigating to', url);
    const resp = await page.goto(url, { waitUntil: 'networkidle' });
    if (resp) {
      try {
        console.log('HTTP status:', resp.status());
      } catch (e) {
        console.log('Could not read response status:', e.message);
      }
    } else {
      console.log('No response object returned from page.goto');
    }

    // Wait extra for dynamic content
    await page.waitForTimeout(1500);

    // Capture screenshot
    const screenshotPath = 'tmp/headless-lesson-check.png';
    fs.mkdirSync('tmp', { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Saved screenshot to', screenshotPath);

    // Dump logs
    const logPath = 'tmp/headless-lesson-check-logs.json';
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    console.log('Saved logs to', logPath);

    // Check if the page contains 'Loading Lesson' placeholder
    const loading = await page.$('text=Loading Lesson');
    if (loading) {
      console.log('Page shows Loading Lesson placeholder');
    } else {
      console.log('Page did not show Loading Lesson placeholder');
    }

    // Extract H1 or heading text
    const heading = await page.$eval('h1, h2, h3', el => el.textContent).catch(() => null);
    console.log('Heading on page:', heading);

  } catch (err) {
    console.error('Headless check failed:', err);
  } finally {
    await browser.close();
  }
})();
