import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/html-light/',{waitUntil:'networkidle2'});
await p.addStyleTag({content:'*{animation:none!important}'});
await new Promise(r=>setTimeout(r,900));
const geo=await p.evaluate(()=>{
  const o={};
  [['badge','.hero__badge'],['kicker','.hero__kicker'],['title','.hero__title'],['lede','.hero__lede'],['place','.hero__place'],['cta','.hero__cta--outline']].forEach(([k,sel])=>{
    const e=document.querySelector(sel); const r=e.getBoundingClientRect();
    o[k]={x0:Math.round(r.left),x1:Math.round(r.right),y:Math.round(r.top+r.height/2),fg:getComputedStyle(e).color};
  });
  return o;
});
fs.writeFileSync('shots/_hero_probe.png', await p.screenshot({clip:{x:0,y:0,width:1440,height:900}}));
fs.writeFileSync('shots/_hero_geo.json', JSON.stringify(geo));
console.log(JSON.stringify(geo));
await b.close();
