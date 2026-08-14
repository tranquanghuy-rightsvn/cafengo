import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { PNG } from 'pngjs';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1400,height:900,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1400));
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const bk = await page.evaluate(()=>{const e=document.querySelector('.flip-book__inner');const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};});
const f = await page.evaluate(()=>{const e=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>1);const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
await page.mouse.move(f.x+f.w-100, f.y+f.h-100);
await new Promise(r=>setTimeout(r,350));
const clip = {x:bk.x, y:bk.y, width:bk.w, height:bk.h};
const shots = [];
shots.push(await page.screenshot({clip, encoding:'binary'}));   // held
await page.mouse.down(); await page.mouse.up();
for (let i=0;i<5;i++){ await new Promise(r=>setTimeout(r,130)); shots.push(await page.screenshot({clip, encoding:'binary'})); }
await new Promise(r=>setTimeout(r,600));
shots.push(await page.screenshot({clip, encoding:'binary'}));   // landed
/* stitch into a 2-row contact sheet, quarter size */
const imgs = shots.map(b=>PNG.sync.read(b));
const s = 4, cw = Math.floor(imgs[0].width/s), ch = Math.floor(imgs[0].height/s);
const cols = 4, rows = Math.ceil(imgs.length/cols);
const out = new PNG({width: cw*cols, height: ch*rows});
imgs.forEach((im,k)=>{
  const ox=(k%cols)*cw, oy=Math.floor(k/cols)*ch;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
    const si=(im.width*(y*s)+(x*s))<<2, di=(out.width*(y+oy)+(x+ox))<<2;
    out.data[di]=im.data[si];out.data[di+1]=im.data[si+1];out.data[di+2]=im.data[si+2];out.data[di+3]=255;
  }
});
fs.writeFileSync('shots/curl-film.png', PNG.sync.write(out));
console.log('frames:', imgs.length, '-> shots/curl-film.png');
await browser.close();
