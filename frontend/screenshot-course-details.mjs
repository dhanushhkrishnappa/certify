import puppeteer from 'puppeteer-core';

async function verifyAndScreenshotCourseDetails() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Navigate to Explore Courses
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button'));
    const exploreBtn = buttons.find(b => b.textContent && b.textContent.includes('Explore Courses'));
    if (exploreBtn) exploreBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Click "View Details" on Python Fundamentals card
  const clicked = await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll('article'));
    const pythonArticle = articles.find(a => a.textContent && a.textContent.includes('Python Fundamentals'));
    if (pythonArticle) {
      const viewDetailsBtn = Array.from(pythonArticle.querySelectorAll('button')).find(
        b => b.textContent && b.textContent.includes('View Details')
      );
      if (viewDetailsBtn) {
        viewDetailsBtn.click();
        return true;
      }
    }
    return false;
  });

  console.log('Clicked Python Fundamentals View Details:', clicked);
  await new Promise(r => setTimeout(r, 2000)); // wait for course detail API & DOM render

  // 3. Audit DOM metrics for Screen 3
  const metrics = await page.evaluate(() => {
    const sidebar = document.querySelector('[data-purpose="sidebar-navigation"]');
    const _headerBar = document.querySelector('[data-purpose="top-navigation-bar"]');
    const courseDetailsRoot = document.querySelector('[data-purpose="course-details-page"]');

    const heroBanner = document.querySelector('[data-purpose="hero-banner"]');
    const featuresGrid = document.querySelector('[data-purpose="features-grid"]');
    const featureCards = featuresGrid ? Array.from(featuresGrid.children) : [];
    const whatYouLearn = document.querySelector('[data-purpose="what-you-will-learn"]');
    const skillsGained = document.querySelector('[data-purpose="skills-gained"]');
    const curriculum = document.querySelector('[data-purpose="curriculum-section"]');
    const rightSidebar = document.querySelector('[data-purpose="right-sidebar"]');
    const rightSidebarCards = rightSidebar ? Array.from(rightSidebar.children) : [];

    return {
      sidebar: {
        renderedWidth: sidebar ? sidebar.getBoundingClientRect().width : null,
        computedWidth: sidebar ? window.getComputedStyle(sidebar).width : null,
      },
      pagePresence: !!courseDetailsRoot,
      heroBanner: {
        rendered: !!heroBanner,
        borderRadius: heroBanner ? window.getComputedStyle(heroBanner).borderRadius : null,
        height: heroBanner ? heroBanner.getBoundingClientRect().height : null,
      },
      featureCards: {
        count: featureCards.length,
        radii: featureCards.map(c => window.getComputedStyle(c).borderRadius),
      },
      whatYouLearn: {
        rendered: !!whatYouLearn,
        itemsCount: whatYouLearn ? whatYouLearn.querySelectorAll('li').length : 0,
      },
      skillsGained: {
        rendered: !!skillsGained,
        pillsCount: skillsGained ? skillsGained.querySelectorAll('span.rounded-full').length : 0,
      },
      curriculum: {
        rendered: !!curriculum,
        modulesRendered: curriculum ? curriculum.querySelectorAll('.border.border-slate-200.rounded-\\[10px\\]').length : 0,
      },
      rightSidebar: {
        cardsCount: rightSidebarCards.length,
        cardsRadii: rightSidebarCards.map(c => window.getComputedStyle(c).borderRadius),
      }
    };
  });

  console.log('=== SCREEN 3 (PYTHON FUNDAMENTALS — COURSE OVERVIEW) FIDELITY REPORT ===');
  console.log(JSON.stringify(metrics, null, 2));

  const outPath = 'C:/Users/dhanush/.gemini/antigravity-ide/brain/69f0611a-41f5-402d-ad2f-21420965e55b/course_details.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Screenshot saved to', outPath);

  await browser.close();
}

verifyAndScreenshotCourseDetails().catch(err => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
