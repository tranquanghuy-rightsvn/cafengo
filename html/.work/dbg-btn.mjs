import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
console.log(await p.evaluate(()=>{
  const h=e=>Math.round(e.getBoundingClientRect().height);
  return JSON.stringify({input:h(document.getElementById('ct-name')),submit:h(document.querySelector('.rsubmit')),
    fbInput:h(document.getElementById('fb-name')),fbSubmit:h(document.querySelector('.feedback__submit'))});
}));
await b.close();
