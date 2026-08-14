import puppeteer from 'puppeteer-core';
const W=768;
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:W,height:1000,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('https://albi-coffe.netlify.app/',{waitUntil:'networkidle2',timeout:90000});
await new Promise(r=>setTimeout(r,3000));
await page.evaluate(()=>document.getElementById('menu').scrollIntoView());
await new Promise(r=>setTimeout(r,2000));
for(let i=0;i<8;i++){ await page.evaluate(()=>{const b=[...document.querySelectorAll('#menu button')].find(x=>x.getAttribute('aria-label')==='Trang sau'); if(b&&!b.disabled)b.click();}); await new Promise(r=>setTimeout(r,1300)); }
const info = await page.evaluate(()=>{
  const b=[...document.querySelectorAll('#menu button')].find(x=>/Lật Về Trang Đầu/i.test(x.textContent));
  if(!b) return 'button not found';
  const r=b.getBoundingClientRect();
  return {w:Math.round(r.width),h:Math.round(r.height),sh:b.scrollHeight,ch:b.clientHeight,overflow:getComputedStyle(b).overflow};
});
console.log(JSON.stringify(info));
const el = await page.$('.main-book');
if(el) await el.screenshot({path:'shots/orig-backcover-768.png'});
await browser.close();
