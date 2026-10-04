const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SCREENSHOT_DIR = path.resolve(__dirname, "../../docs/screenshots/landing");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching Edge via puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(err.toString());
  });

  // 1. Desktop Test (1440x900)
  console.log("Setting desktop viewport (1440x900)...");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:5174/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));

  // Top Screenshot
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_desktop_hero.png") });
  console.log("Saved 01_desktop_hero.png");

  // Scroll to Manifesto
  await page.evaluate(() => {
    const el = document.getElementById("manifesto");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_desktop_manifesto.png") });
  console.log("Saved 02_desktop_manifesto.png");

  // Scroll to How It Works (Learned, Demonstrated, Earned)
  await page.evaluate(() => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_desktop_how_it_works.png") });
  console.log("Saved 03_desktop_how_it_works.png");

  // Scroll to AI Showcase & test interaction
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h => h.textContent.includes("Socratic AI Tutor"));
    if (heading) heading.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_desktop_ai_showcase.png") });
  console.log("Saved 04_desktop_ai_showcase.png");

  // Click step 2 in AI showcase
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button")).filter(b => b.textContent.includes("02."));
    if (btns.length > 0) btns[0].click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_desktop_ai_showcase_step2.png") });
  console.log("Saved 05_desktop_ai_showcase_step2.png");

  // Scroll to Proof Bento
  await page.evaluate(() => {
    const el = document.getElementById("pedagogy");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_desktop_proof_bento.png") });
  console.log("Saved 06_desktop_proof_bento.png");

  // Scroll to Image Reveal Gallery
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h => h.textContent.includes("How Certify Verifies"));
    if (heading) heading.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_desktop_image_gallery.png") });
  console.log("Saved 07_desktop_image_gallery.png");

  // Scroll to Curriculum Carousel
  await page.evaluate(() => {
    const el = document.getElementById("courses");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_desktop_curriculum_carousel.png") });
  console.log("Saved 08_desktop_curriculum_carousel.png");

  // Scroll to Flagship Course Section
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h => h.textContent.includes("Python Fundamentals"));
    if (heading) heading.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09_desktop_flagship_course.png") });
  console.log("Saved 09_desktop_flagship_course.png");

  // Scroll to Stats & Testimonials
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h => h.textContent.includes("How Learners Experience"));
    if (heading) heading.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10_desktop_testimonials.png") });
  console.log("Saved 10_desktop_testimonials.png");

  // Scroll to Choose Your Path
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h => h.textContent.includes("Choose Your Learning Path"));
    if (heading) heading.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11_desktop_choose_path.png") });
  console.log("Saved 11_desktop_choose_path.png");

  // Scroll to FAQ & click an accordion item
  await page.evaluate(() => {
    const el = document.getElementById("faq");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => {
    const faqButtons = Array.from(document.querySelectorAll("#faq button"));
    if (faqButtons.length > 2) faqButtons[2].click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12_desktop_faq_accordion.png") });
  console.log("Saved 12_desktop_faq_accordion.png");

  // Scroll to Final CTA & Footer
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h => h.textContent.includes("Don't just say you know it"));
    if (heading) heading.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13_desktop_final_cta.png") });
  console.log("Saved 13_desktop_final_cta.png");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "14_desktop_footer.png") });
  console.log("Saved 14_desktop_footer.png");

  // 2. Tablet Test (768x1024)
  console.log("Testing Tablet Viewport (768x1024)...");
  await page.setViewport({ width: 768, height: 1024 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "15_tablet_hero.png") });
  console.log("Saved 15_tablet_hero.png");

  // 3. Mobile Test (390x844)
  console.log("Testing Mobile Viewport (390x844)...");
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "16_mobile_hero.png") });
  console.log("Saved 16_mobile_hero.png");

  // Open mobile menu
  await page.evaluate(() => {
    const menuBtn = document.querySelector('button[aria-label="Open menu"]');
    if (menuBtn) menuBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "17_mobile_menu_open.png") });
  console.log("Saved 17_mobile_menu_open.png");

  await browser.close();

  console.log("\n==============================");
  console.log("QA AUTOMATION COMPLETE");
  console.log("Console Errors Detected:", consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((e, idx) => console.log(`  [${idx + 1}] ${e}`));
  }
  console.log("==============================\n");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
