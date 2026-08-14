import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,180)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));

const label = () => page.evaluate(()=>String(document.querySelectorAll('.leaf.is-flipped').length));
const folds = () => page.evaluate(()=>[...document.querySelectorAll('.peel-fold')].filter(x=>x.classList.contains('is-lifted')).length);
const liveVerso = () => page.evaluate(()=>{
  const t=[...document.querySelectorAll('.leaf.is-flipped')].sort((a,b)=>(+b.style.zIndex||0)-(+a.style.zIndex||0))[0];
  if(!t) return null; const r=t.querySelector('.leaf__face--back').getBoundingClientRect();
  return {idx:[...document.querySelectorAll('.leaf')].indexOf(t), x:r.left,y:r.top,w:r.width,h:r.height};
});
const liveRecto = () => page.evaluate(()=>{
  const t=[...document.querySelectorAll('.leaf:not(.is-flipped)')].sort((a,b)=>(+b.style.zIndex||0)-(+a.style.zIndex||0))[0];
  if(!t) return null; const r=t.querySelector('.leaf__face--front').getBoundingClientRect();
  return {idx:[...document.querySelectorAll('.leaf')].indexOf(t), x:r.left,y:r.top,w:r.width,h:r.height};
});

/* spread 1: the left page is leaf 0's back — the leaf carrying the front cover */
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
let v = await liveVerso();
console.log('at', await label(), '| left page belongs to leaf', v.idx, '(carries the front cover)');
await page.mouse.move(v.x+110, v.y+v.h-110);
await new Promise(r=>setTimeout(r,450));
console.log('  hover its corner   -> folds:', await folds(), '(expect 0 — board)');
await page.mouse.click(v.x+110, v.y+v.h-110);
await new Promise(r=>setTimeout(r,1400));
console.log('  click it           ->', await label(), '| folds:', await folds(), '(expect Bìa trước, plain swing)');

/* a paper leaf must still curl */
await page.evaluate(()=>{const b=document.getElementById('flip-next');b.click();b.click();});
await new Promise(r=>setTimeout(r,1900));
v = await liveVerso();
console.log('\nat', await label(), '| left page belongs to leaf', v.idx, '(paper)');
await page.mouse.move(v.x+110, v.y+v.h-110);
await new Promise(r=>setTimeout(r,450));
console.log('  hover its corner   -> folds:', await folds(), '(expect 1)');
await page.mouse.click(v.x+110, v.y+v.h-110);
await new Promise(r=>setTimeout(r,1500));
console.log('  click it           ->', await label(), '| folds:', await folds());

/* last leaf carries the back cover */
await page.evaluate(()=>{const b=document.getElementById('flip-next');for(let i=0;i<8;i++)b.click();});
await new Promise(r=>setTimeout(r,8000));
await page.evaluate(()=>document.getElementById('flip-prev').click());
await new Promise(r=>setTimeout(r,1500));
const r0 = await liveRecto();
console.log('\nat', await label(), '| right page belongs to leaf', r0 ? r0.idx : '-', '(carries the back cover)');
if (r0) {
  await page.mouse.move(r0.x+r0.w-110, r0.y+r0.h-110);
  await new Promise(r=>setTimeout(r,450));
  console.log('  hover its corner   -> folds:', await folds(), '(expect 0 — board)');
}
await browser.close();
