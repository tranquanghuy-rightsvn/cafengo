/*
 * audit.mjs — layout-integrity checks on the clone.
 *   W=375 node audit.mjs
 * Flags: horizontal page scroll, elements past the viewport, broken/unloaded
 * images, zero-size images, text clipped by its own box, dead interactive bits.
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = Number(process.env.W || 375);
const URL_ = process.env.URL || 'http://127.0.0.1:8899/';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: W, height: 900, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 160)));
const failedRequests = [];
page.on('requestfailed', (r) => failedRequests.push(r.url().slice(0, 120)));
page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(r.status() + ' ' + r.url().slice(0, 120)); });

await page.goto(URL_, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));
await page.evaluate(async () => {
  const max = document.documentElement.scrollHeight;
  for (let y = 0; y < max; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, max); await new Promise((r) => setTimeout(r, 1500));
});
/* give lazy images a bounded chance to finish; images in hidden panels never
   enter the viewport, so we only report ones that are actually laid out */
await page.evaluate(async () => {
  await Promise.race([
    Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.addEventListener('load', r, {once:true}); i.addEventListener('error', r, {once:true}); }))),
    new Promise(r => setTimeout(r, 4000)),
  ]);
});
await page.evaluate(async () => { window.scrollTo(0,0); await new Promise(r=>setTimeout(r,600)); });

const report = await page.evaluate((vw) => {
  const out = { hScroll: null, overflowing: [], badImages: [], clipped: [], externalRefs: [], fixedOk: {} };
  const de = document.documentElement;
  out.hScroll = { scrollW: de.scrollWidth, clientW: de.clientWidth, overflow: de.scrollWidth - de.clientWidth };

  /* elements poking past the viewport (ignore intentionally-offset decoration) */
  document.querySelectorAll('body *').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return;
    if (el.classList.contains('glow-blob')) return;         /* decorative, bleeds by design */
    if (el.closest('.flip-book__inner')) return;            /* book overflows its frame, as in source */
    if (el.closest('.nav-overlay:not(.is-open)')) return;   /* closed drawer parked off-canvas */
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const past = Math.round(Math.max(r.right - vw, -r.left));
    if (past > 2) out.overflowing.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), past, w: Math.round(r.width) });
  });

  /* images */
  document.querySelectorAll('img').forEach((img) => {
    const r = img.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;   /* inside a hidden panel */
    if (!img.complete || img.naturalWidth === 0) out.badImages.push({ src: (img.currentSrc || img.src).split('/').pop(), reason: 'not loaded' });
    else if (r.width < 2 || r.height < 2) out.badImages.push({ src: img.src.split('/').pop(), reason: 'zero size' });
  });

  /* text taller than its non-scrolling box => clipped */
  document.querySelectorAll('p, h1, h2, h3, h4, h5, span, a, button, li, label').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.overflow !== 'hidden') return;
    if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') return; /* deliberate clamp */
    if (el.scrollHeight - el.clientHeight > 3 && el.textContent.trim()) {
      out.clipped.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 50), over: el.scrollHeight - el.clientHeight });
    }
  });

  /* anything still pointing at the original host or a third party */
  const bad = /albi-coffe\.netlify\.app|gstatic|googleapis|tradingview|google\.com\/maps/;
  document.querySelectorAll('[src],[href]').forEach((el) => {
    const v = el.getAttribute('src') || el.getAttribute('href');
    if (v && bad.test(v)) out.externalRefs.push(el.tagName + ' ' + v.slice(0, 90));
  });
  [...document.querySelectorAll('*')].forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bad.test(bg)) out.externalRefs.push('bg ' + bg.slice(0, 90));
  });

  /* interactive smoke test */
  out.fixedOk.navToggle = !!document.getElementById('nav-open');
  out.fixedOk.navOverlay = !!document.getElementById('nav-overlay');
  out.fixedOk.flipLeaves = document.querySelectorAll('.leaf').length;
  out.fixedOk.dots = document.querySelectorAll('#flip-dots button').length;
  out.fixedOk.chips = document.querySelectorAll('.menu-chip').length;
  out.fixedOk.panels = document.querySelectorAll('.menu-panel').length;
  return out;
}, W);

/* mobile nav open/close */
let navWorks = 'n/a';
if (W < 768) {
  navWorks = await page.evaluate(async () => {
    const open = document.getElementById('nav-open');
    const overlay = document.getElementById('nav-overlay');
    open.click();
    await new Promise((r) => setTimeout(r, 450));
    const opened = overlay.classList.contains('is-open') && overlay.getBoundingClientRect().left < 5;
    document.getElementById('nav-close').click();
    await new Promise((r) => setTimeout(r, 450));
    const closed = !overlay.classList.contains('is-open');
    return { opened, closed };
  });
}

/* mobile menu chip switch */
const chipWorks = await page.evaluate(async () => {
  const chips = [...document.querySelectorAll('.menu-chip')];
  if (chips.length < 2) return 'no chips';
  chips[2].click();
  await new Promise((r) => setTimeout(r, 250));
  const active = document.querySelector('.menu-panel.is-active');
  return active ? active.dataset.cat : 'none';
});

console.log(JSON.stringify({ W, ...report, navWorks, chipWorks, consoleErrors, failedRequests: [...new Set(failedRequests)] }, null, 1));
await browser.close();
