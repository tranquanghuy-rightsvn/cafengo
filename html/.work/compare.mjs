/*
 * compare.mjs — diff orig vs clone section shots at a given width.
 *   W=1920 node compare.mjs [key1,key2,...]
 * Crops both images to the common width/height, reports similarity % and the
 * raw size delta (so a height mismatch can never hide behind a good %).
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const W = Number(process.env.W || 1920);
const SHOTS = path.join(process.cwd(), 'shots');
const REPORT = process.env.REPORT || null;
const only = process.argv[2] ? process.argv[2].split(',') : null;

const keys = ['header', 'hero', 'menu', 'invest', 'philosophy', 'testimonials', 'reservations', 'contact', 'footer'];
const rows = [];

function crop(png, w, h) {
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, 0, 0, w, h, 0, 0);
  return out;
}

for (const key of keys) {
  if (only && !only.includes(key)) continue;
  const a = path.join(SHOTS, `orig-${key}-${W}.png`);
  const b = path.join(SHOTS, `clone-${key}-${W}.png`);
  if (!fs.existsSync(a) || !fs.existsSync(b)) { rows.push({ key, note: 'missing shot' }); continue; }

  let A = PNG.sync.read(fs.readFileSync(a));
  let B = PNG.sync.read(fs.readFileSync(b));
  const dh = B.height - A.height;
  const dw = B.width - A.width;
  const w = Math.min(A.width, B.width);
  const h = Math.min(A.height, B.height);
  if (A.width !== w || A.height !== h) A = crop(A, w, h);
  if (B.width !== w || B.height !== h) B = crop(B, w, h);

  const diff = new PNG({ width: w, height: h });
  const bad = pixelmatch(A.data, B.data, diff.data, w, h, { threshold: 0.12, includeAA: true, alpha: 0.4 });
  const total = w * h;
  const sim = ((1 - bad / total) * 100);
  const diffPath = REPORT ? path.join(REPORT, `diff-${key}-${W}.png`) : path.join(SHOTS, `diff-${key}-${W}.png`);
  fs.mkdirSync(path.dirname(diffPath), { recursive: true });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  rows.push({ key, sim: sim.toFixed(2) + '%', size: `${w}x${h}`, dW: dw, dH: dh, badPx: bad });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n== viewport ${W}px ==`);
console.log(pad('section', 14) + pad('similar', 10) + pad('size', 14) + pad('ΔW', 7) + pad('ΔH', 8) + 'diff px');
for (const r of rows) {
  if (r.note) { console.log(pad(r.key, 14) + r.note); continue; }
  console.log(pad(r.key, 14) + pad(r.sim, 10) + pad(r.size, 14) + pad(r.dW, 7) + pad(r.dH, 8) + r.badPx);
}
fs.writeFileSync(path.join(SHOTS, `compare-${W}.json`), JSON.stringify(rows, null, 1));
