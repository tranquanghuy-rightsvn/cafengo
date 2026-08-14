import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,140)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));   // let smooth scrolling finish
/* the covers are board and never fold, so open onto a paper spread first */
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const faceRect = () => page.evaluate(()=>{const f=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>0);const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
const b = await faceRect();
console.log('page', b.w+'x'+b.h, '| caps: bottom leg <=', (0.8*b.w).toFixed(0), ', right leg <=', (0.8*b.h).toFixed(0));
async function probe(dx,dy,tag){
  const f = await faceRect();               // re-read: the page may still be settling
  await page.mouse.move(f.x+f.w-dx, f.y+f.h-dy);
  await new Promise(r=>setTimeout(r,220));
  const p = await page.evaluate(()=>{
    const s=[...document.querySelectorAll('.peel-fold')].find(s=>s.classList.contains('is-lifted'));
    if(!s) return null;
    return s.querySelector('.peel-fold__paper').getAttribute('points');
  });
  if(!p){console.log(tag.padEnd(22),'not lifted');return;}
  const [p1,p2,p3]=p.split(' ').map(s=>s.split(',').map(Number));
  const bottomLeg = f.w - p1[0];      // how far left of the corner the crease starts
  const rightLeg  = f.h - p2[1];      // how far up the right edge it ends
  const inside = p1[0]>=-0.5 && p2[1]>=-0.5;
  console.log(tag.padEnd(22),'bottomLeg='+bottomLeg.toFixed(1).padStart(6),' rightLeg='+rightLeg.toFixed(1).padStart(6),
              ' tip=('+p3[0].toFixed(0)+','+p3[1].toFixed(0)+')', inside?'OK':'OUT OF PAGE');
}
await probe(1,190,'cursor on R edge');
await probe(3,150,'3px from R edge');
await probe(10,190,'10px from R edge');
await probe(190,1,'cursor on B edge');
await probe(190,4,'4px from B edge');
await probe(120,120,'diagonal 120');
await probe(60,60,'diagonal 60');
await browser.close();
