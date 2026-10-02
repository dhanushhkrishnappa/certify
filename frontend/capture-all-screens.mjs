import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('..', 'docs', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureAllScreens() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024 });

  console.log('Navigating to root (unauthenticated)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));

  // 1. Auth View
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_auth.png'), fullPage: true });
  console.log('Saved 01_auth.png');

  // 2. Landing View (Public)
  await page.evaluate(() => {
    window.__certifyNavigate('landing');
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_landing.png'), fullPage: true });
  console.log('Saved 02_landing.png');

  // Authenticate to access protected views
  await page.evaluate(() => {
    window.__certifyNavigate('auth');
  });
  await new Promise((r) => setTimeout(r, 600));

  // Fill login with phone number
  const phoneInputSelector = 'input[type="tel"], #mobile-number';
  await page.waitForSelector(phoneInputSelector);
  await page.click(phoneInputSelector);
  await page.type(phoneInputSelector, '9876543210');

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.includes('Continue with OTP'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Verify we are on Dashboard
  const views = [
    { name: '03_dashboard.png', view: 'dashboard' },
    { name: '04_catalog.png', view: 'catalog' },
    { name: '05_course_details.png', view: 'course-details' },
    { name: '06_my_learning.png', view: 'mylearning' },
    { name: '07_diagnostic.png', view: 'diagnostic' },
    { name: '08_learning_studio.png', view: 'studio' },
    { name: '09_chapter_assessment.png', view: 'chapter-assessment' },
    { name: '10_remediation.png', view: 'remediation' },
    { name: '11_final_assessment.png', view: 'final-assessment' },
    { name: '12_practical.png', view: 'practical' },
    { name: '13_viva.png', view: 'viva' },
    { name: '14_certification_result.png', view: 'result' },
    { name: '15_credentials.png', view: 'credentials' },
    { name: '16_credential_details.png', view: 'credential-details' },
    { name: '17_verification.png', view: 'verify' },
    { name: '18_progress.png', view: 'progress' },
    { name: '19_profile.png', view: 'profile' },
    { name: '20_settings.png', view: 'settings' },
  ];

  for (const { name, view } of views) {
    await page.evaluate((v) => {
      window.__certifyNavigate(v);
    }, view);
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, name), fullPage: true });
    console.log(`Saved ${name} (${view})`);
  }

  await browser.close();
  console.log('All 20 fresh screenshots captured successfully!');
}

captureAllScreens().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
