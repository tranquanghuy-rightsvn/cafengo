import puppeteer from 'puppeteer-core';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for (const [name,URL] of [['TỐI ','http://127.0.0.1:8899/'],['SÁNG','http://127.0.0.1:8899/html-light/']]) {
  const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars'],defaultViewport:{width:1440,height:900}});
  const p=await b.newPage();
  await p.goto(URL,{waitUntil:'networkidle2'});
  await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  const read=()=>p.evaluate(()=>{const cs=getComputedStyle(document.querySelector('.feedback'));return {tf:cs.transform,bc:cs.borderTopColor}});
  console.log(name,'nghỉ  :',JSON.stringify(await read()));
  await p.evaluate(()=>document.getElementById('fb-name').focus());
  await wait(800);
  console.log(name,'focus :',JSON.stringify(await read()));
  await p.evaluate(()=>document.getElementById('fb-msg').focus());
  await wait(400);
  console.log(name,'đổi ô :',JSON.stringify(await read()));
  await p.evaluate(()=>document.getElementById('fb-msg').blur());
  await wait(800);
  console.log(name,'rời đi:',JSON.stringify(await read()));
  await b.close();
}
