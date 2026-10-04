const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SCREENSHOT_DIR = path.resolve(__dirname, "../../docs/screenshots/landing");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching Edge for Auth & Close-up visual QA...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Visit landing page
  await page.goto("http://localhost:5174/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  // Capture close-up of Navbar
  const navbarElement = await page.$("header");
  if (navbarElement) {
    await navbarElement.screenshot({ path: path.join(SCREENSHOT_DIR, "navbar_closeup.png") });
    console.log("Saved navbar_closeup.png");
  }

  // Click Sign In
  console.log("Clicking Sign In...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("header button"));
    const signInBtn = btns.find(b => b.textContent.includes("Sign In"));
    if (signInBtn) signInBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // Capture Auth View
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "auth_view.png") });
  console.log("Saved auth_view.png");

  // Click Close button in Auth View
  console.log("Testing Close button in Auth View...");
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Close"));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "returned_to_landing.png") });
  console.log("Saved returned_to_landing.png");

  await browser.close();
  console.log("Done testing Auth & Close-ups.");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
