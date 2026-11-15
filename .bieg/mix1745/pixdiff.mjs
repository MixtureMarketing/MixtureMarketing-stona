import sharp from 'sharp';
const [a, b] = process.argv.slice(2);
const A = await sharp(a).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const B = await sharp(b).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
let n = 0, max = 0, minY = 1e9, maxY = -1;
const w = A.info.width;
for (let i = 0; i < A.data.length; i += 4) {
  const d = Math.max(...[0, 1, 2].map((c) => Math.abs(A.data[i + c] - B.data[i + c])));
  if (d > 16) { n++; const y = Math.floor(i / 4 / w); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  max = Math.max(max, d);
}
console.log(`${a.split('/').pop()} vs ${b.split('/').pop()}: px>16=${n} of ${A.data.length / 4} max=${max} rows=${minY}..${maxY} (half scale)`);
