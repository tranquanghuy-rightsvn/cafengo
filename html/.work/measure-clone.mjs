import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = Number(process.env.W || 1920);
const SEL = process.env.SEL || 'footer';
const DEPTH = Number(process.env.DEPTH || 4);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: W, height: 1080, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1000));
await page.evaluate(async () => {
  const max = document.documentElement.scrollHeight;
  for (let y = 0; y < max; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 600));
});

const data = await page.evaluate((sel, depth) => {
  const root = document.querySelector(sel);
  if (!root) return { error: 'not found ' + sel };
  const props = ['display','flexDirection','justifyContent','alignItems','gap','gridTemplateColumns','gridColumn',
    'position','zIndex','transform','width','height','minHeight','maxWidth','padding','margin',
    'color','backgroundColor','backgroundImage','opacity','filter',
    'fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textTransform','textAlign',
    'borderRadius','borderTopWidth','borderColor','boxShadow','objectFit','overflow'];
  function walk(node, d) {
    const cs = getComputedStyle(node);
    const b = node.getBoundingClientRect();
    const st = {};
    for (const p of props) {
      const v = cs[p];
      if (!v || ['none','normal','auto','0px','static','visible','rgba(0, 0, 0, 0)','start'].includes(v)) continue;
      st[p] = v;
    }
    const kids = [...node.children];
    const ownText = [...node.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    return {
      t: node.tagName.toLowerCase(),
      c: node.className?.toString?.().slice(0, 160) || '',
      box: { w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10, x: Math.round(b.left), y: Math.round(b.top + scrollY) },
      txt: ownText.slice(0, 200) || undefined,
      st,
      kids: d < depth ? kids.map(k => walk(k, d + 1)) : undefined,
    };
  }
  return walk(root, 0);
}, SEL, DEPTH);

fs.writeFileSync(process.env.OUT || 'm-clone.json', JSON.stringify(data, null, 1));
console.log('written', process.env.OUT || 'm-clone.json');
await browser.close();
