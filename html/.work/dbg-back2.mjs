import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,200)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>{const b=document.getElementById('flip-next');b.click();b.click();});
await new Promise(r=>setTimeout(r,1900));

/* the verso on show is the highest-stacked flipped leaf */
const info = await page.evaluate(()=>{
  const flipped=[...document.querySelectorAll('.leaf.is-flipped')];
  const top=flipped.sort((a,b)=>(+b.style.zIndex||0)-(+a.style.zIndex||0))[0];
  const f=top.querySelector('.leaf__face--back');
  const r=f.getBoundingClientRect();
  return {z:top.style.zIndex, idx:[...document.querySelectorAll('.leaf')].indexOf(top), rect:{x:r.left,y:r.top,w:r.width,h:r.height}};
});
console.log('live verso: leaf index', info.idx, 'z', info.z, 'rect', JSON.stringify(info.rect));

await page.mouse.move(info.rect.x+110, info.rect.y+info.rect.h-110);
await new Promise(r=>setTimeout(r,450));
const hov = await page.evaluate(()=>{
  const flipped=[...document.querySelectorAll('.leaf.is-flipped')];
  const top=flipped.sort((a,b)=>(+b.style.zIndex||0)-(+a.style.zIndex||0))[0];
  const f=top.querySelector('.leaf__face--back');
  const svg=f.querySelector('.peel-fold');
  if(!svg) return {built:false};
  const poly=svg.querySelector('.peel-fold__paper');
  const pr=poly.getBoundingClientRect();
  return {built:true, lifted:svg.classList.contains('is-lifted'), points:poly.getAttribute('points'),
          screen:{l:Math.round(pr.left),r:Math.round(pr.right)}, faceRect:Math.round(f.getBoundingClientRect().left)};
});
console.log('hover verso corner ->', JSON.stringify(hov));
await browser.close();
