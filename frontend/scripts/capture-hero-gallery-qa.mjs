import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\dhanush\\.gemini\\antigravity-ide\\brain\\344d86b3-6305-4dc7-862c-4a353719a249';
const DOCS_DIR = 'd:\\Projects\\certify\\docs\\landing-page\\screenshots\\hero_gallery';

// Ensure output dirs exist
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

async function getBrowserExecutable() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  throw new Error('No Chrome or Edge browser executable found');
}

const STAGE_NAMES = [
  'stage_01_problem',
  'stage_02_gap',
  'stage_03_shift',
  'stage_04_solution',
  'stage_05_evidence',
  'stage_06_outcome',
];

async function runHeroQA() {
  const executablePath = await getBrowserExecutable();
  console.log('Launching browser from:', executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();

  // Collect console logs and errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. DESKTOP RUN (1440 x 900)
  console.log('\n--- 1. DESKTOP VIEWPORT RUN (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 20000 });

  // Wait for preloader animation to finish if active
  await new Promise(r => setTimeout(r, 2500));

  // Loop through all 6 stages on desktop
  for (let i = 0; i < 6; i++) {
    // Jump to slide i using the navigation dots
    await page.evaluate((slideIdx) => {
      const dots = document.querySelectorAll('button[aria-label^="Jump to slide"]');
      if (dots[slideIdx]) {
        (dots[slideIdx]).click();
      }
    }, i);

    await new Promise(r => setTimeout(r, 1000));

    // Audit video playback state
    const videoState = await page.evaluate(() => {
      const videos = document.querySelectorAll('video');
      const v1 = videos[0];
      const v2 = videos[1];
      return {
        count: videos.length,
        v1: v1 ? { paused: v1.paused, src: v1.getAttribute('src'), currentTime: v1.currentTime } : null,
        v2: v2 ? { paused: v2.paused, src: v2.getAttribute('src'), currentTime: v2.currentTime } : null,
      };
    });

    console.log(`[Desktop] Stage ${i + 1} (${STAGE_NAMES[i]}):`, {
      activeSlideIndex: i,
      videoAudit: videoState,
    });

    // Capture screenshot (viewport without document clip)
    const filename = `${STAGE_NAMES[i]}_desktop.png`;
    const docPath = path.join(DOCS_DIR, filename);
    const artPath = path.join(ARTIFACTS_DIR, filename);

    await page.screenshot({ path: docPath });
    fs.copyFileSync(docPath, artPath);
    console.log(`Saved screenshot: ${docPath}`);
  }

  // Test Keyboard Navigation
  console.log('\n--- TESTING KEYBOARD NAVIGATION ---');
  await page.keyboard.press('ArrowLeft');
  await new Promise(r => setTimeout(r, 500));
  let curIndex = await page.evaluate(() => {
    const dots = document.querySelectorAll('button[aria-label^="Jump to slide"]');
    return Array.from(dots).findIndex(d => d.classList.contains('w-6'));
  });
  console.log('After ArrowLeft from slide 5 -> current slide index:', curIndex);

  await page.keyboard.press('ArrowRight');
  await new Promise(r => setTimeout(r, 500));
  curIndex = await page.evaluate(() => {
    const dots = document.querySelectorAll('button[aria-label^="Jump to slide"]');
    return Array.from(dots).findIndex(d => d.classList.contains('w-6'));
  });
  console.log('After ArrowRight -> current slide index:', curIndex);

  // 2. MOBILE RUN (390 x 844)
  console.log('\n--- 2. MOBILE VIEWPORT RUN (390x844) ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2500));

  for (let i = 0; i < 6; i++) {
    await page.evaluate((slideIdx) => {
      const dots = document.querySelectorAll('button[aria-label^="Jump to slide"]');
      if (dots[slideIdx]) {
        (dots[slideIdx]).click();
      }
    }, i);

    await new Promise(r => setTimeout(r, 1000));

    const filename = `${STAGE_NAMES[i]}_mobile.png`;
    const docPath = path.join(DOCS_DIR, filename);
    const artPath = path.join(ARTIFACTS_DIR, filename);

    await page.screenshot({ path: docPath });
    fs.copyFileSync(docPath, artPath);
    console.log(`Saved mobile screenshot: ${docPath}`);
  }

  // Check console errors
  console.log('\n--- CONSOLE ERROR REPORT ---');
  console.log('Console errors captured:', consoleErrors.length ? consoleErrors : 'None (0 errors)');

  await browser.close();
  console.log('\nAll QA tests and screenshots completed successfully!');
}

runHeroQA().catch(err => {
  console.error('QA script failed:', err);
  process.exit(1);
});
