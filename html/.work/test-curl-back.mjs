import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,180)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>{const b=document.getElementById('flip-next');b.click();b.click();});
await new Promise(r=>setTimeout(r,1800));
const label = () => page.evaluate(()=>String(document.querySelectorAll('.leaf.is-flipped').length));
const folds = () => page.evaluate(()=>[...document.querySelectorAll('.peel-fold')].filter(x=>x.classList.contains('is-lifted')).length);
const box = sel => page.evaluate(s=>{const f=[...document.querySelectorAll(s)].find(x=>x.getBoundingClientRect().width>1);const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};},sel);

console.log('start                :', await label());
/* grab the LEFT page's bottom-left corner and turn back */
const v = await box('.leaf.is-flipped .leaf__face--back');
await page.mouse.move(v.x+110, v.y+v.h-110);
await new Promise(r=>setTimeout(r,350));
console.log('verso corner held    : folds =', await folds());
await page.mouse.down(); await page.mouse.up();
await new Promise(r=>setTimeout(r,260));
console.log('mid-curl             : folds =', await folds());
await new Promise(r=>setTimeout(r,900));
console.log('landed               :', await label(), '| folds =', await folds(), '(expect Trang 1 / 12, 0)');

/* and forward again from the recto */
const f = await box('.leaf:not(.is-flipped) .leaf__face--front');
await page.mouse.move(f.x+f.w-110, f.y+110);   // top-right corner this time
await new Promise(r=>setTimeout(r,350));
console.log('recto top corner held: folds =', await folds());
await page.mouse.down(); await page.mouse.up();
await new Promise(r=>setTimeout(r,1200));
console.log('landed               :', await label(), '| folds =', await folds(), '(expect Trang 3 / 12, 0)');
await browser.close();
