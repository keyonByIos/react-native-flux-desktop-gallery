// 差异可视化：以 a 为底，把与 b 不同的像素标红，存 ops-diff.png。
// node tools/ops-pngviz.js <a.png> <b.png> <out.png>
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

(async () => {
  const [pa, pb, po] = [process.argv[2], process.argv[3], process.argv[4] || 'grab-cmp/ops-diff.png'];
  const a = await loadImage(pa);
  const b = await loadImage(pb);
  const W = a.width; const H = a.height;
  const ca = createCanvas(W, H); const xa = ca.getContext('2d'); xa.drawImage(a, 0, 0);
  const cb = createCanvas(W, H); const xb = cb.getContext('2d'); xb.drawImage(b, 0, 0);
  const da = xa.getImageData(0, 0, W, H);
  const db = xb.getImageData(0, 0, W, H);
  const d = da.data; const e = db.data;
  // 放大底图亮度无关：直接在 a 副本上标红差异
  for (let i = 0; i < d.length; i += 4) {
    const diff = Math.abs(d[i] - e[i]) + Math.abs(d[i + 1] - e[i + 1]) + Math.abs(d[i + 2] - e[i + 2]) + Math.abs(d[i + 3] - e[i + 3]);
    if (diff > 0) { d[i] = 255; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255; }
    else { d[i] = 24; d[i + 1] = 24; d[i + 2] = 28; d[i + 3] = 255; }
  }
  xa.putImageData(da, 0, 0);
  fs.writeFileSync(po, ca.toBuffer('image/png'));
  console.log('[viz] wrote ' + po);
})().catch((err) => { console.log('[viz] ERR ' + (err && err.stack ? err.stack : err.message)); process.exit(3); });
