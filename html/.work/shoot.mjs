/*
 * shoot.mjs — capture per-section PNGs from a page.
 *   TARGET=orig|clone  W=1920  node shoot.mjs
 * Sections are addressed by a stable data attribute (clone) or id/index (orig),
 * declared in SECTIONS below. Output: .work/shots/<target>-<key>-<W>.png
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET = process.env.TARGET || 'clone';
const W = Number(process.env.W || 1920);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;

const URLS = {
  orig: 'https://albi-coffe.netlify.app/',
  clone: 'http://127.0.0.1:8899/',
};

/* key -> { orig: selector, clone: selector } */
const SECTIONS = {
  header: { orig: 'header', clone: 'header' },
  hero: { orig: '#home', clone: '#home' },
  menu: { orig: '#menu', clone: '#menu' },
  invest: { orig: 'main > section:nth-of-type(3)', clone: '#invest' },
  philosophy: { orig: 'main > section:nth-of-type(4)', clone: '#philosophy' },
  testimonials: { orig: '#testimonials', clone: '#testimonials' },
  reservations: { orig: '#reservations', clone: '#reservations' },
  contact: { orig: '#contact', clone: '#contact' },
  footer: { orig: 'footer', clone: 'footer' },
};

const OUT = path.join(process.cwd(), 'shots');
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: W, height: 1080, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
page.setDefaultTimeout(90000);
await page.goto(URLS[TARGET], { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, TARGET === 'orig' ? 3000 : 1200));

/* reveal everything + settle */
await page.evaluate(async () => {
  const max = document.documentElement.scrollHeight;
  for (let y = 0; y < max; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
  window.scrollTo(0, max);
  await new Promise((r) => setTimeout(r, 1000));
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 1000));
});

/* freeze animations so diffs are deterministic */
await page.addStyleTag({
  content: `*,*::before,*::after{animation-play-state:paused!important;transition:none!important}
            .cursor-glow,#cursor-glow{display:none!important}`,
});

await new Promise((r) => setTimeout(r, 600));

/* Fixed-position chrome (header, FAB, progress bar) would bleed into a mid-page
   crop, so hide it — except when the header itself is the target. */
const setFixedHidden = (hidden) => page.evaluate((h) => {
  document.querySelectorAll('body *').forEach((el) => {
    if (getComputedStyle(el).position === 'fixed') el.style.visibility = h ? 'hidden' : '';
  });
}, hidden);

const results = {};
for (const [key, sel] of Object.entries(SECTIONS)) {
  if (ONLY && !ONLY.includes(key)) continue;
  await setFixedHidden(key !== 'header');
  const selector = sel[TARGET];
  const handle = await page.$(selector);
  if (!handle) { results[key] = 'MISSING: ' + selector; continue; }
  const box = await handle.boundingBox();
  if (!box || box.height < 2) { results[key] = 'NO BOX'; continue; }
  const file = path.join(OUT, `${TARGET}-${key}-${W}.png`);
  try {
    await handle.screenshot({ path: file, captureBeyondViewport: true });
    results[key] = { w: Math.round(box.width), h: Math.round(box.height) };
  } catch (e) {
    results[key] = 'ERR ' + e.message;
  }
}

console.log(JSON.stringify({ target: TARGET, W, results }, null, 1));
await browser.close();
