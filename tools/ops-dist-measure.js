// 压缩比实测：对最终 exe 分别用 Brotli(max)/Gzip/Deflate 压，报告体积。仅测量用。
// 用法： node tools/ops-dist-measure.js [exePath]
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const MB = 1024 * 1024;
const exe = process.argv[2] || path.join(process.cwd(), 'output', 'React-Native-Flux-Desktop-Gallery-0.1.0.exe');
const buf = fs.readFileSync(exe);
console.log('原文件 ' + (buf.length / MB).toFixed(1) + ' MB  ' + exe);
const t0 = Date.now();
const br = zlib.brotliCompressSync(buf, {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
    [zlib.constants.BROTLI_PARAM_LARGE_WINDOW]: 1,
    [zlib.constants.BROTLI_PARAM_LGWIN]: 24,
  },
});
console.log(`Brotli(q11) ${(br.length / MB).toFixed(1)} MB  (${(buf.length / br.length).toFixed(2)}x)  ${Date.now() - t0}ms`);
const t1 = Date.now();
const gz = zlib.gzipSync(buf, { level: 9 });
console.log(`Gzip(l9)    ${(gz.length / MB).toFixed(1)} MB  (${(buf.length / gz.length).toFixed(2)}x)  ${Date.now() - t1}ms`);
