import puppeteer from 'puppeteer-core';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const URL='http://127.0.0.1:8899/';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errs.push(r.status()+' '+r.url())});
await p.goto(URL,{waitUntil:'networkidle2'});
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
const st=()=>p.evaluate(()=>{
  const cs=getComputedStyle(document.body);
  return {theme:document.documentElement.getAttribute('data-theme')||'dark',
    bodyBg:cs.backgroundColor, gold:getComputedStyle(document.documentElement).getPropertyValue('--gold').trim(),
    pressed:document.getElementById('theme-toggle').getAttribute('aria-pressed'),
    label:document.getElementById('theme-toggle').getAttribute('aria-label'),
    metaTheme:document.querySelector('meta[name=theme-color]').content,
    map:(document.getElementById('map-img')||{}).getAttribute?document.getElementById('map-img').getAttribute('src'):null,
    sunOp:getComputedStyle(document.querySelector('.theme-toggle__icon--sun')).opacity,
    moonOp:getComputedStyle(document.querySelector('.theme-toggle__icon--moon')).opacity,
    saved:localStorage.getItem('ngo-theme')};
});
console.log('mặc định   :', JSON.stringify(await st()));
console.log('có View Transitions?', await p.evaluate(()=>!!document.startViewTransition));
await p.click('#theme-toggle'); await wait(1100);
console.log('sau bấm 1  :', JSON.stringify(await st()));
await p.click('#theme-toggle'); await wait(1100);
console.log('sau bấm 2  :', JSON.stringify(await st()));
// nhớ lựa chọn qua lần tải sau
await p.click('#theme-toggle'); await wait(900);
await p.reload({waitUntil:'networkidle2'});
console.log('tải lại    :', JSON.stringify(await st()));
console.log('LỖI:', errs.length?errs:'không có');
await b.close();
