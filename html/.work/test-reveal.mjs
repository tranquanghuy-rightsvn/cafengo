import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1600,height:1000,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const f = await page.evaluate(()=>{const e=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>1);const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};});
/* the outer half of the right-hand page — the sheet leaves this area first */
const strip = {x:f.x+f.w*0.45, y:f.y+40, width:Math.round(f.w*0.5), height:f.h-80};

const oldPage = await page.screenshot({clip:strip, encoding:'binary'});   // spread 1 recto
await page.mouse.move(f.x-scrollXfix(), 0);
function scrollXfix(){return 0;}
await page.mouse.move(f.x + f.w - 100 - (await page.evaluate(()=>scrollX)), f.y + f.h - 100 - (await page.evaluate(()=>scrollY)));
await new Promise(r=>setTimeout(r,400));
await page.mouse.down(); await page.mouse.up();
/* 83% through the turn the sheet has cleared this strip */
await page.evaluate(async ()=>{ const t0=performance.now(); while(performance.now()-t0 < 5000) await new Promise(r=>requestAnimationFrame(r)); });
const turningNow = await page.evaluate(()=>!!document.querySelector('.leaf.is-turning'));
const clipNow = await page.evaluate(()=>{const l=document.querySelector('.leaf.is-turning');return l? l.querySelector('.leaf__face--front').style.clipPath.slice(0,60):'-';});
const midTurn = await page.screenshot({clip:strip, encoding:'binary'});
await new Promise(r=>setTimeout(r,1600));
const landed = await page.screenshot({clip:strip, encoding:'binary'});

const sim = (a,b)=>{const A=PNG.sync.read(a),B=PNG.sync.read(b);const d=new PNG({width:A.width,height:A.height});
  const bad=pixelmatch(A.data,B.data,d.data,A.width,A.height,{threshold:0.12,includeAA:true});
  return ((1-bad/(A.width*A.height))*100).toFixed(2)+'%';};
console.log('still turning when sampled :', turningNow);
console.log('face clip at that moment   :', clipNow);
console.log('\nouter strip of the right-hand page:');
console.log('  mid-turn  vs OLD page  :', sim(midTurn, oldPage));
console.log('  mid-turn  vs NEW page  :', sim(midTurn, landed), ' <- should be the high one');
fs.writeFileSync('shots/strip-mid.png', midTurn);
fs.writeFileSync('shots/strip-new.png', landed);
await browser.close();
