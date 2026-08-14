import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const sel = process.argv[3];
function find(n, re) { if (re.test(n.c || '')) return n; if (Array.isArray(n.kids)) for (const k of n.kids) { const r = find(k, re); if (r) return r; } return null; }
const grid = find(d, new RegExp(sel));
if (!grid) { console.log('grid not found'); process.exit(0); }
const P = (n, ind) => {
  const st = n.st || {};
  console.log(`${ind}<${n.t} ${(n.c||'').split(' ').slice(0,2).join('.')}> ${n.box.w}x${n.box.h} fs=${st.fontSize} lh=${st.lineHeight} m=${st.margin} p=${st.padding}${n.txt ? ' "' + n.txt.slice(0,22) + '"' : ''}`);
  if (Array.isArray(n.kids)) n.kids.forEach(k => P(k, ind + '  '));
};
grid.kids.forEach((c, i) => { console.log('=== CARD ' + i); P(c, ' '); });
