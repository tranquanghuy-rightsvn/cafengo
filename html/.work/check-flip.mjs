import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>document.getElementById('menu').scrollIntoView());
await new Promise(r=>setTimeout(r,600));
for (const n of [1,2,7]) {
  await page.evaluate((k)=>{
    const btn=document.getElementById('flip-next');
    for(let i=0;i<k;i++) btn.click();
  }, n===1?1:(n===2?1:5));
  await new Promise(r=>setTimeout(r,1400));
  const info = await page.evaluate(()=>({label:document.getElementById('flip-label').textContent, prevDisabled:document.getElementById('flip-prev').disabled, nextDisabled:document.getElementById('flip-next').disabled}));
  console.log('spread', n, JSON.stringify(info));
  const el = await page.$('.flip-book__inner');
  await el.screenshot({path:`shots/flip-${n}.png`});
}
await browser.close();
