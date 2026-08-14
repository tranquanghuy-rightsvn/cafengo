import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,140)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,700));

const faceBox = () => page.evaluate(()=>{
  const f=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>0);
  const r=f.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height};
});
const state = () => page.evaluate(()=>{
  const svg=[...document.querySelectorAll('.peel-fold')].find(s=>s.classList.contains('is-lifted'));
  if(!svg) return {lifted:false};
  const p=svg.querySelector('.peel-fold__paper');
  return {lifted:true, points:p.getAttribute('points')};
});

const b = await faceBox();
console.log('page face', JSON.stringify(b));
console.log('rest          ', JSON.stringify(await state()));

// diagonal-ish: 40px in from each edge
await page.mouse.move(b.x+b.w-40, b.y+b.h-40); await new Promise(r=>setTimeout(r,250));
console.log('cursor 40,40  ', JSON.stringify(await state()));
// near the right edge (a small) -> long fold along the bottom edge
await page.mouse.move(b.x+b.w-6, b.y+b.h-70); await new Promise(r=>setTimeout(r,250));
console.log('near R edge   ', JSON.stringify(await state()));
// near the bottom edge (b small) -> long fold up the right edge
await page.mouse.move(b.x+b.w-70, b.y+b.h-6); await new Promise(r=>setTimeout(r,250));
console.log('near B edge   ', JSON.stringify(await state()));
// deep corner
await page.mouse.move(b.x+b.w-78, b.y+b.h-78); await new Promise(r=>setTimeout(r,250));
console.log('deep 78,78    ', JSON.stringify(await state()));
// leave the zone
await page.mouse.move(b.x+b.w/2, b.y+b.h/2); await new Promise(r=>setTimeout(r,400));
console.log('left the zone ', JSON.stringify(await state()));
await browser.close();
