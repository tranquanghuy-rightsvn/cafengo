import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,600));
const L=()=>page.evaluate(()=>document.getElementById('flip-label').textContent);

// go to the back cover via the nav button
await page.evaluate(()=>{const b=document.getElementById('flip-next');for(let i=0;i<7;i++)b.click();});
await new Promise(r=>setTimeout(r,1400));
console.log('at back cover            ', await L());

// "Lật về trang đầu" must jump home, not flip one step
const r = await page.evaluate(async ()=>{
  const b=document.getElementById('flip-restart');
  const vis=b.getBoundingClientRect().width>0;
  b.click(); await new Promise(x=>setTimeout(x,1100));
  return vis+' | '+document.getElementById('flip-label').textContent;
});
console.log('click "Lật về trang đầu" ', r);

// arrows / dots / keyboard still work
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(x=>setTimeout(x,1000));
console.log('arrow next               ', await L());
await page.keyboard.press('ArrowRight'); await new Promise(x=>setTimeout(x,1000));
console.log('key ArrowRight           ', await L());
await page.keyboard.press('ArrowLeft'); await new Promise(x=>setTimeout(x,1000));
console.log('key ArrowLeft            ', await L());
await page.evaluate(()=>document.querySelectorAll('#flip-dots button')[7].click());
await new Promise(x=>setTimeout(x,1000));
console.log('dot #7                   ', await L());
await browser.close();
