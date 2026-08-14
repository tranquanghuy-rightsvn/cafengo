import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:2}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const rects = () => page.evaluate(()=>{
  const vis = el => { const r = el.getBoundingClientRect(); return r.width>1 && r.height>1; };
  const recto = [...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(vis);
  const verso = [...document.querySelectorAll('.leaf.is-flipped .leaf__face--back')].find(vis);
  const box = el => { const r = el.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height,sx:scrollX,sy:scrollY}; };
  return { recto: box(recto), verso: box(verso) };
});
const D = 150;
const spots = [
  ['recto', r=>r.x+r.w-D, r=>r.y+r.h-D, 'br'],
  ['recto', r=>r.x+r.w-D, r=>r.y+D,     'tr'],
  ['verso', r=>r.x+D,     r=>r.y+r.h-D, 'bl'],
  ['verso', r=>r.x+D,     r=>r.y+D,     'tl'],
];
for (const [which,fx,fy,tag] of spots) {
  const R = await rects();
  const r = R[which];
  await page.mouse.move(fx(r), fy(r));
  await new Promise(x=>setTimeout(x,450));
  const cx = tag.includes('r') ? r.x + r.w - 300 : r.x;
  const cy = tag.startsWith('b') ? r.y + r.h - 300 : r.y;
  await page.screenshot({path:`shots/c4-${tag}.png`, clip:{x:r.sx+cx, y:r.sy+cy, width:300, height:300}});
  console.log('shot', tag);
}
await browser.close();
