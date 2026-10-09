// 图片内存清单扫描：读 PNG/JPEG 头取宽高，算「解码内存 = w*h*4」，按解码 MB 降序打印。
// 同时对比 assets/ 与 assets-orig/ 判断是否已降采样。
// 用法（gallery 目录）： node tools/ops-img-scan.js
const fs = require('fs');
const path = require('path');
const MB = 1024 * 1024;

// 解析图片宽高（PNG IHDR / JPEG SOF marker）
function dims(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0x89 && buf[1] === 0x50) { // PNG
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  // JPEG: 扫 SOF0..SOF15
  let off = 2;
  while (off < buf.length) {
    if (buf[off] !== 0xff) { off++; continue; }
    const m = buf[off + 1];
    const len = buf.readUInt16BE(off + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: buf.readUInt16BE(off + 5), w: buf.readUInt16BE(off + 7) };
    }
    off += 2 + len;
  }
  return { w: 0, h: 0 };
}
function scanDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).map((f) => {
    const p = path.join(dir, f);
    const { w, h } = dims(p);
    return { file: f, w, h, diskKB: Math.round(fs.statSync(p).size / 1024), decMB: (w * h * 4) / MB };
  });
}
const ROOT = process.cwd();
const live = scanDir(path.join(ROOT, 'assets'));
const orig = scanDir(path.join(ROOT, 'assets-orig'));
const om = Object.fromEntries(orig.map((o) => [o.file, o]));

console.log('===== assets/（运行时用）按解码内存降序 =====');
console.log('file'.padEnd(22) + '尺寸'.padEnd(14) + '磁盘KB'.padEnd(9) + '解码MB'.padEnd(9) + '原图尺寸'.padEnd(14) + '已降采样?');
let totDec = 0, totDisk = 0;
for (const r of live.sort((a, b) => b.decMB - a.decMB)) {
  totDec += r.decMB; totDisk += r.diskKB;
  const o = om[r.file];
  const shrunk = o ? (r.w < o.w || r.h < o.h) : (o === undefined ? '(无原图)' : false);
  const flag = !o ? '无orig' : shrunk ? `是 ${o.w}x${o.h}→${r.w}x${r.h}` : `否 同${o.w}x${o.h}`;
  console.log(r.file.padEnd(22) + `${r.w}x${r.h}`.padEnd(14) + String(r.diskKB).padEnd(9) + r.decMB.toFixed(1).padEnd(9) + (o ? `${o.w}x${o.h}` : '-').padEnd(14) + flag);
}
console.log(`----- 合计：解码 ${totDec.toFixed(1)}MB  磁盘 ${(totDisk / 1024).toFixed(1)}MB  共 ${live.length} 张`);

const shots = scanDir(path.join(ROOT, 'shots'));
if (shots.length) {
  const sDec = shots.reduce((a, r) => a + r.decMB, 0);
  console.log(`\n[shots/] ${shots.length} 张，合计解码 ${sDec.toFixed(1)}MB（若运行时不引用则与内存无关，仅占磁盘）`);
}
console.log('\n判读：解码MB 大且「已降采样?=否」的即元凶；目标分辨率≈显示尺寸×2(留高DPI余量)。');
