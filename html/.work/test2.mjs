import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
/* centre the book in the viewport so every click point is reachable */
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();
  window.scrollBy(0, b.top + b.height/2 - window.innerHeight/2);});
await new Promise(r=>setTimeout(r,700));
const L = () => page.evaluate(()=>document.getElementById('flip-label').textContent);
async function click(fx,fy){
  const b = await page.evaluate(()=>{const r=document.getElementById('flip-spread').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
  await page.mouse.click(b.x+b.w*fx, b.y+b.h*fy);
  await new Promise(r=>setTimeout(r,1000));
  return L();
}
console.log('start                    ', await L());
console.log('right 75%/50%            ', await click(0.75,0.50));
console.log('right 65%/85%  (low)     ', await click(0.65,0.85));
console.log('right 98%/50%  (far edge)', await click(0.98,0.50));
console.log('right 52%/15%  (near mid)', await click(0.52,0.15));
console.log('left  25%/50%            ', await click(0.25,0.50));
console.log('left  02%/85%  (far edge)', await click(0.02,0.85));
console.log('left  48%/15%  (near mid)', await click(0.48,0.15));
console.log('left  25%/50%            ', await click(0.25,0.50));
console.log('left  25%/50%  (clamp@0) ', await click(0.25,0.50));
console.log('--- run to the very end ---');
for (let i=0;i<9;i++) await click(0.75,0.50);
console.log('after 9 right clicks     ', await L());
console.log('right again (clamp@end)  ', await click(0.75,0.50));
console.log('left  back one           ', await click(0.25,0.50));
await browser.close();
