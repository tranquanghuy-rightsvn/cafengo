import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
fs.mkdirSync('shots',{recursive:true});
const W=Number(process.env.W||1440), URL=process.env.URL, TAG=process.env.TAG, THEME=process.env.THEME||'dark';
const SECTIONS={header:'header',hero:'#home',menu:'#menu',gallery:'#gallery',story:'#story',testimonials:'#testimonials',contact:'#contact',footer:'footer'};
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars','--force-device-scale-factor=1'],defaultViewport:{width:W,height:1000,deviceScaleFactor:1}});
const p=await b.newPage();
await p.evaluateOnNewDocument(t=>{try{localStorage.setItem('ngo-theme',t)}catch(e){}},THEME);
await p.goto(URL,{waitUntil:'networkidle2'});
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
await p.evaluate(async()=>{const m=document.documentElement.scrollHeight;for(let y=0;y<m;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,110));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,900));});
await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}#cursor-glow,.cursor-glow{display:none!important}'});
await new Promise(r=>setTimeout(r,500));
for (const [k,sel] of Object.entries(SECTIONS)) {
  await p.evaluate(h=>{document.querySelectorAll('body *').forEach(e=>{if(getComputedStyle(e).position==='fixed')e.style.visibility=h?'hidden':''})}, k!=='header');
  const el=await p.$(sel); if(!el){console.log('thiếu',k);continue;}
  await el.screenshot({path:`shots/${TAG}-${k}-${W}.png`,captureBeyondViewport:true});
}
await b.close();
