import puppeteer from 'puppeteer-core';

async function verifyAndScreenshot() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000)); // wait for session and SVG paint

  // Verify Fidelity Metrics in Headless Chrome
  const metrics = await page.evaluate(() => {
    const getRadius = (sel) => {
      const el = document.querySelector(sel);
      return el ? window.getComputedStyle(el).borderRadius : 'NOT_FOUND';
    };

    const sidebar = document.querySelector('[data-purpose="sidebar-navigation"]');
    const userProfileName = document.querySelector('[data-purpose="user-quick-profile"] h4');
    const headerGreeting = document.querySelector('[data-purpose="dashboard-header"] h1');

    return {
      sidebar: {
        renderedWidth: sidebar ? sidebar.getBoundingClientRect().width : null,
        computedWidth: sidebar ? window.getComputedStyle(sidebar).width : null,
      },
      radii: {
        heroCard: getRadius('[data-purpose="hero-current-course"]'),
        myLearningCard: getRadius('[data-purpose="continue-learning-card"]'),
        learningStreakCard: getRadius('[data-purpose="learning-streak-card"]'),
        quoteCard: getRadius('[data-purpose="inspirational-quote-card"]'),
        recentActivityCard: getRadius('[data-purpose="recent-activity-list"]'),
        nextUpRequirementCard: getRadius('[data-purpose="next-up-challenge"]'),
        certificationProgressCard: getRadius('[data-purpose="certification-progress-container"]'),
        aiInsightsCard: getRadius('[data-purpose="ai-insights-widget"]'),
        masteryOverviewCard: getRadius('[data-purpose="mastery-overview-widget"]'),
      },
      auth: {
        sidebarLearnerName: userProfileName ? userProfileName.textContent.trim() : null,
        headerGreetingText: headerGreeting ? headerGreeting.textContent.trim() : null,
      }
    };
  });

  console.log('=== DASHBOARD FIDELITY AUDIT REPORT ===');
  console.log(JSON.stringify(metrics, null, 2));

  const outPath = 'C:\\Users\\dhanush\\.gemini\\antigravity-ide\\brain\\69f0611a-41f5-402d-ad2f-21420965e55b\\dashboard.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Screenshot saved to', outPath);

  await browser.close();
}

verifyAndScreenshot().catch(err => {
  console.error(err);
  process.exit(1);
});
