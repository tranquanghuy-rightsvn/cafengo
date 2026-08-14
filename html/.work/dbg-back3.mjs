import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,200)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>{const b=document.getElementById('flip-next');b.click();b.click();b.click();});
await new Promise(r=>setTimeout(r,2400));
const rect = await page.evaluate(()=>{
  const top=[...document.querySelectorAll('.leaf.is-flipped')].sort((a,b)=>(+b.style.zIndex||0)-(+a.style.zIndex||0))[0];
  const r=top.querySelector('.leaf__face--back').getBoundingClientRect();
  return {x:r.left,y:r.top,w:r.width,h:r.height};
});
const cx = rect.x+110, cy = rect.y+rect.h-110;
await page.mouse.move(cx,cy);
await new Promise(r=>setTimeout(r,450));
await page.evaluate(([x,y])=>{window.__cx=x;window.__cy=y;},[cx,cy]);

const trace = await page.evaluate(async ()=>{
  const rec=[]; let stop=false;
  (function s(){
    const leaf=document.querySelector('.leaf.is-turning');
    if(leaf){
      const svg=leaf.querySelector('.peel-fold');
      const poly=svg.querySelector('.peel-fold__paper');
      const pr=poly.getBoundingClientRect();
      rec.push({pts:poly.getAttribute('points').split(' ').map(p=>Math.round(+p.split(',')[0])).join('/'),
                l:Math.round(pr.left), r:Math.round(pr.right),
                svgT:svg.style.transform||'(none)', parent:svg.parentElement.className.split(' ')[0],
                svgComputed:getComputedStyle(svg).transform.slice(0,30)});
    } else if(rec.length) stop=true;
    if(!stop) requestAnimationFrame(s);
  })();
  document.elementFromPoint(window.__cx, window.__cy).dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:window.__cx,clientY:window.__cy}));
  await new Promise(r=>setTimeout(r,1300));
  return rec;
});
console.log('frames', trace.length);
[0,0.3,0.6,0.99].forEach(k=>{
  const s=trace[Math.min(trace.length-1,Math.round(k*(trace.length-1)))];
  console.log('t='+k.toFixed(2), 'poly x:', s.pts.padEnd(20), 'screen', String(s.l).padStart(5), String(s.r).padStart(5),
              '| parent', s.parent, '| inline T', s.svgT, '| computed', s.svgComputed);
});
await browser.close();
