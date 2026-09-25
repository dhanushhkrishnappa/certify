import puppeteer from 'puppeteer-core';

async function verifyAndScreenshotCatalog() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  // Click on "Explore Courses" in the sidebar
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button'));
    const exploreBtn = buttons.find(b => b.textContent && b.textContent.includes('Explore Courses'));
    if (exploreBtn) {
      exploreBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 1500)); // wait for transitions & SVG paints

  // Audit DOM metrics for Screen 2
  const metrics = await page.evaluate(() => {
    const sidebar = document.querySelector('[data-purpose="sidebar-navigation"]');
    const headerTitle = document.querySelector('[data-purpose="dashboard-header"] h1');
    const cards = Array.from(document.querySelectorAll('[data-purpose="course-card"]'));
    const filterPills = Array.from(document.querySelectorAll('[data-purpose="filter-toolbar"] button'));
    const pagination = document.querySelector('[data-purpose="pagination-footer"]');

    return {
      sidebar: {
        renderedWidth: sidebar ? sidebar.getBoundingClientRect().width : null,
        computedWidth: sidebar ? window.getComputedStyle(sidebar).width : null,
      },
      header: {
        titleText: headerTitle ? headerTitle.textContent.trim() : null,
        fontFamily: headerTitle ? window.getComputedStyle(headerTitle).fontFamily : null,
      },
      catalog: {
        cardsRendered: cards.length,
        cardRadii: cards.map(c => window.getComputedStyle(c).borderRadius),
        filterPillsCount: filterPills.length,
        hasPagination: !!pagination,
      },
    };
  });

  console.log('=== SCREEN 2 (EXPLORE COURSES CATALOG) FIDELITY REPORT ===');
  console.log(JSON.stringify(metrics, null, 2));

  const outPath = 'C:\\Users\\dhanush\\.gemini\\antigravity-ide\\brain\\69f0611a-41f5-402d-ad2f-21420965e55b\\explore_courses.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Screenshot saved to', outPath);

  await browser.close();
}

verifyAndScreenshotCatalog().catch(err => {
  console.error(err);
  process.exit(1);
});
