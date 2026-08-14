/*
 * typecheck.mjs — align every text node between original and clone by its text
 * and report typography mismatches (weight / size / line-height / tracking / family).
 *   W=1920 node typecheck.mjs
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = Number(process.env.W || 1920);

const collect = async (url, wait) => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: 1080, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise((r) => setTimeout(r, wait));
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y < max; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); }
    window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 800));
  });
  const data = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('body *').forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (cs.fontFamily.includes('Material Symbols')) return;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
      if (!own || own.length < 4) return;
      const key = own.toLowerCase().replace(/[\s ]+/g, ' ').replace(/[«»"'“”‘’]/g, '').slice(0, 48);
      out.push({
        key,
        fw: cs.fontWeight,
        fs: cs.fontSize,
        lh: cs.lineHeight,
        ls: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing,
        ff: cs.fontFamily.split(',')[0].replace(/["']/g, ''),
        fst: cs.fontStyle,
      });
    });
    return out;
  });
  await browser.close();
  return data;
};

const [A, B] = await Promise.all([
  collect('https://albi-coffe.netlify.app/', 3000),
  collect('http://127.0.0.1:8899/', 1200),
]);

const index = (arr) => { const m = new Map(); arr.forEach((x) => { if (!m.has(x.key)) m.set(x.key, x); }); return m; };
const ia = index(A), ib = index(B);
const rows = [];
for (const [key, a] of ia) {
  const b = ib.get(key);
  if (!b) continue;
  const bad = [];
  if (a.fw !== b.fw) bad.push(`weight ${a.fw}→${b.fw}`);
  if (a.fs !== b.fs) bad.push(`size ${a.fs}→${b.fs}`);
  if (Math.abs(parseFloat(a.lh) - parseFloat(b.lh)) > 0.6) bad.push(`lh ${a.lh}→${b.lh}`);
  if (Math.abs(parseFloat(a.ls) - parseFloat(b.ls)) > 0.15) bad.push(`ls ${a.ls}→${b.ls}`);
  if (a.ff !== b.ff) bad.push(`font ${a.ff}→${b.ff}`);
  if (a.fst !== b.fst) bad.push(`style ${a.fst}→${b.fst}`);
  if (bad.length) rows.push({ key, bad: bad.join(', ') });
}
console.log(`orig text nodes ${A.length} (${ia.size} unique) / clone ${B.length} (${ib.size}) / matched keys ${[...ia.keys()].filter(k => ib.has(k)).length}`);
console.log(`mismatches: ${rows.length}`);
rows.forEach((r) => console.log(`  "${r.key}"  ->  ${r.bad}`));
