import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,600));
const b = await page.evaluate(()=>{const f=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>0);const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
for (const [dx,dy] of [[190,1],[190,4],[190,10],[190,30]]) {
  const X=b.x+b.w-dx, Y=b.y+b.h-dy;
  const el = await page.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?e.tagName+'.'+((e.className||'').toString().split(' ').slice(0,2).join('.')):'none';},[X,Y]);
  await page.mouse.move(X,Y); await new Promise(r=>setTimeout(r,200));
  const lifted = await page.evaluate(()=>!![...document.querySelectorAll('.peel-fold')].find(s=>s.classList.contains('is-lifted')));
  console.log('offset', String(dx).padStart(3), String(dy).padStart(3), '| elementFromPoint =', el.padEnd(34), '| lifted =', lifted);
}
await browser.close();
