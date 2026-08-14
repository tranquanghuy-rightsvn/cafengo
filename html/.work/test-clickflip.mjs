import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>document.getElementById('menu').scrollIntoView());
await new Promise(r=>setTimeout(r,600));

const label = () => page.evaluate(()=>document.getElementById('flip-label').textContent);
const box   = () => page.evaluate(()=>{const r=document.getElementById('flip-spread').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});

async function clickAt(fracX, fracY) {
  const b = await box();
  await page.mouse.click(b.x + b.w*fracX, b.y + b.h*fracY);
  await new Promise(r=>setTimeout(r,1100));
}

console.log('start           ', await label());

// right half, several spots
await clickAt(0.75, 0.5);  console.log('click right mid ', await label());
await clickAt(0.95, 0.1);  console.log('click right top ', await label());
await clickAt(0.60, 0.9);  console.log('click right low ', await label());
// left half
await clickAt(0.25, 0.5);  console.log('click left  mid ', await label());
await clickAt(0.05, 0.9);  console.log('click left  edge', await label());
await clickAt(0.40, 0.2);  console.log('click left  near', await label());
// clamp at start
await clickAt(0.2, 0.5);   console.log('click left @0   ', await label());
await clickAt(0.2, 0.5);   console.log('click left again', await label());

// a "+ Chọn món" button must NOT flip
await clickAt(0.75, 0.5);  console.log('open to spread1 ', await label());
const btnFlipped = await page.evaluate(async ()=>{
  const before = document.getElementById('flip-label').textContent;
  const b=[...document.querySelectorAll('.leaf:not(.is-flipped) .dish__add')].find(x=>x.getBoundingClientRect().width>0);
  if(!b) return 'no button visible';
  b.click();
  await new Promise(r=>setTimeout(r,900));
  return before+' -> '+document.getElementById('flip-label').textContent;
});
console.log('click dish btn  ', btnFlipped);

// selecting text must NOT flip
const selFlipped = await page.evaluate(async ()=>{
  const before = document.getElementById('flip-label').textContent;
  const p=[...document.querySelectorAll('.leaf:not(.is-flipped) .dish__desc')].find(x=>x.getBoundingClientRect().width>0);
  const range=document.createRange(); range.selectNodeContents(p);
  const s=window.getSelection(); s.removeAllRanges(); s.addRange(range);
  p.dispatchEvent(new MouseEvent('click',{bubbles:true, clientX:1200, clientY:600}));
  await new Promise(r=>setTimeout(r,900));
  const after = document.getElementById('flip-label').textContent;
  s.removeAllRanges();
  return before+' -> '+after;
});
console.log('click w/ select ', selFlipped);
await browser.close();
