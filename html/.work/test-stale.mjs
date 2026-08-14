import puppeteer from 'puppeteer-core';
const W = Number(process.env.W||1920);
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:W,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,160)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));

const lifted = () => page.evaluate(()=>[...document.querySelectorAll('.peel-fold')].filter(x=>x.classList.contains('is-lifted')).length);
const box = sel => page.evaluate(s=>{const f=[...document.querySelectorAll(s)].find(x=>x.getBoundingClientRect().width>1);if(!f)return null;const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};},sel);
const label = () => page.evaluate(()=>String(document.querySelectorAll('.leaf.is-flipped').length));

/* open to a paper spread, hold a corner, then turn the leaf without moving the mouse */
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const b = await box('.leaf:not(.is-flipped) .leaf__face--front');
await page.mouse.move(b.x+b.w-100, b.y+b.h-100);
await new Promise(r=>setTimeout(r,400));
console.log('holding a paper corner        -> folds:', await lifted(), '| at', await label());

/* close the book with the nav button, mouse stays put */
await page.evaluate(()=>document.getElementById('flip-prev').click());
await new Promise(r=>setTimeout(r,1500));
console.log('after closing to the cover    -> folds:', await lifted(), '| at', await label(), '(expect 0)');

/* and the reverse: hold a corner then turn forward */
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const b2 = await box('.leaf:not(.is-flipped) .leaf__face--front');
await page.mouse.move(b2.x+b2.w-100, b2.y+b2.h-100);
await new Promise(r=>setTimeout(r,400));
console.log('holding again                 -> folds:', await lifted());
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
console.log('after turning forward         -> folds:', await lifted(), '| at', await label(), '(expect 0)');

/* jump straight to the back cover while holding */
const b3 = await box('.leaf:not(.is-flipped) .leaf__face--front');
await page.mouse.move(b3.x+b3.w-100, b3.y+b3.h-100);
await new Promise(r=>setTimeout(r,400));
console.log('holding before jump           -> folds:', await lifted());
await page.evaluate(()=>{const d=document.querySelectorAll('#flip-dots button');d[d.length-1].click();});
await new Promise(r=>setTimeout(r,1600));
console.log('after jumping to back cover   -> folds:', await lifted(), '| at', await label(), '(expect 0)');
await browser.close();
