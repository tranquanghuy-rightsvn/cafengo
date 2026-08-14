import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,180)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
const label = () => page.evaluate(()=>String(document.querySelectorAll('.leaf.is-flipped').length));

/* watch whether a soft roll happened, and how the crease is shaped */
async function act(fn, tag) {
  const res = await page.evaluate(async (code) => {
    const rec=[]; let stop=false;
    (function s(){
      const leaf=document.querySelector('.leaf.is-turning');
      const svg=leaf && [...leaf.children].find(c=>c.classList && c.classList.contains('peel-fold'));
      const poly=svg && svg.querySelector('.peel-fold__paper');
      const raw=poly && poly.getAttribute('points');
      if(leaf && raw){
        const pts=raw.split(' ').map(p=>p.split(',').map(Number));
        rec.push({idx:[...document.querySelectorAll('.leaf')].indexOf(leaf),
                  hx:Math.round(pts[0][0]), tip:Math.round(pts[2][0]), tipY:Math.round(pts[2][1])});
      } else if(rec.length) stop=true;
      if(!stop) requestAnimationFrame(s);
    })();
    eval(code);
    await new Promise(r=>setTimeout(r,1500));
    return rec;
  }, fn);
  const lbl = 'spread ' + (await label());
  if (!res.length) { console.log(tag.padEnd(34), '-> RIGID swing   | now at', lbl); return; }
  const f = res[0], m = res[Math.floor(res.length/2)];
  console.log(tag.padEnd(34), '-> SOFT roll, ' + String(res.length).padStart(2) + ' frames | now at', lbl);
  const l=res[res.length-1];
  console.log('     leaf', f.idx, '| crease x:', String(f.hx).padStart(4), '->', String(m.hx).padStart(4), '->', String(l.hx).padStart(4),
              '| tip x:', String(f.tip).padStart(5), '->', String(m.tip).padStart(5), '->', String(l.tip).padStart(5),
              '| tip y', f.tipY);
}

await act("document.getElementById('flip-next').click()", 'nav button, cover -> page 1');
await act("document.getElementById('flip-next').click()", 'nav button, paper page');
await act("document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))", 'keyboard ArrowRight');
await act("document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}))", 'keyboard ArrowLeft');
await act("document.getElementById('flip-prev').click()", 'nav button back (paper)');
/* click in the middle of the right page, far from any corner */
await act("(()=>{const f=[...document.querySelectorAll('.leaf:not(.is-flipped) .leaf__face--front')].sort((a,b)=>(+b.closest('.leaf').style.zIndex||0)-(+a.closest('.leaf').style.zIndex||0))[0];const r=f.getBoundingClientRect();document.elementFromPoint(r.left+r.width/2, r.top+r.height/2).dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));})()", 'click centre of the right page');
/* go to the last spread and back onto the cover */
await page.evaluate(()=>{const b=document.getElementById('flip-prev');for(let i=0;i<4;i++)b.click();});
await new Promise(r=>setTimeout(r,5200));
await act("document.getElementById('flip-next').click()", 'cover -> page 1 again');
await act("document.getElementById('flip-prev').click()", 'page 1 -> cover (board leaf)');
await browser.close();
