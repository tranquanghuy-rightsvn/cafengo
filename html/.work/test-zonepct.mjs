import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
for (const W of [1920, 1366, 1024, 900, 800]) {
  const page = await browser.newPage();
  await page.setViewport({width:W, height:1080, deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
  await new Promise(r=>setTimeout(r,1100));
  await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
  await new Promise(r=>setTimeout(r,1300));
  await page.evaluate(()=>document.getElementById('flip-next').click());
  await new Promise(r=>setTimeout(r,1400));
  const b = await page.evaluate(()=>{const f=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>1);if(!f)return null;const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
  if(!b){ console.log(String(W).padStart(5),'no book (mobile list)'); await page.close(); continue; }
  const lifted = () => page.evaluate(()=>[...document.querySelectorAll('.peel-fold')].some(x=>x.classList.contains('is-lifted')));
  /* walk inwards from the corner and find where the fold stops responding */
  let edge = 0;
  for (let d = 4; d < b.w; d += 2) {
    await page.mouse.move(b.x+b.w-d, b.y+b.h-d);
    await new Promise(r=>setTimeout(r,45));
    if (await lifted()) edge = d; else if (edge) break;
  }
  console.log('viewport', String(W).padStart(5), '| page', String(Math.round(b.w)).padStart(4)+'px',
              '| grab reach', String(edge).padStart(4)+'px', '| =', (edge/b.w*100).toFixed(1)+'% of page width');
  await page.close();
}
await browser.close();
