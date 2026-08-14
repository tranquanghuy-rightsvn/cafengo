import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
console.log(await p.evaluate(()=>{
  const c=document.querySelector('.tcard--wide');
  const r=c.getBoundingClientRect();
  const body=c.querySelector('.tcard__body').getBoundingClientRect();
  const foot=c.querySelector('.tcard__foot').getBoundingClientRect();
  const head=c.querySelector('.tcard__head').getBoundingClientRect();
  return JSON.stringify({card:Math.round(r.height),headBottom:Math.round(head.bottom-r.top),bodyTop:Math.round(body.top-r.top),bodyH:Math.round(body.height),textEnds:Math.round([...c.querySelectorAll('.tcard__body p')].pop().getBoundingClientRect().bottom-r.top),footTop:Math.round(foot.top-r.top)});
}));
await b.close();
