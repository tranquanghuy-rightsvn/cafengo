import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.evaluate(()=>{const r=document.querySelector('.opt[data-opt="2"]').getBoundingClientRect();window.scrollBy(0,r.top-300)});
await wait(500);
console.log(await p.evaluate(()=>{
  const t=document.querySelector('.opt[data-opt="2"]');
  const r=t.getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+r.height/2;
  const stack=document.elementsFromPoint(cx,cy).slice(0,6).map(e=>e.tagName+'.'+(e.className.toString().slice(0,40)));
  return JSON.stringify({rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},cx:Math.round(cx),cy:Math.round(cy),inView:cy>0&&cy<window.innerHeight,stack},null,1);
}));
await b.close();
