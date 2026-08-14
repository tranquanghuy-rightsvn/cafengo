import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,160)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
/* open one spread so both a recto and a verso are on show */
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1400));

const rects = () => page.evaluate(()=>{
  const vis = el => { const r = el.getBoundingClientRect(); return r.width>1 && r.height>1; };
  const recto = [...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(vis);
  const verso = [...document.querySelectorAll('.leaf.is-flipped .leaf__face--back')].find(vis);
  const box = el => { const r = el.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}; };
  return { recto: recto?box(recto):null, verso: verso?box(verso):null };
});
const st = () => page.evaluate(()=>{
  const s=[...document.querySelectorAll('.peel-fold')].filter(x=>x.classList.contains('is-lifted'));
  if(!s.length) return null;
  return s.map(x=>x.querySelector('.peel-fold__paper').getAttribute('points'));
});

const R = await rects();
console.log('recto', JSON.stringify(R.recto), '\nverso', JSON.stringify(R.verso));

async function probe(which, cx, cy, tag) {
  const r = (await rects())[which];
  await page.mouse.move(cx(r), cy(r));
  await new Promise(x=>setTimeout(x,260));
  const p = await st();
  if (!p) { console.log(tag.padEnd(26), 'NOT LIFTED'); return; }
  if (p.length > 1) { console.log(tag.padEnd(26), 'MULTIPLE LIFTED'); return; }
  const v = p[0].split(' ').map(s=>s.split(',').map(Number));
  console.log(tag.padEnd(26), 'tip=(' + v[2][0].toFixed(0) + ',' + v[2][1].toFixed(0) + ')',
              ' crease=(' + v[0][0].toFixed(0)+','+v[0][1].toFixed(0) + ')-(' + v[1][0].toFixed(0)+','+v[1][1].toFixed(0)+')');
}

await probe('recto', r=>r.x+r.w-120, r=>r.y+r.h-120, 'recto bottom-right');
await probe('recto', r=>r.x+r.w-120, r=>r.y+120,     'recto top-right');
await probe('verso', r=>r.x+120,     r=>r.y+r.h-120, 'verso bottom-left');
await probe('verso', r=>r.x+120,     r=>r.y+120,     'verso top-left');
/* inner (spine) corners must stay inert */
await probe('recto', r=>r.x+40,      r=>r.y+r.h-40,  'recto bottom-LEFT (spine)');
await probe('verso', r=>r.x+r.w-40,  r=>r.y+40,      'verso top-RIGHT (spine)');
await browser.close();
