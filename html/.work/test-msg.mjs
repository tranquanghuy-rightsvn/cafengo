import puppeteer from 'puppeteer-core';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const B='http://127.0.0.1:8899/loi-nhan/';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage(); const errs=[];
p.on('pageerror',e=>errs.push(e.message));
p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errs.push(r.status()+' '+r.url())});
await p.goto(B,{waitUntil:'networkidle2'});
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
await wait(900);
const st=()=>p.evaluate(()=>({
  cards:document.querySelectorAll('.mcard').length,
  stat:document.getElementById('msg-stat').textContent.trim(),
  pager:[...document.querySelectorAll('#msg-pager a,#msg-pager span')].map(e=>e.textContent.trim()||'‹›').join(' '),
  url:location.search||'(trống)',
  firstName:(document.querySelector('.mcard__name')||{}).textContent,
  firstTime:(document.querySelector('.mcard__when')||{}).textContent,
  spans:[...document.querySelectorAll('.mcard')].slice(0,6).map(e=>getComputedStyle(e).gridRowEnd),
}));
console.log('trang 1  :',JSON.stringify(await st(),null,0));

// sang trang 2
await p.evaluate(()=>[...document.querySelectorAll('#msg-pager a')].find(a=>a.textContent.trim()==='2').click());
await wait(900);
console.log('trang 2  :',JSON.stringify(await st(),null,0));

// vào thẳng bằng URL ?page=3
await p.goto(B+'?page=3',{waitUntil:'networkidle2'}); await wait(800);
console.log('?page=3  :',JSON.stringify(await st(),null,0));

// lọc theo tên
await p.goto(B,{waitUntil:'networkidle2'}); await wait(700);
await p.type('#f-name','minh');
await p.evaluate(()=>document.getElementById('msg-filter').requestSubmit());
await wait(800);
console.log('tên=minh :',JSON.stringify(await st(),null,0));

// lọc theo khoảng thời gian
await p.goto(B,{waitUntil:'networkidle2'}); await wait(700);
await p.evaluate(()=>{document.getElementById('f-from').value='2024-01-01T00:00';document.getElementById('f-to').value='2024-12-31T23:59';document.getElementById('msg-filter').requestSubmit();});
await wait(800);
console.log('2024     :',JSON.stringify(await st(),null,0));

// back của trình duyệt
await p.goBack({waitUntil:'domcontentloaded'}); await wait(700);
console.log('sau back :',JSON.stringify(await st(),null,0));
console.log('LỖI:',errs.length?errs:'không có');
await b.close();
