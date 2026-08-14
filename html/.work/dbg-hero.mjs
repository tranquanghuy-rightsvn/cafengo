import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/html-light/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
// lấy màu nền THẬT phía sau chữ bằng cách đọc pixel ảnh chụp
const shot=await p.screenshot({clip:{x:0,y:0,width:1440,height:900},encoding:'binary'});
const info=await p.evaluate(()=>{
  const r=e=>{const b=e.getBoundingClientRect();return {x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)}};
  return {title:{...r(document.querySelector('.hero__title')),c:getComputedStyle(document.querySelector('.hero__title')).color},
          lede:{...r(document.querySelector('.hero__lede')),c:getComputedStyle(document.querySelector('.hero__lede')).color},
          place:{...r(document.querySelector('.hero__place')),c:getComputedStyle(document.querySelector('.hero__place')).color,op:getComputedStyle(document.querySelector('.hero__place')).opacity}};
});
console.log(JSON.stringify(info,null,1));
import fs from 'node:fs'; fs.writeFileSync('shots/_hero_probe.png',shot);
await b.close();
