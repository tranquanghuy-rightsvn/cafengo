import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.goto('https://albi-coffe.netlify.app/', { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, 2500));
await page.evaluate(() => document.getElementById('contact').scrollIntoView());
await new Promise((r) => setTimeout(r, 6000));

const frames = await page.evaluate(() =>
  [...document.querySelectorAll('iframe')].map((f, i) => {
    const b = f.getBoundingClientRect();
    return { i, src: f.src.slice(0, 60), w: Math.round(b.width), h: Math.round(b.height), cls: f.className };
  })
);
console.log(JSON.stringify(frames, null, 1));

const handle = await page.evaluateHandle(() =>
  [...document.querySelectorAll('iframe')].find((f) => f.src.includes('google.com/maps'))
);
const el = handle.asElement();
if (el) {
  await el.screenshot({ path: 'shots/map.png' });
  const box = await el.boundingBox();
  console.log('map box', JSON.stringify(box));
} else {
  console.log('MAP IFRAME NOT FOUND');
}
await browser.close();
