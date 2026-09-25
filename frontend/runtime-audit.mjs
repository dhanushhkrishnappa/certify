import puppeteer from 'puppeteer-core';

const routes = [
  '/landing',
  '/auth',
  '/catalog',
  '/course-details',
  '/mylearning',
  '/dashboard',
  '/studio',
  '/diagnostic',
  '/chapter-assessment',
  '/remediation',
  '/final-assessment',
  '/viva',
  '/result',
  '/credentials',
  '/credential-details',
  '/verify',
  '/progress',
  '/profile',
  '/settings',
];

async function runRuntimeAudit() {
  console.log('🔍 Starting comprehensive runtime audit across all routes...\n');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024 });

  const auditReport = [];

  for (const route of routes) {
    const routeErrors = [];
    const routeWarnings = [];
    const failedRequests = [];

    const consoleHandler = (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        routeErrors.push(text);
      } else if (type === 'warning') {
        routeWarnings.push(text);
      }
    };

    const pageErrorHandler = (err) => {
      routeErrors.push(err.toString());
    };

    const reqFailedHandler = (req) => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText || 'failed'}`);
    };

    page.on('console', consoleHandler);
    page.on('pageerror', pageErrorHandler);
    page.on('requestfailed', reqFailedHandler);

    try {
      const targetUrl = `http://localhost:5173${route}`;
      const response = await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1000));

      const title = await page.title();
      const status = response ? response.status() : 'no-response';

      auditReport.push({
        route,
        status,
        title,
        errors: [...routeErrors],
        warnings: [...routeWarnings],
        failedRequests: [...failedRequests],
      });

      console.log(`Route: ${route.padEnd(22)} | HTTP ${status} | Errors: ${routeErrors.length} | Warnings: ${routeWarnings.length} | Failed Requests: ${failedRequests.length}`);
      if (routeErrors.length > 0) {
        console.log(`   🚨 Errors:`, routeErrors);
      }
      if (failedRequests.length > 0) {
        console.log(`   ⚠️ Failed Requests:`, failedRequests);
      }
    } catch (err) {
      auditReport.push({
        route,
        status: 'EXCEPTION',
        title: 'Crash',
        errors: [err.toString()],
        warnings: [],
        failedRequests: [],
      });
      console.log(`Route: ${route.padEnd(22)} | ❌ EXCEPTION: ${err.message}`);
    } finally {
      page.off('console', consoleHandler);
      page.off('pageerror', pageErrorHandler);
      page.off('requestfailed', reqFailedHandler);
    }
  }

  await browser.close();
  console.log('\n✅ Runtime audit complete for all 19 routes.');
  return auditReport;
}

runRuntimeAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
