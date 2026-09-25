import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const screenshotsDir = 'd:/Projects/certify/docs/screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runFullVisualQA() {
  console.log('🚀 Starting Full Visual QA across all CERTIFY screens...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  const screens = [
    { name: '1_dashboard', view: 'dashboard' },
    { name: '2_explore_courses', view: 'catalog' },
    { name: '3_course_details', view: 'course-details' },
    { name: '4_my_learning', view: 'mylearning' },
    { name: '5_ai_learning_studio', view: 'studio' },
    { name: '6_chapter_assessment', view: 'chapter-assessment' },
    { name: '7_diagnostic', view: 'diagnostic' },
    { name: '8_remediation', view: 'remediation' },
    { name: '9_final_assessment', view: 'final-assessment' },
    { name: '11_viva_defense', view: 'viva' },
    { name: '12_certification_result', view: 'result' },
    { name: '13_my_credentials', view: 'credentials' },
    { name: '14_credential_details', view: 'credential-details' },
    { name: '15_public_verify', view: 'verify' },
    { name: '16_auth', view: 'auth' },
    { name: '17_landing_page', view: 'landing' },
    { name: '19_progress', view: 'progress' },
    { name: '19_profile', view: 'profile' },
    { name: '19_settings', view: 'settings' },
  ];

  const results = [];

  for (const s of screens) {
    console.log(`\n📸 Capturing ${s.name} (view: ${s.view})...`);

    // Switch view via App state or navigation buttons
    await page.evaluate((targetView) => {
      // Find navigation button in sidebar
      const navButtons = Array.from(document.querySelectorAll('aside nav button, aside div button'));
      const mapping = {
        'dashboard': 'Dashboard',
        'catalog': 'Explore Courses',
        'mylearning': 'My Learning',
        'final-assessment': 'Assessments',
        'assessments': 'Assessments',
        'credentials': 'Credentials',
        'progress': 'Progress',
        'studio': 'AI Tutor',
        'profile': 'Profile',
        'settings': 'Settings'
      };

      const label = mapping[targetView];
      if (label) {
        const btn = navButtons.find(b => b.textContent && b.textContent.includes(label));
        if (btn) {
          btn.click();
          return;
        }
      }

      // If sub-view or full-screen view not directly in primary nav, we can dispatch click or react prop event
      if (typeof window.__certifyNavigate === 'function') {
        window.__certifyNavigate(targetView);
      }
    }, s.view);

    // If window.__certifyNavigate was needed, we can also set currentView directly in window
    await page.evaluate((targetView) => {
      // Check if we can find buttons inside page to navigate to subview
      if (targetView === 'course-details') {
        const cards = Array.from(document.querySelectorAll('article'));
        const firstCardBtn = cards[0]?.querySelector('button:last-child');
        if (firstCardBtn) firstCardBtn.click();
      } else if (targetView === 'chapter-assessment') {
        const studioExamBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Exam Mode'));
        if (studioExamBtn) studioExamBtn.click();
      } else if (targetView === 'diagnostic') {
        const diagBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Take Diagnostic') || b.textContent && b.textContent.includes('Diagnostic'));
        if (diagBtn) diagBtn.click();
      } else if (targetView === 'remediation') {
        const remBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Misconception Remediation') || b.textContent && b.textContent.includes('Open Studio'));
        if (remBtn) remBtn.click();
      } else if (targetView === 'credential-details') {
        const viewCredBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('View Credential') || b.textContent && b.textContent.includes('Inspect Credential'));
        if (viewCredBtn) viewCredBtn.click();
      }
    }, s.view);

    await new Promise(r => setTimeout(r, 1200));

    // Audit DOM metrics
    const audit = await page.evaluate(() => {
      const sidebar = document.querySelector('[data-purpose="sidebar-navigation"]');
      const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;
      const hasHorizontalOverflow = bodyWidth > windowWidth;

      return {
        sidebarWidth,
        bodyWidth,
        windowWidth,
        hasHorizontalOverflow,
      };
    });

    const screenshotPath = path.join(screenshotsDir, `${s.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot to ${screenshotPath}`);
    console.log(`Metrics: Sidebar Width=${audit.sidebarWidth}px, Horizontal Overflow=${audit.hasHorizontalOverflow}`);

    results.push({
      ...s,
      ...audit,
      screenshotPath,
    });
  }

  await browser.close();
  console.log('\n✅ Full Visual QA Completed successfully!');
  return results;
}

runFullVisualQA().catch(console.error);
