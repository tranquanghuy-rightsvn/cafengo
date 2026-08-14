import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,180)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const f = await page.evaluate(()=>{const e=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>1);const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
await page.mouse.move(f.x+f.w-100, f.y+f.h-100);
await new Promise(r=>setTimeout(r,400));

const trace = await page.evaluate(async () => {
  const rec = []; let stop = false;
  (function sample(){
    const leaf=document.querySelector('.leaf.is-turning');
    const face=leaf && leaf.querySelector('.leaf__face--front');
    if (leaf && face) {
      const svg=leaf.querySelector('.peel-fold');
      const inner=leaf.querySelector('.peel-back__inner');
      rec.push({
        shade: +getComputedStyle(svg).opacity,
        lift: getComputedStyle(inner).filter,
      });
    } else if (rec.length) stop = true;
    if (!stop) requestAnimationFrame(sample);
  })();
  document.querySelector('.leaf:not(.is-flipped) .leaf__face--front').click();
  await new Promise(r=>setTimeout(r,1400));
  return rec;
});
console.log('frames:', trace.length);
[0, 0.25, 0.5, 0.75, 0.9, 1].forEach(p=>{
  const k = Math.min(trace.length-1, Math.round(p*(trace.length-1)));
  console.log(('t=' + p.toFixed(2)).padEnd(8), 'shading opacity =', trace[k].shade.toFixed(3), ' | reverse lighting =', trace[k].lift);
});
console.log('\nlast frame  -> shading', trace[trace.length-1].shade.toFixed(3), '| lighting', trace[trace.length-1].lift, '  (flat page = none / brightness(1))');
await browser.close();
