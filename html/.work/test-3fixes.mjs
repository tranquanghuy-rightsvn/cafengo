import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,160)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));

const lifted = () => page.evaluate(()=>[...document.querySelectorAll('.peel-fold')].some(x=>x.classList.contains('is-lifted')));
const faceBox = (sel) => page.evaluate((s)=>{const f=[...document.querySelectorAll(s)].find(x=>x.getBoundingClientRect().width>1);if(!f)return null;const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};},sel);

/* 3) front cover must NOT dog-ear */
let b = await faceBox('.leaf:not(.is-flipped) .leaf__face--front');
await page.mouse.move(b.x+b.w-120, b.y+b.h-120); await new Promise(r=>setTimeout(r,400));
console.log('front cover, corner held  -> folds?', await lifted(), '(expect false)');
await page.mouse.move(b.x+b.w-120, b.y+120); await new Promise(r=>setTimeout(r,400));
console.log('front cover, top corner   -> folds?', await lifted(), '(expect false)');

/* open far enough that both pages on show are paper (leaf 0 carries the cover) */
await page.evaluate(()=>{const b=document.getElementById('flip-next');b.click();b.click();});
await new Promise(r=>setTimeout(r,3200));
b = await faceBox('.leaf:not(.is-flipped) .leaf__face--front');
await page.mouse.move(b.x+b.w-120, b.y+b.h-120); await new Promise(r=>setTimeout(r,400));
console.log('paper recto, corner held  -> folds?', await lifted(), '(expect true)');
const v = await faceBox('.leaf.is-flipped .leaf__face--back');
await page.mouse.move(v.x+120, v.y+120); await new Promise(r=>setTimeout(r,400));
console.log('paper verso, corner held  -> folds?', await lifted(), '(expect true)');

/* 1) the menu photo must no longer zoom */
const fig = await page.evaluate(()=>{const f=[...document.querySelectorAll('.leaf.is-flipped .leaf__face--back .page-intro__figure')].find(x=>x.getBoundingClientRect().width>1);const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
await page.mouse.move(fig.x+fig.w/2, fig.y+fig.h/2); await new Promise(r=>setTimeout(r,800));
const tr = await page.evaluate(()=>{const f=[...document.querySelectorAll('.leaf.is-flipped .leaf__face--back .page-intro__figure')].find(x=>x.getBoundingClientRect().width>1);return getComputedStyle(f.querySelector('img')).transform;});
console.log('menu photo hovered -> transform:', tr, '(expect none)');

/* 2) no "Chọn món" anywhere */
const btns = await page.evaluate(()=>({
  addButtons: document.querySelectorAll('.dish__add').length,
  textHits: (document.body.textContent.match(/Chọn món/g)||[]).length,
  dishes: document.querySelectorAll('.dish').length,
  prices: document.querySelectorAll('.dish__price').length,
}));
console.log('menu buttons:', JSON.stringify(btns));

/* back cover must not dog-ear either */
await page.evaluate(()=>{const b=document.getElementById('flip-next');for(let i=0;i<6;i++)b.click();});
await new Promise(r=>setTimeout(r,6500));   /* six soft turns queue up at ~820ms each */
const bc = await page.evaluate(()=>{
  const t=[...document.querySelectorAll('.leaf.is-flipped')].sort((a,b)=>(+b.style.zIndex||0)-(+a.style.zIndex||0))[0];
  const r=t.querySelector('.leaf__face--back').getBoundingClientRect();
  return {x:r.left,y:r.top,w:r.width,h:r.height};});
await page.mouse.move(bc.x+120, bc.y+bc.h-120); await new Promise(r=>setTimeout(r,400));
console.log('back cover, corner held   -> folds?', await lifted(), '(expect false)');
await browser.close();
