import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const b = await page.evaluate(()=>{const f=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>1);const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
await page.mouse.move(b.x+b.w-110, b.y+b.h-110);
await new Promise(r=>setTimeout(r,350));

/* record every animation frame of the curl inside the page */
const trace = await page.evaluate(async () => {
  const rec = [];
  const t0 = performance.now();
  let stop = false;
  (function sample() {
    const s = [...document.querySelectorAll('.peel-fold')].find(x => x.classList.contains('is-lifted'));
    if (s) {
      const pts = s.querySelector('.peel-fold__paper').getAttribute('points').split(' ').map(p => p.split(',').map(Number));
      rec.push([performance.now() - t0, pts[2][0]]);
    } else if (rec.length) { stop = true; }
    if (!stop) requestAnimationFrame(sample);
  })();
  document.querySelector('.leaf:not(.is-flipped) .leaf__face--front').click();
  await new Promise(r => setTimeout(r, 1200));
  return rec;
});

const x0 = trace[0][1];
const xEnd = trace[trace.length-1][1];
const span = x0 - xEnd;
console.log('frames captured:', trace.length, '| tip travelled', Math.round(span), 'px');
console.log('\n t/T     measured   linear   t²(old)   |measured-linear|');
const T = trace[trace.length-1][0];
[0.15,0.3,0.45,0.6,0.75,0.9,1].forEach(f=>{
  const target = f*T;
  let best = trace[0];
  for (const s of trace) if (Math.abs(s[0]-target) < Math.abs(best[0]-target)) best = s;
  const progress = (x0 - best[1]) / span;
  console.log('  ' + f.toFixed(2) + '    ' + progress.toFixed(3).padStart(7) + '   ' + f.toFixed(3).padStart(6) + '   ' + (f*f).toFixed(3).padStart(6) + '        ' + Math.abs(progress-f).toFixed(3).padStart(6));
});
await browser.close();
