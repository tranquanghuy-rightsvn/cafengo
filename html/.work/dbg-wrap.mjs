import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
console.log(await p.evaluate(()=>JSON.stringify([...document.querySelectorAll('.info__foot')].map(f=>({h:Math.round(f.getBoundingClientRect().height),txt:f.textContent.replace(/\s+/g,' ').trim().slice(0,50)})),null,1)));
await b.close();
