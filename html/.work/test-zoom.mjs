import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1400));
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));
const fig = await page.evaluate(()=>{
  const f=[...document.querySelectorAll('.leaf.is-flipped .leaf__face--back .page-intro__figure')].find(x=>x.getBoundingClientRect().width>1);
  if(!f) return null;
  const r=f.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height};
});
console.log('figure on the verso:', JSON.stringify(fig));
const t = () => page.evaluate(()=>{
  const f=[...document.querySelectorAll('.leaf.is-flipped .leaf__face--back .page-intro__figure')].find(x=>x.getBoundingClientRect().width>1);
  return f ? getComputedStyle(f.querySelector('img')).transform : 'no figure';
});
console.log('img transform, pointer away :', await t());
await page.mouse.move(fig.x+fig.w/2, fig.y+fig.h/2);
await new Promise(r=>setTimeout(r,900));
console.log('img transform, pointer over :', await t());
await browser.close();
