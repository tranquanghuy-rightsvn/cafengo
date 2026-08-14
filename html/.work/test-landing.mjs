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

/* capture the very last curl frame, then the committed state */
const res = await page.evaluate(async () => {
  let last = null;
  let stop = false;
  (function sample(){
    const face=[...document.querySelectorAll('.leaf__face--front')].find(x=>x.classList.contains('is-turning'));
    if (face) {
      const svg=face.querySelector('.peel-fold');
      const pts=svg.querySelector('.peel-fold__paper').getAttribute('points').split(' ').map(p=>p.split(',').map(Number));
      const inner=face.querySelector('.peel-back__inner');
      const ir=inner.getBoundingClientRect();
      last = { crease:[pts[0][0],pts[1][0]], tipX:pts[2][0], innerLeft:ir.left, innerRight:ir.right, m:inner.style.transform };
    } else if (last) stop = true;
    if (!stop) requestAnimationFrame(sample);
  })();
  document.querySelector('.leaf:not(.is-flipped) .leaf__face--front').click();
  await new Promise(r=>setTimeout(r,1400));
  const verso=[...document.querySelectorAll('.leaf.is-flipped .leaf__face--back')].find(x=>x.getBoundingClientRect().width>1);
  const vr=verso.getBoundingClientRect();
  return { last, committed:{ left: vr.left, right: vr.right } };
});

const L = res.last, C = res.committed;
console.log('last curl frame  : crease x (page coords) =', L.crease.map(v=>v.toFixed(1)).join(' / '), ' tip x =', L.tipX.toFixed(1));
console.log('  mirrored copy on screen : left =', L.innerLeft.toFixed(1), ' right =', L.innerRight.toFixed(1));
console.log('  transform =', L.m);
console.log('committed page   : left =', C.left.toFixed(1), ' right =', C.right.toFixed(1));
console.log('\nlanding gap      : left', (L.innerLeft-C.left).toFixed(1)+'px', ' right', (L.innerRight-C.right).toFixed(1)+'px');
await browser.close();
