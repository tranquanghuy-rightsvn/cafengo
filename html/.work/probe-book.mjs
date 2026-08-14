import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('https://albi-coffe.netlify.app/',{waitUntil:'networkidle2',timeout:90000});
await new Promise(r=>setTimeout(r,3000));
await page.evaluate(()=>document.querySelector('#menu').scrollIntoView());
await new Promise(r=>setTimeout(r,2000));
const label=()=>page.evaluate(()=>{
  const els=[...document.querySelectorAll('#menu span')].filter(s=>/tabular-nums/.test(s.className));
  const dots=[...document.querySelectorAll('#menu .rounded-full')].filter(d=>/w-1\.5|w-1\.5/.test(d.className));
  const vis=[...document.querySelectorAll('#menu .page')].filter(p=>getComputedStyle(p).display!=='none').map(p=>{const b=p.getBoundingClientRect();return Math.round(b.left)+','+Math.round(b.width)+'x'+Math.round(b.height)+' '+(p.className.match(/--\S+/g)||[]).join(' ')});
  return {label: els.map(e=>e.textContent.trim()), visiblePages: vis};
});
console.log('state0', JSON.stringify(await label()));
for (let i=0;i<3;i++){
  await page.evaluate(()=>{const b=[...document.querySelectorAll('#menu button')].find(x=>x.getAttribute('aria-label')==='Trang sau'); b&&b.click();});
  await new Promise(r=>setTimeout(r,1600));
  console.log('state'+(i+1), JSON.stringify(await label()));
}
await browser.close();
