import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('console',m=>console.log('  [page]',m.text()));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>document.getElementById('menu').scrollIntoView());
await new Promise(r=>setTimeout(r,600));
await page.evaluate(()=>{document.getElementById('flip-spread').addEventListener('click',e=>{
  const t=e.target;
  console.log('CLICK target='+t.tagName+'.'+((t.className||'').toString().split(' ')[0])+
    ' closestCtl='+(t.closest('button, a, input, textarea, select, label')?'YES':'no')+
    ' scroller='+(t.closest('.page-list, .cover--back')?'YES':'no'));
},true);});
const b = await page.evaluate(()=>{const r=document.getElementById('flip-spread').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
console.log('spread box', JSON.stringify(b));
async function c(fx,fy,tag){ console.log('--- click',tag,'at frac',fx,fy);
  await page.mouse.click(b.x+b.w*fx, b.y+b.h*fy); await new Promise(r=>setTimeout(r,1000));
  console.log('    label =', await page.evaluate(()=>document.getElementById('flip-label').textContent)); }
await c(0.75,0.5,'right-mid');
await c(0.60,0.9,'right-low');
await c(0.85,0.6,'right-mid2');
await browser.close();
