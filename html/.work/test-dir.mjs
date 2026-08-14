import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1920,height:1080,deviceScaleFactor:1}});
const page = await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,180)));
await page.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200));
await page.evaluate(()=>{const b=document.getElementById('flip-spread').getBoundingClientRect();window.scrollBy(0,b.top+b.height/2-window.innerHeight/2);});
await new Promise(r=>setTimeout(r,1500));
await page.evaluate(()=>{const b=document.getElementById('flip-next');b.click();b.click();});
await new Promise(r=>setTimeout(r,1900));

const spread = await page.evaluate(()=>{const r=document.getElementById('flip-spread').getBoundingClientRect();return {x:r.left,w:r.width};});
console.log('spread on screen: x', Math.round(spread.x), 'width', Math.round(spread.w), '| spine at', Math.round(spread.x+spread.w/2));

async function run(which, grabSel, gx, gy, tag) {
  const b = await page.evaluate(s=>{const f=[...document.querySelectorAll(s)].find(x=>x.getBoundingClientRect().width>1);const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};}, grabSel);
  await page.mouse.move(gx(b), gy(b));
  await new Promise(r=>setTimeout(r,400));
  const trace = await page.evaluate(async ()=>{
    const rec=[]; let stop=false;
    (function s(){
      const leaf=document.querySelector('.leaf.is-turning');
      if(leaf){
        const poly=leaf.querySelector('.peel-fold__paper');
        const r=poly.getBoundingClientRect();
        rec.push([Math.round(r.left), Math.round(r.right)]);
      } else if(rec.length) stop=true;
      if(!stop) requestAnimationFrame(s);
    })();
    const sp=document.getElementById('flip-spread').getBoundingClientRect();
    const ev=new MouseEvent('click',{bubbles:true,clientX:sp.left+sp.width/2+(window.__dir||1)*100,clientY:sp.top+sp.height/2});
    document.querySelector('.leaf.is-turning, .leaf') && 0;
    window.__fire();
    await new Promise(r=>setTimeout(r,1300));
    return rec;
  });
  const pick = k => trace[Math.min(trace.length-1, Math.round(k*(trace.length-1)))];
  console.log('\n' + tag);
  [0,0.35,0.7,1].forEach(k=>{
    const s=pick(k);
    console.log('  t=' + k.toFixed(2), 'flap on screen: left', String(s[0]).padStart(5), 'right', String(s[1]).padStart(5));
  });
}

/* fire a real click at the pointer so the held corner drives the turn */
await page.evaluate(()=>{ window.__fire = () => {
  const e=new MouseEvent('click',{bubbles:true, clientX:window.__cx, clientY:window.__cy});
  document.elementFromPoint(window.__cx, window.__cy).dispatchEvent(e);
};});

async function turn(grabSel, gx, gy, tag){
  const b = await page.evaluate(s=>{
    let f;
    if (s === '__LIVE_VERSO__') {
      const top=[...document.querySelectorAll('.leaf.is-flipped')].sort((a,b)=>(+b.style.zIndex||0)-(+a.style.zIndex||0))[0];
      f = top.querySelector('.leaf__face--back');
    } else {
      f = [...document.querySelectorAll(s)].find(x=>x.getBoundingClientRect().width>1);
    }
    const r=f.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};}, grabSel);
  const cx=gx(b), cy=gy(b);
  await page.mouse.move(cx,cy); await new Promise(r=>setTimeout(r,400));
  await page.evaluate(([x,y])=>{window.__cx=x;window.__cy=y;},[cx,cy]);
  const trace = await page.evaluate(async ()=>{
    const rec=[]; let stop=false;
    (function s(){
      const leaf=document.querySelector('.leaf.is-turning');
      if(leaf){const r=leaf.querySelector('.peel-fold__paper').getBoundingClientRect();rec.push([Math.round(r.left),Math.round(r.right)]);}
      else if(rec.length) stop=true;
      if(!stop) requestAnimationFrame(s);
    })();
    window.__fire();
    await new Promise(r=>setTimeout(r,1300));
    return rec;
  });
  console.log('\n'+tag+'  (frames '+trace.length+')');
  [0,0.35,0.7,1].forEach(k=>{const s=trace[Math.min(trace.length-1,Math.round(k*(trace.length-1)))];
    console.log('  t='+k.toFixed(2)+'  flap on screen: left '+String(s[0]).padStart(5)+'  right '+String(s[1]).padStart(5));});
  await new Promise(r=>setTimeout(r,400));
}

await turn('.leaf:not(.is-flipped) .leaf__face--front', b=>b.x+b.w-110, b=>b.y+b.h-110, 'FORWARD  (grab the recto, should sweep LEFT)');
await turn('__LIVE_VERSO__', b=>b.x+110, b=>b.y+b.h-110, 'BACKWARD (grab the verso, should sweep RIGHT)');
await browser.close();
