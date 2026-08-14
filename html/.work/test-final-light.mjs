import puppeteer from 'puppeteer-core';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8899/html-light/',{waitUntil:'networkidle2'});
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});

console.log('section order:',await p.evaluate(()=>[...document.querySelectorAll('main section[id]')].map(s=>s.id).join(' → ')));
console.log('nav links:',await p.evaluate(()=>[...document.querySelectorAll('.nav-desktop .nav-link')].map(a=>a.getAttribute('href')).join(' ')));
console.log('footer links:',await p.evaluate(()=>[...document.querySelectorAll('.footer-links a, footer a[href^="#"]')].map(a=>a.getAttribute('href')).join(' ')));
console.log('anchors trỏ vào đâu không tồn tại:',await p.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h!=='#'&&!document.querySelector(h)).join(',')||'không có'));

// flipbook
await p.evaluate(()=>{const s=document.querySelector('.flip-spread');const r=s.getBoundingClientRect();s.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.75,clientY:r.top+r.height/2,bubbles:true}));});
await wait(1300);
console.log('flipbook lật:',await p.evaluate(()=>[...document.querySelectorAll('.leaf')].filter(l=>l.classList.contains('is-flipped')).length));

// lightbox
await p.evaluate(()=>document.querySelector('.gtile--e .gtile__btn').click()); await wait(700);
console.log('lightbox:',await p.evaluate(()=>document.getElementById('lightbox-count').textContent+' '+document.getElementById('lightbox-name').textContent));
await p.keyboard.press('Escape'); await wait(600);

// forms
await p.evaluate(()=>{document.querySelectorAll('#contact-chips .chip')[3].click()});
console.log('chip:',await p.evaluate(()=>document.querySelector('#contact-chips .chip.is-active').textContent));
await p.evaluate(()=>document.querySelector('.contact__panel .rsubmit').click()); await wait(250);
console.log('contact submit rỗng:',await p.evaluate(()=>document.querySelector('.contact__panel .form-note').textContent));
await p.evaluate(()=>{document.getElementById('ct-name').value='A';document.getElementById('ct-phone').value='0900';document.getElementById('ct-email').value='a@b.c';document.getElementById('ct-msg').value='hi';document.querySelector('.contact__panel .rsubmit').click()}); await wait(250);
console.log('contact submit đủ:',await p.evaluate(()=>document.querySelector('.contact__panel .form-note').textContent));
await p.evaluate(()=>{document.getElementById('fb-name').value='B';document.getElementById('fb-msg').value='ngon';document.querySelector('.feedback__submit').click()}); await wait(250);
console.log('feedback:',await p.evaluate(()=>document.querySelector('.feedback .form-note').textContent));

console.log('LỖI JS:',errs.length?errs:'không có');
await b.close();
