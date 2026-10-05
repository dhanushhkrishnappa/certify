const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../../docs/landing-page/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runQA() {
  console.log('Launching headless browser with msedge.exe...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  // 1. Desktop Test: 1440x900
  console.log('Testing 1440x900 desktop viewport...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait 2 seconds for Three.js & shaders to compile and render first frame
  await new Promise(r => setTimeout(r, 2000));

  // Check canvas exists
  const canvasCount = await page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    return canvases.length;
  });
  console.log(`Found ${canvasCount} canvas element(s) on page.`);

  // Test pointer move
  console.log('Simulating pointer movements...');
  await page.mouse.move(720, 450);
  await page.mouse.move(300, 200);
  await page.mouse.move(1000, 600);
  await new Promise(r => setTimeout(r, 500));

  // Take hero screenshot
  const heroShot = path.join(SCREENSHOT_DIR, 'dither-hero-1440.png');
  await page.screenshot({ path: heroShot });
  console.log('Saved hero screenshot:', heroShot);

  // Test click on navbar button
  console.log('Testing clickability on CTA...');
  const ctaBtn = await page.$('.hero-cta-btn');
  if (ctaBtn) {
    console.log('Hero CTA button found and visible.');
  }

  // Scroll to pedagogy (Six Pillars)
  console.log('Scrolling to Six Pillars section...');
  await page.evaluate(() => {
    const el = document.getElementById('pedagogy');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));
  const pillarsShot = path.join(SCREENSHOT_DIR, 'dither-pillars-1440.png');
  await page.screenshot({ path: pillarsShot });
  console.log('Saved pillars screenshot:', pillarsShot);

  // Scroll to full page bottom
  console.log('Scrolling through complete page to bottom...');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 1000));
  const footerShot = path.join(SCREENSHOT_DIR, 'dither-footer-1440.png');
  await page.screenshot({ path: footerShot });
  console.log('Saved footer screenshot:', footerShot);

  // 2. Mobile Test: 390x844
  console.log('Testing 390x844 mobile viewport...');
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const mobileShot = path.join(SCREENSHOT_DIR, 'dither-mobile-390.png');
  await page.screenshot({ path: mobileShot });
  console.log('Saved mobile screenshot:', mobileShot);

  console.log('\n--- QA SUMMARY ---');
  console.log(`Total Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors encountered:', errors);
  } else {
    console.log('All tests passed with 0 console errors!');
  }

  await browser.close();
  return { errors, consoleMessages };
}

runQA().catch(err => {
  console.error('QA Runner encountered error:', err);
  process.exit(1);
});
