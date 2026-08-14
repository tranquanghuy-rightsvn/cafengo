import puppeteer from 'puppeteer-core';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL='http://127.0.0.1:8899/html-light/';
for (const W of [1920,1366,768,375]) {
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--hide-scrollbars','--force-device-scale-factor=1'],defaultViewport:{width:W,height:900}});
  const p=await b.newPage();
  const errs=[],bad=[];
  p.on('pageerror',e=>errs.push(e.message));
  p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))bad.push(r.status()+' '+r.url())});
  await p.goto(URL,{waitUntil:'networkidle2',timeout:60000});
  await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  await p.evaluate(async()=>{const m=document.documentElement.scrollHeight;for(let y=0;y<m;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,110));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,600));});
  const rep=await p.evaluate(()=>{
    const vw=document.documentElement.clientWidth, out={};
    out.hscroll=document.documentElement.scrollWidth-vw;
    out.overflow=[...document.querySelectorAll('main *, footer *, header *')].filter(el=>{
      if(el.classList.contains('glow-blob')||el.classList.contains('grid-overlay'))return false;
      const cs=getComputedStyle(el); if(cs.position==='fixed'||cs.display==='none')return false;
      const r=el.getBoundingClientRect();
      return r.width>0&&r.height>0&&(r.right>vw+2||r.left<-2);
    }).slice(0,6).map(e=>(e.className&&e.className.toString().slice(0,40))||e.tagName);
    out.brokenImgs=[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src'));
    // kiểm tương phản: chữ vs nền thật sự phía sau
    const lum=c=>{const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*r+0.7152*g+0.0722*b};
    const bgOf=el=>{let n=el;while(n&&n!==document.documentElement){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c)){const a=c.match(/[\d.]+/g);if(!a[3]||Number(a[3])>0.85)return c}n=n.parentElement}return getComputedStyle(document.body).backgroundColor};
    const ratio=(f,b)=>{const L1=lum(f),L2=lum(b);return ((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05))};
    const low=[];
    document.querySelectorAll('main p, main h1, main h2, main h3, main h4, main a, main span, main label, footer p, footer a, .nav-link').forEach(el=>{
      const t=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
      if(!t||t.length<3)return;
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<0.3)return;
      const r=el.getBoundingClientRect(); if(!r.width||!r.height)return;
      // bỏ qua chữ nằm trên ảnh (không tính được nền)
      if(el.closest('.hero,.gtile,.lightbox,.mapbox,.philosophy__figure'))return;
      const cr=ratio(cs.color,bgOf(el));
      const big=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&Number(cs.fontWeight)>=700);
      if(cr < (big?3:4.5)) low.push({t:t.slice(0,34),fg:cs.color,cr:cr.toFixed(2),size:cs.fontSize,cls:(el.className||'').toString().slice(0,26)});
    });
    out.lowContrast=low.slice(0,12); out.lowCount=low.length;
    return out;
  });
  console.log('=== W='+W+' ===');
  console.log(JSON.stringify(rep,null,1));
  console.log('lỗi JS:',errs.length?errs:'không','| request hỏng:',bad.length?bad:'không');
  await b.close();
}
