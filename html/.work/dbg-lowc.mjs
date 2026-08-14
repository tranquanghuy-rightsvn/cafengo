import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/html-light/',{waitUntil:'networkidle2'});
console.log(await p.evaluate(()=>{
  const out=[];
  ['Thực Đơn','NGÕ COFFEE','Lời của khách quen','Tìm đường tới quán'].forEach(t=>{
    const el=[...document.querySelectorAll('h1,h2,h3')].find(e=>e.textContent.trim()===t);
    if(!el){out.push(t+': không tìm thấy');return;}
    const cs=getComputedStyle(el);
    out.push(`${t} | class=${el.className} | color=${cs.color} | bgImage=${cs.backgroundImage.slice(0,40)} | clip=${cs.webkitBackgroundClip||cs.backgroundClip}`);
  });
  return out.join('\n');
}));
await b.close();
