import puppeteer from 'puppeteer-core';

async function inspect() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('https://early-help-353129.framer.app/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const info = await page.evaluate(() => {
    // Find all images or card elements in the gallery
    const images = Array.from(document.querySelectorAll('img'));
    const cards = images.map(img => {
      let p = img.parentElement;
      while (p && p.tagName !== 'BODY') {
        const cs = window.getComputedStyle(p);
        if (cs.transform && cs.transform !== 'none' || cs.perspective || cs.borderRadius) {
          // found container
        }
        p = p.parentElement;
      }
      const rect = img.getBoundingClientRect();
      const cs = window.getComputedStyle(img);
      const parentCs = window.getComputedStyle(img.parentElement);
      return {
        src: img.src,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        borderRadius: cs.borderRadius || parentCs.borderRadius,
        transform: cs.transform,
        parentTransform: parentCs.transform,
        filter: cs.filter || parentCs.filter,
        opacity: cs.opacity,
        parentOpacity: parentCs.opacity,
        zIndex: parentCs.zIndex,
      };
    });

    // Find perspective container
    const allElements = Array.from(document.querySelectorAll('*'));
    const perspectiveElements = allElements
      .filter(el => {
        const cs = window.getComputedStyle(el);
        return cs.perspective && cs.perspective !== 'none';
      })
      .map(el => {
        const cs = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          className: el.className,
          perspective: cs.perspective,
          perspectiveOrigin: cs.perspectiveOrigin,
          transformStyle: cs.transformStyle,
          rect: el.getBoundingClientRect(),
        };
      });

    // Extract text elements (captions, scroll/drag cue)
    const texts = allElements
      .filter(el => el.children.length === 0 && el.textContent.trim().length > 0)
      .map(el => {
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          text: el.textContent.trim(),
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          fontFamily: cs.fontFamily,
          letterSpacing: cs.letterSpacing,
          color: cs.color,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        };
      })
      .filter(t => t.text.includes('01') || t.text.includes('RIDGE') || t.text.includes('SCROLL') || t.text.includes('DRAG'));

    return {
      cards,
      perspectiveElements,
      texts,
    };
  });

  console.log('=== INSPECTION DATA ===');
  console.log(JSON.stringify(info, null, 2));

  await browser.close();
}

inspect().catch(console.error);
