import fs from 'node:fs';
import { PNG } from 'pngjs';
const p = PNG.sync.read(fs.readFileSync(process.argv[2]));
/* the flap occupies the upper-left triangle of the fold square in these crops;
   sample a band just inside it, away from the crease sheen */
let sum = 0, n = 0;
for (let y = 0; y < p.height; y++) {
  for (let x = 0; x < p.width; x++) {
    const i = (p.width * y + x) << 2;
    // restrict to the fold square (bottom-right region of the crop)
    if (x < p.width * 0.42 || y < p.height * 0.42) continue;
    // upper-left of the anti-diagonal = the flap
    const dx = (x - p.width * 0.42) / (p.width * 0.58);
    const dy = (y - p.height * 0.42) / (p.height * 0.58);
    if (dx + dy > 0.85) continue;         // skip crease + void side
    if (dx + dy < 0.15) continue;         // skip the extreme tip corner
    sum += 0.2126 * p.data[i] + 0.7152 * p.data[i + 1] + 0.0722 * p.data[i + 2];
    n++;
  }
}
console.log(process.argv[2].padEnd(26), 'mean luminance =', (sum / n).toFixed(2), '(' + n + ' px)');
