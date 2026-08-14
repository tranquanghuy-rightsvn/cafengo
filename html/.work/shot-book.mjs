import puppeteer from 'puppeteer-core';
const URL=process.env.URL||'http://127.0.0.1:8899/html-light/';
const N=Number(process.env.N||3);
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:1000,deviceScaleFactor:1}});
const p=await b.newPage();
await p.goto(URL,{waitUntil:'networkidle2'});
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
await p.evaluate(()=>document.getElementById('menu').scrollIntoView({block:'center'}));
await new Promise(r=>setTimeout(r,800));
for(let i=0;i<N;i++){
  await p.evaluate(()=>{const s=document.querySelector('.flip-spread');const r=s.getBoundingClientRect();s.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.75,clientY:r.top+r.height/2,bubbles:true}));});
  await new Promise(r=>setTimeout(r,1400));
}
await p.addStyleTag({content:'*,*::before,*::after{animation-play-state:paused!important}#cursor-glow{display:none!important}'});
await p.evaluate(()=>{document.querySelectorAll('body *').forEach(e=>{if(getComputedStyle(e).position==='fixed')e.style.visibility='hidden'})});
await (await p.$('.flip-book')).screenshot({path:process.env.OUT||'shots/book.png'});
console.log('ok');
await b.close();
