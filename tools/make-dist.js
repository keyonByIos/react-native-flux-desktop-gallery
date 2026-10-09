// 分发压缩：把 output/ 里的最终 exe 压成小得多的分发包（"发出去的体积"砍一半以上）。
// 零外部依赖——纯 Node 实现 ZIP(deflate)，收件人双击即可解压（Win/macOS/Linux 原生支持）。
// 用法（gallery 目录）：
//   node tools/make-dist.js                → 压 output/ 里最新的 *.exe 为同名 .zip（deflate，通用）
//   node tools/make-dist.js <exe路径>       → 指定 exe
//   node tools/make-dist.js --br [q]        → 额外产出 .br（Brotli，体积更小，需 `node tools/make-dist.js --unbr` 解）
//   node tools/make-dist.js --unbr <文件.br> → 解 .br 回 exe（自用/归档用，收件人一般用 zip）
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const MB = 1024 * 1024;

// ---------- CRC32 ----------
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

function dosDateTime(ms) {
  const d = new Date(ms);
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds() / 2)),
    date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

// 单文件 ZIP（method 8 = deflate）
function makeZip(name, data, mtimeMs) {
  const comp = zlib.deflateRawSync(data, { level: 9 });
  const crc = crc32(data);
  const { time, date } = dosDateTime(mtimeMs);
  const nameBuf = Buffer.from(name, 'utf8');
  const nLen = nameBuf.length;

  const local = Buffer.alloc(30 + nLen);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6); local.writeUInt16LE(8, 8);
  local.writeUInt16LE(time, 10); local.writeUInt16LE(date, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nLen, 26); local.writeUInt16LE(0, 28);
  nameBuf.copy(local, 30);

  const central = Buffer.alloc(46 + nLen);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0, 8); central.writeUInt16LE(8, 10);
  central.writeUInt16LE(time, 12); central.writeUInt16LE(date, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(comp.length, 20); central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nLen, 28); central.writeUInt16LE(0, 30); central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34); central.writeUInt16LE(0, 36); central.writeUInt32LE(0, 38);
  central.writeUInt32LE(0, 42); // local header offset
  nameBuf.copy(central, 46);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8); eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(central.length, 12); eocd.writeUInt32LE(local.length + comp.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([local, comp, central, eocd]);
}

function findNewestExe() {
  const dir = path.join(process.cwd(), 'output');
  const exes = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.exe')).map((f) => path.join(dir, f));
  if (!exes.length) throw new Error('output/ 下没有 *.exe，先 npm run pack');
  return exes.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function brotliParams(q) {
  return { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: q, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_LARGE_WINDOW]: 1 } };
}

function main() {
  const args = process.argv.slice(2);
  // 解压 .br 模式
  if (args[0] === '--unbr') {
    const src = args[1]; if (!src) throw new Error('用法：node tools/make-dist.js --unbr <文件.br>');
    const out = src.replace(/\.br$/, '');
    const t = Date.now();
    fs.writeFileSync(out, zlib.brotliDecompressSync(fs.readFileSync(src)));
    console.log(`[dist] 解压 ${path.basename(src)} → ${path.basename(out)}  ${(fs.statSync(out).size / MB).toFixed(1)}MB  ${((Date.now() - t) / 1000).toFixed(1)}s`);
    return;
  }
  const wantBr = args.includes('--br');
  const qIdx = args.indexOf('--br');
  const q = qIdx >= 0 && args[qIdx + 1] && /^\d+$/.test(args[qIdx + 1]) ? Number(args[qIdx + 1]) : 9;
  const pos = args.filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));
  const exe = pos[0] ? path.resolve(pos[0]) : findNewestExe();
  const st = fs.statSync(exe);
  const data = fs.readFileSync(exe);
  const base = path.basename(exe, '.exe');
  console.log(`[dist] 源 ${path.basename(exe)}  ${(data.length / MB).toFixed(1)}MB`);

  // ZIP（通用分发）
  const t1 = Date.now();
  const zipPath = path.join(path.dirname(exe), base + '.zip');
  fs.writeFileSync(zipPath, makeZip(path.basename(exe), data, st.mtimeMs));
  const zipSz = fs.statSync(zipPath).size;
  console.log(`[dist] ZIP      → ${path.basename(zipPath)}  ${(zipSz / MB).toFixed(1)}MB  (${(data.length / zipSz).toFixed(2)}x)  ${((Date.now() - t1) / 1000).toFixed(1)}s   ← 发这个，收件人双击解压`);

  // Brotli（可选，极致体积，自用/归档）
  if (wantBr) {
    const t2 = Date.now();
    const brPath = path.join(path.dirname(exe), base + '.exe.br');
    fs.writeFileSync(brPath, zlib.brotliCompressSync(data, brotliParams(q)));
    const brSz = fs.statSync(brPath).size;
    console.log(`[dist] Brotli q${q} → ${path.basename(brPath)}  ${(brSz / MB).toFixed(1)}MB  (${(data.length / brSz).toFixed(2)}x)  ${((Date.now() - t2) / 1000).toFixed(1)}s   ← 解：node tools/make-dist.js --unbr ${path.basename(brPath)}`);
  }
}
try { main(); } catch (e) { console.error('[dist] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); }
