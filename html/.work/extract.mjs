import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_ = 'https://albi-coffe.netlify.app/';
const OUT = process.cwd();

const W = Number(process.env.W || 1920);
const H = Number(process.env.H || 1080);
const TAG = process.env.TAG || String(W);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
page.setDefaultTimeout(60000);
await page.goto(URL_, { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, 3000));

// scroll sweep to trigger reveal animations / lazy loads
await page.evaluate(async () => {
  const step = 400;
  const max = document.documentElement.scrollHeight;
  for (let y = 0; y < max; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 90));
  }
  window.scrollTo(0, max);
  await new Promise((r) => setTimeout(r, 1200));
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 1200));
});
await new Promise((r) => setTimeout(r, 2000));

// full rendered HTML
const html = await page.evaluate(() => document.getElementById('root').outerHTML);
fs.writeFileSync(path.join(OUT, `rendered-${TAG}.html`), html);

// assets
const assets = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('img').forEach((i) => out.push({ type: 'img', src: i.currentSrc || i.src, alt: i.alt, cls: i.className }));
  document.querySelectorAll('video, video source').forEach((v) => v.src && out.push({ type: 'video', src: v.src }));
  document.querySelectorAll('*').forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') {
      [...bg.matchAll(/url\(["']?(.*?)["']?\)/g)].forEach((m) => out.push({ type: 'background', src: m[1], sel: el.tagName + '.' + el.className }));
    }
  });
  document.querySelectorAll('iframe').forEach((f) => out.push({ type: 'iframe', src: f.src }));
  return out;
});
fs.writeFileSync(path.join(OUT, `assets-${TAG}.json`), JSON.stringify(assets, null, 2));

// section geometry
const geo = await page.evaluate(() => {
  const m = document.querySelector('main');
  const r = (e) => { const b = e.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), h: Math.round(b.height), w: Math.round(b.width) }; };
  return {
    docH: document.documentElement.scrollHeight,
    vw: innerWidth,
    header: r(document.querySelector('header')),
    main: r(m),
    sections: [...m.children].map((c, i) => ({ i, id: c.id || null, cls: c.className, ...r(c) })),
    footer: document.querySelector('footer') ? r(document.querySelector('footer')) : null,
  };
});
fs.writeFileSync(path.join(OUT, `geo-${TAG}.json`), JSON.stringify(geo, null, 2));

// full page screenshot
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
await page.screenshot({ path: path.join(OUT, 'shots', `orig-full-${TAG}.png`), fullPage: true });

console.log(JSON.stringify({ tag: TAG, docH: geo.docH, vw: geo.vw, htmlLen: html.length, assets: assets.length }));
await browser.close();
