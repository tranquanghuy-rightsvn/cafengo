import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox'],defaultViewport:{width:1920,height:1080}});
const p=await b.newPage();
p.on('response',r=>{if(r.status()>=400)console.log(r.status(),r.url())});
await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle2'});
await b.close();
