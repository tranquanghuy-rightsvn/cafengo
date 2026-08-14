import puppeteer from 'puppeteer-core';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const URL='http://127.0.0.1:8899/';
for (const theme of ['dark','light']) {
  const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
  const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.evaluateOnNewDocument(t=>{try{localStorage.setItem('ngo-theme',t)}catch(e){}},theme);
  await p.goto(URL,{waitUntil:'networkidle2'});
  await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  const r=[];
  r.push('theme='+(await p.evaluate(()=>document.documentElement.getAttribute('data-theme')||'dark')));
  await p.evaluate(()=>{const s=document.querySelector('.flip-spread');const q=s.getBoundingClientRect();s.dispatchEvent(new MouseEvent('click',{clientX:q.left+q.width*0.75,clientY:q.top+q.height/2,bubbles:true}));});
  await wait(1300);
  r.push('lậtSách='+(await p.evaluate(()=>[...document.querySelectorAll('.leaf')].filter(l=>l.classList.contains('is-flipped')).length)));
  await p.evaluate(()=>document.querySelector('.gtile--c .gtile__btn').click()); await wait(800);
  r.push('lightbox='+(await p.evaluate(()=>document.getElementById('lightbox-count').textContent)));
  await p.keyboard.press('Escape'); await wait(600);
  await p.evaluate(()=>{document.getElementById('fb-name').value='A';document.getElementById('fb-msg').value='ngon';document.querySelector('.feedback__submit').click()}); await wait(300);
  r.push('form='+(await p.evaluate(()=>document.querySelector('.feedback .form-note')?'ok':'LỖI')));
  await p.evaluate(()=>document.getElementById('nav-open').click()); await wait(400);
  r.push('drawer='+(await p.evaluate(()=>{const o=document.getElementById('nav-overlay');const sw=document.getElementById('theme-toggle-mobile');return o.classList.contains('is-open')+'/'+(sw?sw.querySelector('.nav-mobile__theme-label').textContent:'thiếu')})));
  await p.evaluate(()=>document.getElementById('theme-toggle-mobile').click()); await wait(1000);
  r.push('bấmTrongDrawer='+(await p.evaluate(()=>document.documentElement.getAttribute('data-theme')||'dark')));
  console.log(theme.padEnd(5),'|', r.join(' | '), '| lỗi:', errs.length?errs:'không');
  await b.close();
}
