// GC 语义探针：验证「组件销毁后内存不降」到底是「真泄漏」还是「GC/OS 黏性」。
// 用与 __bm/CanvasLayer 完全同源的 @napi-rs/canvas 离屏面（同一 Skia 分配器 + napi finalizer）。
// 用法（必须带 --expose-gc）：  node --expose-gc tools/ops-gc-probe.js
const { createCanvas } = require('@napi-rs/canvas');
const MB = 1024 * 1024;
const snap = (tag) => {
  const u = process.memoryUsage();
  console.log(`[gc] ${tag.padEnd(26)} rss=${(u.rss / MB).toFixed(1)} heapUsed=${(u.heapUsed / MB).toFixed(1)} external=${(u.external / MB).toFixed(1)} MB`);
};
const hasGc = typeof global.gc === 'function';
if (!hasGc) { console.log('[gc] FATAL: 需 --expose-gc 启动'); process.exit(1); }

// 1600x1200 RGBA ≈ 7.3MB/张（≈ heavy-charts 一张全窗面 / 若干 __bm 的合体）
const W = 1600, H = 1200, N = 16; // ~117MB
snap('baseline');

let arr = [];
for (let i = 0; i < N; i++) {
  const c = createCanvas(W, H);
  const cx = c.getContext('2d');
  cx.fillStyle = '#3a7'; cx.fillRect(0, 0, W, H); // 落笔
  cx.getImageData(0, 0, W, H); // 强制光栅化（同 present 每帧 canvas.data()）→ Skia 背面缓冲真正分配
  arr.push(c);
}
global.gc(); global.gc();
snap(`mounted ${N} canvas`);

// —— 关键动作：销毁（丢引用），等价于组件 unmount 后 __bm/面变成垃圾 ——
arr = [];
snap('after destroy (NO gc)');   // ← 若这里 external 仍高，就复现了用户现象
global.gc(); global.gc(); global.gc();
snap('after destroy (gc x3)');    // ← 若这里 external 回落，证明非泄漏、是 GC 未跑

// 再分配同量 16 张：若 RSS 仍≈295（而不是→530）→ 上一批已被内部释放、只是页未归还 OS（分配器复用）——非泄漏。
// 若 RSS→≈530 → 上一批没被复用/未释放 → 真滞留。
arr = [];
for (let i = 0; i < N; i++) {
  const c = createCanvas(W, H);
  const cx = c.getContext('2d');
  cx.fillStyle = '#73a'; cx.fillRect(0, 0, W, H);
  cx.getImageData(0, 0, W, H);
  arr.push(c);
}
global.gc(); global.gc();
snap(`realloc ${N} canvas (reuse?)`);
