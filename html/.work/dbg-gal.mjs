import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080}});
const p=await b.newPage();
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
console.log('scripts loaded?', await p.evaluate(()=>[...document.scripts].map(s=>s.src.split('/').pop())));
console.log('mosaic?', await p.evaluate(()=>!!document.getElementById('gallery-mosaic')));
// scroll gallery into view properly
await p.evaluate(()=>document.getElementById('gallery').scrollIntoView({block:'center'}));
await new Promise(r=>setTimeout(r,1500));
console.log('after scrollIntoView:', await p.evaluate(()=>[...document.querySelectorAll('.gtile')].map(t=>t.classList.contains('is-visible'))));
console.log('opacity:', await p.evaluate(()=>[...document.querySelectorAll('.gtile')].map(t=>getComputedStyle(t).opacity)));
await b.close();
