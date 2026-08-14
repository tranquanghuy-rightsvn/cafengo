import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
fs.mkdirSync('shots',{recursive:true});
const W=Number(process.env.W||1440), SEL=process.env.SEL, OUT=process.env.OUT;
const URL=process.env.URL||'http://127.0.0.1:8899/html-light/';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars','--force-device-scale-factor=1'],defaultViewport:{width:W,height:1000,deviceScaleFactor:1}});
const p=await b.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errs.push(r.status()+' '+r.url())});
await p.goto(URL,{waitUntil:'networkidle2'});
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
await p.evaluate(async()=>{const m=document.documentElement.scrollHeight;for(let y=0;y<m;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,110));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,700));});
if(SEL){await p.evaluate(s=>document.querySelector(s).scrollIntoView({block:'center'}),SEL);await new Promise(r=>setTimeout(r,1500));}
await p.addStyleTag({content:'*,*::before,*::after{animation-play-state:paused!important}#cursor-glow{display:none!important}'});
await p.evaluate(k=>{document.querySelectorAll('body *').forEach(e=>{if(getComputedStyle(e).position==='fixed'&&k)e.style.visibility='hidden'})},SEL!=='header');
if(SEL){await (await p.$(SEL)).screenshot({path:OUT,captureBeyondViewport:true});}
else {await p.screenshot({path:OUT,fullPage:false});}
console.log(OUT,'| lỗi:',errs.length?errs:'không');
await b.close();
