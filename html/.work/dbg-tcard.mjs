import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
console.log(await p.evaluate(()=>{
  const cards=[...document.querySelectorAll('.tcard')];
  return JSON.stringify(cards.map(c=>{
    const r=c.getBoundingClientRect();
    const q=c.querySelector('blockquote,.tcard__quote,p');
    const foot=c.querySelector('.tcard__event');
    const qr=q?q.getBoundingClientRect():null;
    return {cls:c.className.slice(0,40),h:Math.round(r.height),
      gridRow:getComputedStyle(c).gridRow,
      display:getComputedStyle(c).display,
      quoteH:qr?Math.round(qr.height):null,
      footTop:foot?Math.round(foot.getBoundingClientRect().top-r.top):null};
  }),null,1);
}));
console.log('grid:',await p.evaluate(()=>{const g=document.querySelector('.testimonials__grid,.tgrid');return g?g.className+' | '+getComputedStyle(g).gridTemplateColumns+' | rows:'+getComputedStyle(g).gridTemplateRows:'?'}));
await b.close();
