import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
console.log(await p.evaluate(()=>{
  const mb=document.querySelector('.mapbox').getBoundingClientRect();
  const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return{l:Math.round(b.left-mb.left),t:Math.round(b.top-mb.top),r:Math.round(b.right-mb.left),b:Math.round(b.bottom-mb.top)}};
  return JSON.stringify({box:{w:Math.round(mb.width),h:Math.round(mb.height)},tagL:r('.mapbox__tag--left'),credit:r('.mapbox__credit'),nav:r('.mapbox__nav')},null,1);
}));
await b.close();
