import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:2}});
const page = await browser.newPage();
await page.goto('https://albi-coffe.netlify.app/',{waitUntil:'networkidle2',timeout:90000});
await new Promise(r=>setTimeout(r,2500));
await page.evaluate(()=>document.getElementById('contact').scrollIntoView());
await new Promise(r=>setTimeout(r,8000));
// hide every sibling of the map iframe (the overlays) so only tiles remain
await page.evaluate(()=>{
  const f=[...document.querySelectorAll('iframe')].find(x=>x.src.includes('google.com/maps'));
  const box=f.parentElement;
  [...box.children].forEach(c=>{ if(c!==f) c.style.display='none'; });
  box.style.borderRadius='0';
});
await new Promise(r=>setTimeout(r,1200));
const h = await page.evaluateHandle(()=>[...document.querySelectorAll('iframe')].find(x=>x.src.includes('google.com/maps')));
const el=h.asElement();
await el.screenshot({path:'shots/map-bare.png'});
const b=await el.boundingBox(); console.log('box',JSON.stringify(b));
await browser.close();
