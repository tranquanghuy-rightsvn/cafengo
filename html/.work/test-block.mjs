import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,140)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,600));
// what element is on top inside the peel zone?
const top = await page.evaluate(()=>{
  const f=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>0);
  const r=f.getBoundingClientRect();
  const el=document.elementFromPoint(r.right-40, r.bottom-40);
  return el.tagName+'.'+((el.className||'').toString().split(' ')[0]);
});
console.log('topmost element inside zone:', top);
await browser.close();
