import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));

// --- lightbox ---
await p.evaluate(()=>document.getElementById('gallery').scrollIntoView({block:'center'}));
await wait(900);
await p.click('.gtile--c .gtile__btn');
await wait(700);
let lb=await p.evaluate(()=>{const l=document.getElementById('lightbox');return{hidden:l.hidden,open:l.classList.contains('is-open'),ready:l.classList.contains('is-ready'),src:document.getElementById('lightbox-img').src.split('/').pop(),count:document.getElementById('lightbox-count').textContent,name:document.getElementById('lightbox-name').textContent,imgH:Math.round(document.getElementById('lightbox-img').getBoundingClientRect().height),bodyOverflow:document.body.style.overflow}});
console.log('open tile 3 ->',JSON.stringify(lb));
await p.keyboard.press('ArrowRight'); await wait(600);
console.log('after ArrowRight ->',await p.evaluate(()=>document.getElementById('lightbox-count').textContent+' | '+document.getElementById('lightbox-name').textContent));
await p.click('#lightbox-prev'); await wait(600);
await p.click('#lightbox-prev'); await wait(600);
console.log('after 2x prev ->',await p.evaluate(()=>document.getElementById('lightbox-count').textContent+' | '+document.getElementById('lightbox-name').textContent));
await p.keyboard.press('Escape'); await wait(700);
console.log('after Esc ->',await p.evaluate(()=>{const l=document.getElementById('lightbox');return JSON.stringify({hidden:l.hidden,open:l.classList.contains('is-open'),bodyOverflow:document.body.style.overflow})}));

// --- reservation: pick option 3 (gác xép) ---
await p.evaluate(()=>document.getElementById('reservations').scrollIntoView({block:'center'}));
await wait(500);
await p.click('.opt[data-opt="2"]');
await wait(300);
console.log('opt3 ->',await p.evaluate(()=>JSON.stringify({sel:[...document.querySelectorAll('.opt')].map(o=>o.classList.contains('is-selected')),specName:document.getElementById('spec-name').textContent,specIcon:document.getElementById('spec-icon').textContent,hw:document.getElementById('spec-hw').children.length,unit:document.getElementById('inv-unit').textContent,hours:document.getElementById('inv-hours').textContent,total:document.getElementById('inv-total').textContent,durDisabled:document.getElementById('res-duration').disabled})));
await p.select('#res-duration','4'); await wait(200);
console.log('4h ->',await p.evaluate(()=>document.getElementById('inv-hours').textContent+' = '+document.getElementById('inv-total').textContent));
await p.click('.opt[data-opt="0"]'); await wait(200);
console.log('back to opt1 ->',await p.evaluate(()=>JSON.stringify({unit:document.getElementById('inv-unit').textContent,total:document.getElementById('inv-total').textContent,durDisabled:document.getElementById('res-duration').disabled,specName:document.getElementById('spec-name').textContent})));

// --- day / slot / chip ---
await p.evaluate(()=>document.querySelectorAll('#day-row .day-btn')[3].click());
await p.evaluate(()=>document.querySelectorAll('#slot-grid .slot')[4].click());
console.log('day/slot ->',await p.evaluate(()=>JSON.stringify({day:[...document.querySelectorAll('#day-row .day-btn')].findIndex(b=>b.classList.contains('is-selected')),slot:[...document.querySelectorAll('#slot-grid .slot')].findIndex(b=>b.classList.contains('is-selected'))})));
console.log('disabled slot ignored ->',await p.evaluate(()=>{const s=document.querySelectorAll('#slot-grid .slot')[2];s.click();return s.classList.contains('is-selected')}));

// --- reservation submit: empty required ---
await p.evaluate(()=>document.querySelector('.rform .rsubmit').click());
await wait(300);
console.log('submit empty ->',await p.evaluate(()=>{const n=document.querySelector('.rform .form-note');return n?n.className+' | '+n.textContent:'NO NOTE'}));
await p.evaluate(()=>{document.getElementById('res-name').value='Nguyễn Văn A';document.getElementById('res-phone').value='0901234567';});
await p.evaluate(()=>document.querySelector('.rform .rsubmit').click());
await wait(300);
console.log('submit filled ->',await p.evaluate(()=>{const n=document.querySelector('.rform .form-note');return n.className+' | '+n.textContent}));

// --- contact chips + copy ---
await p.evaluate(()=>document.querySelectorAll('#contact-chips .chip')[2].click());
console.log('chip ->',await p.evaluate(()=>[...document.querySelectorAll('#contact-chips .chip')].findIndex(c=>c.classList.contains('is-active'))));

// --- feedback form ---
await p.evaluate(()=>{document.getElementById('fb-name').value='Hà';document.getElementById('fb-msg').value='Cà phê ngon';document.querySelector('.feedback__submit').click()});
await wait(300);
console.log('feedback ->',await p.evaluate(()=>{const n=document.querySelector('.feedback .form-note');return n?n.className+' | '+n.textContent:'NO NOTE'}));

console.log('JS ERRORS:',errs.length?errs:'none');
await b.close();
