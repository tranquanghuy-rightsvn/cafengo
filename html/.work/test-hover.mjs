import puppeteer from 'puppeteer-core';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for (const [name,URL] of [['TỐI ','http://127.0.0.1:8899/'],['SÁNG','http://127.0.0.1:8899/html-light/']]) {
  const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
  const p=await b.newPage();
  await p.goto(URL,{waitUntil:'networkidle2'});
  await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  await p.evaluate(()=>document.getElementById('testimonials').scrollIntoView({block:'center'}));
  await wait(700);
  const box=await (await p.$('.tcard--wide')).boundingBox();
  await p.mouse.move(box.x+box.width/2, box.y+120);
  await wait(700);
  const st=await p.evaluate(()=>[...document.querySelectorAll('.tcard')].map(c=>{
    const cs=getComputedStyle(c);
    return {op:cs.opacity, filter:cs.filter==='none'?'none':cs.filter};
  }));
  console.log(name,'| khi rê chuột vào thẻ 1:',JSON.stringify(st));
  await b.close();
}
