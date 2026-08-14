import puppeteer from 'puppeteer-core';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const wait=ms=>new Promise(r=>setTimeout(r,ms));

// --- flipbook @1440 ---
{
const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
const cur=()=>p.evaluate(()=>{const s=document.querySelector('.flip-spread');return s?s.getAttribute('data-spread')||[...document.querySelectorAll('.leaf')].filter(l=>l.classList.contains('is-flipped')).length:'?'});
console.log('flipbook start spread(flipped leaves):',await cur());
// bấm nút next nếu có, không thì click nửa phải
await p.evaluate(()=>{const b=document.querySelector('.flip-next, [data-flip="next"]'); if(b) b.click(); else {const s=document.querySelector('.flip-spread'); const r=s.getBoundingClientRect(); s.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.75,clientY:r.top+r.height/2,bubbles:true}));}});
await wait(1400);
console.log('after 1 turn:',await cur());
await p.evaluate(()=>{const s=document.querySelector('.flip-spread'); const r=s.getBoundingClientRect(); s.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.75,clientY:r.top+r.height/2,bubbles:true}));});
await wait(1400);
console.log('after 2 turns:',await cur());
await p.evaluate(()=>{const s=document.querySelector('.flip-spread'); const r=s.getBoundingClientRect(); s.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.25,clientY:r.top+r.height/2,bubbles:true}));});
await wait(1400);
console.log('after 1 back:',await cur());
console.log('flipbook errors:',errs.length?errs:'none');
await b.close();
}

// --- mobile nav @375 ---
{
const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:375,height:812,isMobile:true,hasTouch:true}});
const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await p.evaluate(()=>document.getElementById('nav-open').click()); await wait(500);
console.log('nav open:',await p.evaluate(()=>{const o=document.getElementById('nav-overlay');return JSON.stringify({open:o.classList.contains('is-open'),links:[...o.querySelectorAll('a')].map(a=>a.getAttribute('href')),bodyLock:document.body.style.overflow})}));
await p.evaluate(()=>document.getElementById('nav-close').click()); await wait(400);
console.log('nav closed:',await p.evaluate(()=>document.getElementById('nav-overlay').classList.contains('is-open')));
// lightbox on mobile
await p.evaluate(()=>document.querySelector('.gtile--b .gtile__btn').click()); await wait(800);
console.log('mobile lightbox:',await p.evaluate(()=>{const l=document.getElementById('lightbox');const i=document.getElementById('lightbox-img').getBoundingClientRect();return JSON.stringify({open:l.classList.contains('is-open'),imgW:Math.round(i.width),imgH:Math.round(i.height),fitsW:i.width<=375,fitsH:i.height<=812})}));
console.log('mobile errors:',errs.length?errs:'none');
await b.close();
}
