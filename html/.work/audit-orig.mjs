import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:375,height:900,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('https://albi-coffe.netlify.app/',{waitUntil:'networkidle2',timeout:90000});
await new Promise(r=>setTimeout(r,3000));
await page.evaluate(async()=>{const m=document.documentElement.scrollHeight;for(let y=0;y<m;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,90));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,900));});
const r = await page.evaluate(()=>{
  const de=document.documentElement;
  const over=[];
  document.querySelectorAll('body *').forEach(el=>{
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||cs.position==='fixed')return;
    if(/ambient-glow/.test(el.className||''))return;
    if(el.closest('.main-book'))return;
    if(el.closest('[class*="translate-x-full"]'))return;
    const b=el.getBoundingClientRect();
    if(b.width===0&&b.height===0)return;
    const past=Math.round(Math.max(b.right-375,-b.left));
    if(past>2) over.push({cls:(el.className||'').toString().slice(0,44),past});
  });
  return {overflow: de.scrollWidth-de.clientWidth, count: over.length, classes:[...new Set(over.map(o=>o.cls))].slice(0,10)};
});
console.log(JSON.stringify(r,null,1));
await browser.close();
