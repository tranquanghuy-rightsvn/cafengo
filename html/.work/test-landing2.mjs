import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const f = await page.evaluate(()=>{const e=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>1);const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
await page.mouse.move(f.x+f.w-100, f.y+f.h-100);
await new Promise(r=>setTimeout(r,350));
await page.mouse.down(); await page.mouse.up();
await new Promise(r=>setTimeout(r,1500));

const out = await page.evaluate(() => {
  /* the inline values from the final painted frame survive the turn */
  const face=[...document.querySelectorAll('.leaf.is-flipped .leaf__face--front')].pop();
  const inner=face && face.querySelector('.peel-back__inner');
  const svg=face && face.querySelector('.peel-fold');
  const pts=svg && svg.querySelector('.peel-fold__paper').getAttribute('points').split(' ').map(p=>p.split(',').map(Number));
  return {
    finalTransform: inner ? inner.style.transform : null,
    finalCrease: pts ? [pts[0][0], pts[1][0]] : null,
    finalTip: pts ? pts[2][0] : null,
    pageW: face ? face.getBoundingClientRect().width : null,
  };
});
console.log('final painted frame (values retained after the turn):');
console.log('  crease x   :', out.finalCrease.map(v=>v.toFixed(2)).join(' / '), '   (0 = exactly on the spine)');
console.log('  tip x      :', out.finalTip.toFixed(2), '  (-page width = exactly the far edge; page =', out.pageW + ')');
console.log('  transform  :', out.finalTransform);
const m = out.finalTransform.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number);
console.log('\n  -> horizontal shift', m[4].toFixed(2)+'px vs the ideal', (-out.pageW).toFixed(2)+'px  =>  gap', (m[4]+out.pageW).toFixed(2)+'px');
console.log('  -> vertical shift  ', m[5].toFixed(2)+'px (ideal 0)');
console.log('  -> scale/rotation terms', m[0].toFixed(4), m[1].toFixed(4), m[2].toFixed(4), m[3].toFixed(4), '(ideal 1, 0, 0, 1)');
await browser.close();
