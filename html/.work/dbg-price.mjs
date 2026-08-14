import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:375,height:900,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>document.querySelector('.menu-panels').scrollIntoView());
await new Promise(r=>setTimeout(r,600));
const info = await page.evaluate(()=>{
  const dish=document.querySelector('.menu-panel.is-active .dish');
  const main=dish.querySelector('.dish__main');
  const side=dish.querySelector('.dish__side');
  const price=dish.querySelector('.dish__price');
  const list=document.querySelector('.menu-panel.is-active .menu-panel__list');
  const card=document.querySelector('.menu-panel.is-active .menu-panel__card');
  const box=e=>{const r=e.getBoundingClientRect();return {l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width*10)/10,h:Math.round(r.height*10)/10};};
  return {
    card:box(card), list:box(list), dish:box(dish), main:box(main), side:box(side), price:box(price),
    priceScrollW: price.scrollWidth, priceClientW: price.clientWidth,
    sideOverflow: getComputedStyle(side).overflow,
    listOverflow: getComputedStyle(list).overflow,
    cardOverflow: getComputedStyle(card).overflow,
    docScrollW: document.documentElement.scrollWidth, docClientW: document.documentElement.clientWidth,
  };
});
console.log(JSON.stringify(info,null,1));
await browser.close();
