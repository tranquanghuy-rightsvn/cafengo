import fs from 'node:fs';
import { PNG } from 'pngjs';
const lum = (p, x0, y0, x1, y1) => {
  let s = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (p.width * y + x) << 2;
    s += 0.2126 * p.data[i] + 0.7152 * p.data[i+1] + 0.0722 * p.data[i+2]; n++;
  }
  return s / n;
};
for (const f of process.argv.slice(2)) {
  const p = PNG.sync.read(fs.readFileSync(f));
  /* flat page well away from the fold, vs the body of the flap */
  const page = lum(p, 40, 40, 200, 200);
  const flap = lum(p, Math.round(p.width*0.52), Math.round(p.height*0.52), Math.round(p.width*0.66), Math.round(p.height*0.66));
  console.log(f.padEnd(20), 'flat page =', page.toFixed(2), ' flap body =', flap.toFixed(2),
              ' flap/page =', (flap/page).toFixed(2));
}
