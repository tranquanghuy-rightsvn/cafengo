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
await new Promise(r=>setTimeout(r,350));

/* sample the whole turn from inside the page, recording geometry + stacking */
const trace = await page.evaluate(async () => {
  const rec = [];
  let stop = false;
  (function sample(){
    const leaf=document.querySelector('.leaf.is-turning');
    const face=leaf && leaf.querySelector('.leaf__face--front');
    if (leaf && face) {
      
      const svg=leaf.querySelector('.peel-fold');
      const pts=svg.querySelector('.peel-fold__paper').getAttribute('points').split(' ').map(p=>p.split(',').map(Number));
      const back=leaf.querySelector('.peel-back');
      const fr=face.getBoundingClientRect();
      const flapRect=svg.querySelector('.peel-fold__paper').getBoundingClientRect();
      rec.push({
        tipX: Math.round(pts[2][0]),
        flapLeftPx: Math.round(flapRect.left),
        faceLeftPx: Math.round(fr.left),
        leafZ: leaf.style.zIndex,
        faceOverflow: getComputedStyle(face).overflow,
        backOverflow: getComputedStyle(back).overflow,
      });
    } else if (rec.length) stop = true;
    if (!stop) requestAnimationFrame(sample);
  })();
  document.querySelector('.leaf:not(.is-flipped) .leaf__face--front').click();
  await new Promise(r=>setTimeout(r,1400));
  return rec;
});

console.log('frames during turn:', trace.length);
const spineX = f.x;               // the left edge of the right-hand page
[0,0.25,0.5,0.75,0.95].forEach(p=>{
  const k = Math.min(trace.length-1, Math.round(p*(trace.length-1)));
  const s = trace[k];
  console.log(('t=' + p.toFixed(2)).padEnd(8),
    'tipX(page)=' + String(s.tipX).padStart(6),
    '| flap left edge on screen=' + String(s.flapLeftPx).padStart(6),
    '| spine at ' + Math.round(spineX),
    s.flapLeftPx < spineX - 2 ? '-> crossed the spine' : '',
    '| leaf z=' + s.leafZ, '| face overflow=' + s.faceOverflow, '| back overflow=' + s.backOverflow);
});
/* z-index of the other half while the turn plays */
console.log('\nrestored after turn:', await page.evaluate(()=>{
  const l=[...document.querySelectorAll('.leaf')].map(x=>x.style.zIndex).join(',');
  const t=document.querySelectorAll('.leaf__face.is-turning').length;
  return 'leaf z-indexes = ['+l+'], faces still marked turning = '+t;
}));
await browser.close();
