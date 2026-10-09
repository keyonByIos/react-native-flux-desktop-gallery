// PNG 逐像素比对：node tools/ops-pngdiff.js <a.png> <b.png>
// 用 lib 依赖的 @napi-rs/canvas 解码为 RGBA，统计差异字节数/最大通道差/差异占比。
const { createCanvas, loadImage } = require('@napi-rs/canvas');

(async () => {
  const [pa, pb] = [process.argv[2], process.argv[3]];
  const a = await loadImage(pa);
  const b = await loadImage(pb);
  if (a.width !== b.width || a.height !== b.height) {
    console.log('[diff] SIZE MISMATCH a=' + a.width + 'x' + a.height + ' b=' + b.width + 'x' + b.height);
    process.exit(2);
  }
  const grab = (img) => {
    const c = createCanvas(img.width, img.height);
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    return x.getImageData(0, 0, c.width, c.height).data;
  };
  const da = grab(a);
  const db = grab(b);
  let diffBytes = 0;
  let maxDelta = 0;
  let diffPixels = 0;
  let minX = 1e9; let minY = 1e9; let maxX = -1; let maxY = -1;
  let strong = 0; // 通道差 >40 的像素（潜在可见）
  for (let i = 0; i < da.length; i += 4) {
    let px = 0;
    for (let k = 0; k < 4; k++) {
      const d = Math.abs(da[i + k] - db[i + k]);
      if (d > 0) { diffBytes++; if (d > maxDelta) maxDelta = d; }
      if (d > px) px = d;
    }
    if (px > 0) {
      diffPixels++;
      if (px > 40) strong++;
      const p = i / 4; const x = p % a.width; const y = (p / a.width) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const totalPx = da.length / 4;
  console.log('[diff] ' + pa.split(/[\\/]/).pop() + ' vs ' + pb.split(/[\\/]/).pop() +
    ' dims=' + a.width + 'x' + a.height +
    ' diffBytes=' + diffBytes + '/' + da.length +
    ' diffPixels=' + diffPixels + '/' + totalPx +
    ' (' + (diffPixels / totalPx * 100).toFixed(4) + '%)' +
    ' strong(>40)=' + strong +
    ' maxDelta=' + maxDelta);
  if (diffPixels > 0) {
    console.log('[diff] bbox=' + minX + ',' + minY + ' -> ' + maxX + ',' + maxY + '  (area=' + (maxX - minX + 1) + 'x' + (maxY - minY + 1) + ')');
  }
  process.exit(diffBytes === 0 ? 0 : 1);
})().catch((e) => { console.log('[diff] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(3); });
