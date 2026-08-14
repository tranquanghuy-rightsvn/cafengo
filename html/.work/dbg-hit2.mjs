import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.evaluate(()=>{const r=document.querySelector('.opt[data-opt="2"]').getBoundingClientRect();window.scrollBy(0,r.top-300)});
await wait(400);
console.log('stack:',await p.evaluate(()=>{const r=document.querySelector('.opt[data-opt="2"]').getBoundingClientRect();return JSON.stringify(document.elementsFromPoint(r.left+r.width/2,r.top+r.height/2).slice(0,5).map(e=>e.tagName+'.'+e.className.toString().slice(0,36)))}));
const box=await (await p.$('.opt[data-opt="2"]')).boundingBox();
await p.mouse.click(box.x+box.width/2,box.y+box.height/2);
await wait(200);
console.log('real mouse click ->',await p.evaluate(()=>document.getElementById('spec-name').textContent+' | '+document.getElementById('inv-total').textContent));
// và một cú click chuột thật vào tile gallery + nút copy
await p.evaluate(()=>{const r=document.querySelector('.info__copy').getBoundingClientRect();window.scrollBy(0,r.top-400)}); await wait(400);
const cb=await (await p.$('.info__copy')).boundingBox();
await p.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2); await wait(250);
console.log('copy btn ->',await p.evaluate(()=>document.querySelector('.info__copy').textContent));
await b.close();
