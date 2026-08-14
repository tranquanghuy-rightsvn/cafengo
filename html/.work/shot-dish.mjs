import puppeteer from 'puppeteer-core';
const W = Number(process.env.W||375);
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:W,height:1000,deviceScaleFactor:2}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
if (W >= 768) {
  await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
  await new Promise(r=>setTimeout(r,1400));
  await page.evaluate(()=>document.getElementById('flip-next').click());
  await new Promise(r=>setTimeout(r,1500));
  const el = await page.$('.leaf:not(.is-flipped) .leaf__face--front .page-list');
  await el.screenshot({path:'shots/dish-desktop.png'});
} else {
  await page.evaluate(()=>document.querySelector('.menu-panels').scrollIntoView());
  await new Promise(r=>setTimeout(r,700));
  const el = await page.$('.menu-panel.is-active .menu-panel__list');
  await el.screenshot({path:'shots/dish-mobile.png'});
}
console.log('ok');
await browser.close();
