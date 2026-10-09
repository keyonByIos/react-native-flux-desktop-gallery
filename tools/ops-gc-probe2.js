// 严谨版 GC 探针：让出事件循环使 Node-API finalizer 真正执行，再测内存是否回落。
// 用法： node --expose-gc tools/ops-gc-probe2.js
const { createCanvas } = require('@napi-rs/canvas');
const MB = 1024 * 1024;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 让出若干轮事件循环 + 微任务，给 napi finalizer / V8 weak cb 执行机会
async function settle() {
  for (let i = 0; i < 5; i++) { await new Promise((r) => setImmediate(r)); await sleep(30); }
  if (typeof global.gc === 'function') { global.gc(); global.gc(); }
  for (let i = 0; i < 5; i++) { await new Promise((r) => setImmediate(r)); await sleep(30); }
}
async function snap(tag) {
  await settle();
  const u = process.memoryUsage();
  console.log(`[gc2] ${tag.padEnd(28)} rss=${(u.rss / MB).toFixed(1)} heapUsed=${(u.heapUsed / MB).toFixed(1)} external=${(u.external / MB).toFixed(1)} MB`);
}
const mk = (color) => {
  const a = [];
  for (let i = 0; i < 16; i++) {
    const c = createCanvas(1600, 1200);
    const cx = c.getContext('2d');
    cx.fillStyle = color; cx.fillRect(0, 0, 1600, 1200);
    cx.getImageData(0, 0, 1600, 1200);
    a.push(c);
  }
  return a;
};
(async () => {
  if (typeof global.gc !== 'function') { console.log('[gc2] 需 --expose-gc'); process.exit(1); }
  await snap('baseline');
  let arr = mk('#3a7'); await snap('mounted 16 canvas');
  arr = null; await snap('destroy + yield + gc');   // ← 关键：让出循环后再测
  arr = mk('#73a'); await snap('realloc 16 (reuse?)'); // ← 若≈mounted 则复用=非泄漏；若再翻倍=真滞留
  arr = null; await snap('destroy all + yield + gc');  // ← 若回落到 baseline 附近=非泄漏
  process.exit(0);
})().catch((e) => { console.log('[gc2] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
