import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:375,height:812}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
console.log(await p.evaluate(()=>{
  const bd=document.querySelector('.philosophy__badge');
  const h5=bd.querySelector('h5');
  const ic=h5.querySelector('.icon');
  const r=x=>{const b=x.getBoundingClientRect();return {l:Math.round(b.left),r:Math.round(b.right),w:Math.round(b.width),h:Math.round(b.height)}};
  return JSON.stringify({vw:document.documentElement.clientWidth,badge:r(bd),h5:r(h5),icon:r(ic),
    h5text:h5.textContent.trim(), iconOverflow:getComputedStyle(ic).overflow,
    h5scrollW:h5.scrollWidth, h5clientW:h5.clientWidth, iconShrink:getComputedStyle(ic).flexShrink},null,1);
}));
await b.close();
