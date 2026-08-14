import puppeteer from 'puppeteer-core';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--hide-scrollbars','--force-device-scale-factor=2'],defaultViewport:{width:1440,height:900,deviceScaleFactor:2}});
const p=await b.newPage();
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await wait(900);
await p.screenshot({path:'shots/RT-header-dark.png',clip:{x:1000,y:0,width:440,height:80}});
// bắt khung giữa lúc loang
const box=await (await p.$('#theme-toggle')).boundingBox();
await p.mouse.click(box.x+box.width/2, box.y+box.height/2);
await wait(240);
await p.screenshot({path:'shots/RT-mid.png'});
await wait(900);
await p.screenshot({path:'shots/RT-header-light.png',clip:{x:1000,y:0,width:440,height:80}});
await p.screenshot({path:'shots/RT-full-light.png'});
console.log('ok');
await b.close();
