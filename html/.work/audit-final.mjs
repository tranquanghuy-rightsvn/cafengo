import puppeteer from 'puppeteer-core';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const widths=[1920,1366,768,375];
for (const W of widths){
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--hide-scrollbars','--force-device-scale-factor=1'],defaultViewport:{width:W,height:900,deviceScaleFactor:1}});
  const p=await b.newPage();
  const errs=[]; const bad=[];
  p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
  p.on('response',r=>{if(r.status()>=400 && !r.url().includes('favicon'))bad.push(r.status()+' '+r.url())});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2',timeout:60000});
  await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  await p.evaluate(async()=>{const m=document.documentElement.scrollHeight;for(let y=0;y<m;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,110));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,600));});
  const rep=await p.evaluate(()=>{
    const vw=document.documentElement.clientWidth;
    const out={};
    out.hscroll=document.documentElement.scrollWidth-vw;
    out.pageH=document.documentElement.scrollHeight;
    // phần tử tràn ngang, bỏ qua trang trí đã bị cha clip
    out.overflow=[...document.querySelectorAll('main *, footer *, header *')].filter(el=>{
      if(el.classList.contains('glow-blob')||el.classList.contains('grid-overlay'))return false;
      const cs=getComputedStyle(el);
      if(cs.position==='fixed'||cs.display==='none'||cs.visibility==='hidden')return false;
      const r=el.getBoundingClientRect();
      return r.width>0&&r.height>0&&(r.right>vw+2||r.left<-2);
    }).slice(0,8).map(el=>(el.className&&el.className.toString().slice(0,44))||el.tagName);
    // chữ tràn khỏi hộp
    out.clipped=[...document.querySelectorAll('main p, main h1, main h2, main h3, main h4, main span, footer p, footer a')].filter(el=>{
      if(getComputedStyle(el).overflow!=='hidden')return false;
      return el.scrollWidth>el.clientWidth+3||el.scrollHeight>el.clientHeight+3;
    }).slice(0,6).map(el=>(el.className&&el.className.toString().slice(0,40))||el.tagName);
    // ảnh hỏng
    out.brokenImgs=[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src'));
    out.sections=[...document.querySelectorAll('main section[id]')].map(s=>s.id+':'+Math.round(s.getBoundingClientRect().height));
    out.tilesVisible=[...document.querySelectorAll('.gtile')].filter(t=>t.classList.contains('is-visible')).length;
    return out;
  });
  console.log('=== W='+W+' ===');
  console.log(JSON.stringify(rep));
  console.log('errors:',errs.length?errs:'none','| bad requests:',bad.length?bad:'none');
  await b.close();
}
