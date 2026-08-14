import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
console.log('opts found:', await p.evaluate(()=>document.querySelectorAll('#opt-list .opt').length));
console.log('optList id present:', await p.evaluate(()=>!!document.getElementById('opt-list')));
// in-page click, bypasses hit testing
await p.evaluate(()=>document.querySelector('.opt[data-opt="2"]').click());
await wait(200);
console.log('after in-page click:', await p.evaluate(()=>JSON.stringify({sel:[...document.querySelectorAll('.opt')].map(o=>o.classList.contains('is-selected')),name:document.getElementById('spec-name').textContent,unit:document.getElementById('inv-unit').textContent,total:document.getElementById('inv-total').textContent,dur:document.getElementById('res-duration').disabled})));
// what is on top at the opt centre?
console.log('topmost at opt3 centre:', await p.evaluate(()=>{const r=document.querySelector('.opt[data-opt="2"]').getBoundingClientRect();const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return el?el.className.toString()+' <'+el.tagName+'>':'null'}));
await b.close();
