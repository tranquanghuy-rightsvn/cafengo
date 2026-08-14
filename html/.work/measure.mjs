import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = Number(process.env.W || 1920);
const SEL = process.env.SEL || '#home';
const DEPTH = Number(process.env.DEPTH || 6);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: W, height: 1080, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
await page.goto('https://albi-coffe.netlify.app/', { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, 2500));
await page.evaluate(async () => {
  const max = document.documentElement.scrollHeight;
  for (let y = 0; y < max; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); }
  window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 800));
});

const data = await page.evaluate((sel, depth) => {
  const root = document.querySelector(sel);
  if (!root) return { error: 'not found ' + sel };
  const props = ['display','flexDirection','flexWrap','justifyContent','alignItems','gap','gridTemplateColumns','gridColumn',
    'position','top','right','bottom','left','zIndex','transform','inset',
    'width','height','minHeight','maxWidth','minWidth','padding','margin','boxSizing',
    'color','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','opacity','mixBlendMode','filter','backdropFilter',
    'fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textTransform','textAlign','fontStyle',
    'borderRadius','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderColor','borderStyle','boxShadow',
    'objectFit','overflow','textDecorationLine','whiteSpace','aspectRatio','writingMode'];
  function walk(node, d) {
    const cs = getComputedStyle(node);
    const b = node.getBoundingClientRect();
    const st = {};
    for (const p of props) {
      const v = cs[p];
      if (!v) continue;
      if (['none','normal','auto','0px','static','visible','rgba(0, 0, 0, 0)','start','0s'].includes(v)) continue;
      st[p] = v;
    }
    const kids = [...node.children];
    const ownText = [...node.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    return {
      t: node.tagName.toLowerCase(),
      c: node.className?.toString?.().slice(0, 200) || '',
      box: { w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10, x: Math.round(b.left), y: Math.round(b.top + scrollY) },
      txt: ownText.slice(0, 200) || undefined,
      st,
      kids: d < depth ? kids.map(k => walk(k, d + 1)) : (kids.length ? kids.length + ' hidden children' : undefined),
    };
  }
  return walk(root, 0);
}, SEL, DEPTH);

fs.writeFileSync(process.env.OUT || `measure-${SEL.replace(/[^a-z0-9]/gi, '_')}-${W}.json`, JSON.stringify(data, null, 1));
console.log('written', process.env.OUT || `measure-${SEL.replace(/[^a-z0-9]/gi, '_')}-${W}.json`);
await browser.close();
