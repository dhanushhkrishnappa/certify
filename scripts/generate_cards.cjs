const puppeteer = require('../frontend/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const courses = [
  {
    slug: 'python-fundamentals',
    image: path.resolve('frontend/public/courses/python-fundamentals.jpg'),
    output: path.resolve('frontend/public/courses/card-python-fundamentals.jpg'),
    badge: 'FLAGSHIP TRACK',
    badgeColor: '#CEA4F2',
    badgeBg: 'rgba(56, 38, 73, 0.75)',
    badgeBorder: 'rgba(139, 95, 176, 0.45)',
    level: 'Beginner → Proficient',
    title: 'Python Fundamentals',
    description: 'Build your Python foundation through guided lessons, hands-on practice and assessments that help you demonstrate what you have learned.',
    metadata: '8 Modules • 36.5 hrs',
    benefit: 'Oral Viva Included',
    accent: '#E6CAA4'
  },
  {
    slug: 'web-development-foundations',
    image: path.resolve('frontend/public/courses/web-development-foundations.jpg'),
    output: path.resolve('frontend/public/courses/card-web-development-foundations.jpg'),
    badge: 'FOUNDATION TRACK',
    badgeColor: '#34D399',
    badgeBg: 'rgba(20, 60, 40, 0.75)',
    badgeBorder: 'rgba(52, 211, 153, 0.45)',
    level: 'Beginner',
    title: 'Web Development Foundations',
    description: 'Learn modern web development with hands-on projects, component architecture, and responsive real-world applications.',
    metadata: '12 Modules • 48 hrs',
    benefit: 'Practical Projects',
    accent: '#34D399'
  },
  {
    slug: 'data-structures-problem-solving',
    image: path.resolve('frontend/public/courses/data-structures-problem-solving.jpg'),
    output: path.resolve('frontend/public/courses/card-data-structures-problem-solving.jpg'),
    badge: 'CORE CS TRACK',
    badgeColor: '#CEA4F2',
    badgeBg: 'rgba(56, 38, 73, 0.75)',
    badgeBorder: 'rgba(139, 95, 176, 0.45)',
    level: 'Intermediate',
    title: 'Data Structures & Algorithms',
    description: 'Build core computer science problem-solving skills with interactive algorithmic structures, graph traversal, and complexity analysis.',
    metadata: '14 Modules • 52 hrs',
    benefit: 'Algorithmic Defense',
    accent: '#CEA4F2'
  },
  {
    slug: 'genai-llm-application-engineering',
    image: path.resolve('frontend/public/courses/genai-llm-application-engineering.jpg'),
    output: path.resolve('frontend/public/courses/card-genai-llm-application-engineering.jpg'),
    badge: 'APPLIED AI TRACK',
    badgeColor: '#F3DEBE',
    badgeBg: 'rgba(60, 45, 30, 0.75)',
    badgeBorder: 'rgba(243, 222, 190, 0.45)',
    level: 'Advanced',
    title: 'GenAI & LLM Engineering',
    description: 'Master prompt orchestration, semantic embeddings, retrieval pipelines, and autonomous agent evaluation.',
    metadata: '10 Modules • 40 hrs',
    benefit: 'Agent Evaluation',
    accent: '#F3DEBE'
  },
  {
    slug: 'sql-relational-database-design',
    image: path.resolve('frontend/public/courses/sql-relational-database-design.jpg'),
    output: path.resolve('frontend/public/courses/card-sql-relational-database-design.jpg'),
    badge: 'DATA SYSTEMS TRACK',
    badgeColor: '#38BDF8',
    badgeBg: 'rgba(20, 45, 65, 0.75)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)',
    level: 'Intermediate',
    title: 'SQL & Relational Databases',
    description: 'Explore relational schemas, index mechanics, transaction isolation, and query optimization on modern database engines.',
    metadata: '9 Modules • 38 hrs',
    benefit: 'Schema Verification',
    accent: '#38BDF8'
  }
];

function generateHtml(c) {
  const imgBase64 = fs.readFileSync(c.image).toString('base64');
  const imgSrc = 'data:image/jpeg;base64,' + imgBase64;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400..600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: transparent;
      width: 620px;
      height: 840px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      width: 600px;
      height: 820px;
      background: linear-gradient(180deg, #1C1C21 0%, #141417 40%, #0E0E10 100%);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 28px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
    .cover-container {
      width: 100%;
      height: 380px;
      position: relative;
      overflow: hidden;
      background: #000;
    }
    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(20,20,23,0.85) 100%);
    }
    .content {
      flex: 1;
      padding: 30px 42px 32px 42px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .top-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .badge-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 9px;
      background: rgba(230, 202, 164, 0.12);
      border: 1px solid rgba(230, 202, 164, 0.35);
      border-radius: 7px;
      color: #E6CAA4;
    }
    .track-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 12px;
      background: ${c.badgeBg};
      border: 1px solid ${c.badgeBorder};
      border-radius: 20px;
      color: ${c.badgeColor};
    }
    .level {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      color: #9CA3AF;
      font-weight: 500;
    }
    .title {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 38px;
      font-weight: 600;
      line-height: 1.15;
      color: #FFF9F0;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.5);
    }
    .description {
      font-size: 14.5px;
      line-height: 1.55;
      color: #CFC7BB;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .pills {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      color: #9CA3AF;
    }
    .benefit {
      color: #34D399;
      font-weight: 700;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 12px 22px;
      background: linear-gradient(135deg, #F3DEBE 0%, #E6CAA4 100%);
      border: none;
      border-radius: 14px;
      color: #141416;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      box-shadow: 0 4px 18px rgba(230, 202, 164, 0.3);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="cover-container">
      <img class="cover-image" src="${imgSrc}" alt="${c.title}" />
      <div class="cover-overlay"></div>
    </div>
    <div class="content">
      <div>
        <div class="top-meta">
          <div class="badge-wrap">
            <span class="logo-badge">CERTIFY</span>
            <span class="track-badge">${c.badge}</span>
          </div>
          <span class="level">${c.level}</span>
        </div>
        <h3 class="title">${c.title}</h3>
        <p class="description">${c.description}</p>
      </div>
      <div class="footer">
        <div class="pills">
          <span>${c.metadata}</span>
          <span>•</span>
          <span class="benefit">${c.benefit}</span>
        </div>
        <div class="cta-btn">
          <span>Explore</span>
          <span>→</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 620, height: 840, deviceScaleFactor: 2 });

  for (const c of courses) {
    const html = generateHtml(c);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 500));
    const cardEl = await page.$('.card');
    await cardEl.screenshot({ path: c.output, type: 'jpeg', quality: 95 });
    console.log('Generated unified card:', c.output);
  }

  await browser.close();
  console.log('All 5 unified course cards generated successfully!');
})();
