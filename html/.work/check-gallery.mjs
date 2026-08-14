import puppeteer from 'puppeteer-core';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W=Number(process.env.W||1920);
const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--hide-scrollbars','--force-device-scale-factor=1'],defaultViewport:{width:W,height:1080,deviceScaleFactor:1}});
const p=await b.newPage();
const errs=[];
p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('requestfailed',r=>errs.push('404/fail: '+r.url()));
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2',timeout:60000});
await p.evaluate(async()=>{const m=document.documentElement.scrollHeight;for(let y=0;y<m;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,90));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,900));});
const rep=await p.evaluate(()=>{
  const out={};
  out.order=[...document.querySelectorAll('main section[id]')].map(s=>s.id);
  out.hscroll=document.documentElement.scrollWidth>window.innerWidth+1?document.documentElement.scrollWidth:false;
  const g=document.getElementById('gallery');
  out.galleryH=g?Math.round(g.getBoundingClientRect().height):null;
  out.tiles=[...document.querySelectorAll('.gtile')].map(t=>{
    const r=t.getBoundingClientRect(); const i=t.querySelector('img');
    return {cls:t.className.replace('gtile ','').replace(' is-visible',''),w:Math.round(r.width),h:Math.round(r.height),vis:t.classList.contains('is-visible'),nat:i.naturalWidth};
  });
  // overflow check across whole page
  const body=document.body.getBoundingClientRect();
  out.overflow=[...document.querySelectorAll('main *, footer *')].filter(el=>{
    const r=el.getBoundingClientRect();
    return r.width>0 && (r.right>window.innerWidth+2||r.left<-2);
  }).slice(0,6).map(el=>el.className&&el.className.toString().slice(0,50)||el.tagName);
  return out;
});
console.log(JSON.stringify(rep,null,1));
console.log('ERRORS:',errs.length?errs:'none');
await b.close();
