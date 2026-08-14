import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:2}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,700));
const spreads = Number(process.env.SPREAD||0);
if (spreads) { await page.evaluate((n)=>{const b=document.getElementById('flip-next');for(let i=0;i<n;i++)b.click();},spreads); await new Promise(r=>setTimeout(r,1400)); }
const b = await page.evaluate(()=>{const f=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].find(x=>x.getBoundingClientRect().width>0);const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,sx:scrollX,sy:scrollY};});
const [dx,dy] = (process.env.AT||'45,45').split(',').map(Number);
await page.mouse.move(b.x+b.w-dx, b.y+b.h-dy);
await new Promise(r=>setTimeout(r,500));
// crop the bottom-right region of the page
await page.screenshot({path:process.env.OUT||'shots/peel.png', clip:{x:b.sx+b.x+b.w-300, y:b.sy+b.y+b.h-300, width:310, height:305}});
console.log('shot', process.env.OUT, 'at offset', dx, dy);
await browser.close();
