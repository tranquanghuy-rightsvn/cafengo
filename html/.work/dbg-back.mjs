import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,200)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>{const b=document.getElementById('flip-next');b.click();b.click();});
await new Promise(r=>setTimeout(r,1900));

const v = await page.evaluate(()=>{
  const f=[...document.querySelectorAll('.leaf.is-flipped .leaf__face--back')].find(x=>x.getBoundingClientRect().width>1);
  const r=f.getBoundingClientRect();
  const leaf=f.closest('.leaf');
  const lr=leaf.getBoundingClientRect();
  return {face:{x:r.left,y:r.top,w:r.width,h:r.height}, leaf:{x:lr.left,w:lr.width}, leafT:getComputedStyle(leaf).transform, faceT:getComputedStyle(f).transform};
});
console.log('verso face rect  :', JSON.stringify(v.face));
console.log('its leaf rect    :', JSON.stringify(v.leaf));
console.log('leaf transform   :', v.leafT);
console.log('face transform   :', v.faceT);

/* hover its bottom-left corner and read what paint produces */
await page.mouse.move(v.face.x+110, v.face.y+v.face.h-110);
await new Promise(r=>setTimeout(r,400));
const hov = await page.evaluate(()=>{
  const f=[...document.querySelectorAll('.leaf.is-flipped .leaf__face--back')].find(x=>x.getBoundingClientRect().width>1);
  const svg=f.querySelector('.peel-fold');
  if(!svg) return 'no overlay built';
  const poly=svg.querySelector('.peel-fold__paper');
  const pr=poly.getBoundingClientRect();
  return {lifted:svg.classList.contains('is-lifted'), points:poly.getAttribute('points'), screen:{l:Math.round(pr.left),r:Math.round(pr.right),t:Math.round(pr.top),b:Math.round(pr.bottom)}};
});
console.log('\nhover on verso corner ->', JSON.stringify(hov));
await browser.close();
