const puppeteer = require('../frontend/node_modules/puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const imgBase64 = fs.readFileSync('frontend/public/certify-logo.png').toString('base64');
  
  await page.setContent(`
    <img id="logo" src="data:image/png;base64,${imgBase64}" />
    <canvas id="cv"></canvas>
  `);

  const resultBase64 = await page.evaluate(() => {
    const img = document.getElementById('logo');
    const cv = document.getElementById('cv');
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
    const data = imgData.data;
    const w = cv.width;
    const h = cv.height;

    // RGB to HSL
    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return [h, s, l];
    }

    // HSL to RGB
    function hslToRgb(h, s, l) {
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    // Is this pixel part of the typography text?
    function isTypography(x, y, r, g, b, a) {
      if (a < 8) return false;
      // Exclude dot on i
      if (x >= 485 && x <= 540 && y < 75) return false;
      // Exclude sparkle
      if (x >= 160 && x <= 205 && y < 70) return false;
      // Exclude C ribbon (x < 170)
      if (x < 170) return false;
      // Exclude Y ribbon main body (x >= 685)
      if (x >= 685) return false;

      // Dark text characteristic:
      // Typography font has r < 35, g < 45, b < 135, brightness < 50
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness < 50 && r < 35 && g < 45 && b < 135) {
        return true;
      }
      return false;
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const a = data[i+3];
        if (a < 5) continue;

        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        if (isTypography(x, y, r, g, b, a)) {
          // Change the black part of the logo to pure crisp white!
          data[i] = 255;
          data[i+1] = 255;
          data[i+2] = 255;
        } else {
          // "and the darker shades into lighter ones"
          // In the ribbons and colored elements, lift darker shades:
          const [hue, sat, lum] = rgbToHsl(r, g, b);

          if (lum < 0.65) {
            // Lift darker shades:
            // Lum 0.08 -> 0.40
            // Lum 0.20 -> 0.48
            // Lum 0.40 -> 0.58
            // Lum 0.60 -> 0.68
            const lift = Math.pow(1 - lum, 1.3) * 0.42;
            const newLum = Math.min(0.95, lum + lift);
            const newSat = Math.min(1.0, sat * 1.2);
            const [newR, newG, newB] = hslToRgb(hue, newSat, newLum);
            data[i] = newR;
            data[i+1] = newG;
            data[i+2] = newB;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return cv.toDataURL('image/png');
  });

  // Save the transformed logo
  const base64Data = resultBase64.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('scripts/test_logo_out.png', Buffer.from(base64Data, 'base64'));
  console.log('Saved scripts/test_logo_out.png');

  // Preview on both pure black and dark card background
  await page.setContent(`
    <canvas id="prevCv" width="900" height="420"></canvas>
  `);
  const prevBase64 = await page.evaluate((logoUri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('prevCv');
        const ctx = cv.getContext('2d');
        // Pure black background #09090b
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, cv.width, cv.height);
        
        // Dark card #121215 with border
        ctx.fillStyle = '#121215';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(30, 30, cv.width - 60, cv.height - 60, 16);
        ctx.fill();
        ctx.stroke();

        // Draw transformed logo inside the dark card
        const targetW = 720;
        const targetH = (img.naturalHeight / img.naturalWidth) * targetW;
        ctx.drawImage(img, (cv.width - targetW) / 2, (cv.height - targetH) / 2, targetW, targetH);
        resolve(cv.toDataURL('image/png'));
      };
      img.src = logoUri;
    });
  }, resultBase64);

  const prevData = prevBase64.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('scripts/preview_dark.png', Buffer.from(prevData, 'base64'));
  console.log('Saved scripts/preview_dark.png');

  await browser.close();
})();
