import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,180)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>document.getElementById('flip-next').click());
await new Promise(r=>setTimeout(r,1500));

const label = () => page.evaluate(()=>String(document.querySelectorAll('.leaf.is-flipped').length));
const box = sel => page.evaluate(s=>{const f=[...document.querySelectorAll(s)].find(x=>x.getBoundingClientRect().width>1);const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};},sel);
const tipOf = () => page.evaluate(()=>{
  const s=[...document.querySelectorAll('.peel-fold')].find(x=>x.classList.contains('is-lifted'));
  if(!s) return null;
  const pts=s.querySelector('.peel-fold__paper').getAttribute('points').split(' ').map(p=>p.split(',').map(Number));
  return {tip:pts[2], crease:[pts[0],pts[1]]};
});

console.log('before:', await label());
const b = await box('.leaf:not(.is-flipped) .leaf__face--front');
await page.mouse.move(b.x+b.w-110, b.y+b.h-110);
await new Promise(r=>setTimeout(r,350));
console.log('corner held, tip =', JSON.stringify((await tipOf()).tip.map(Math.round)));

/* sample the tip while the curl plays */
await page.mouse.down(); await page.mouse.up();
const samples = [];
for (let i=0;i<9;i++){
  await new Promise(r=>setTimeout(r,95));
  const t = await tipOf();
  samples.push(t ? Math.round(t.tip[0]) : null);
}
console.log('tip x during the curl :', JSON.stringify(samples));
await new Promise(r=>setTimeout(r,700));
console.log('after :', await label(), '| folds left:', await page.evaluate(()=>[...document.querySelectorAll('.peel-fold')].filter(x=>x.classList.contains('is-lifted')).length));
await browser.close();
