import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(async()=>{const m=document.documentElement.scrollHeight;for(let y=0;y<m;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,600));});
const r = await page.evaluate(()=>{
  const bad=[], seen=new Map();
  document.querySelectorAll('.icon').forEach(el=>{
    const name=el.textContent.trim();
    const b=el.getBoundingClientRect();
    const fs=parseFloat(getComputedStyle(el).fontSize);
    if(b.width===0&&b.height===0) return;      // hidden panel
    if(!seen.has(name)) seen.set(name, Math.round(b.width*10)/10+'/'+fs);
    // a ligature that failed renders the literal name: much wider than 1em
    if(b.width > fs*1.8) bad.push({name, w:Math.round(b.width), fs});
  });
  return {unique:[...seen.entries()], bad};
});
console.log('unique icons:', r.unique.length);
console.log(r.unique.map(([n,v])=>n+'='+v).join('  '));
console.log('FAILED LIGATURES:', JSON.stringify(r.bad));
await browser.close();
