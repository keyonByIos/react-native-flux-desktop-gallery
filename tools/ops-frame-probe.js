// Phase 0 帧成本剖析探针：挂载「真·Ops Live(HeavyChartsDemo)」，强制每帧全量重绘，
// 用 lib 侧 FLUX_FRAMESTATS 逐 30 帧输出「paint / present(data+paste) / layout」三巨头占比 + op/cull/bm 计数。
// 用法（在 gallery 目录）：node tools/ops-frame-probe.js
//   窗口尺寸可覆盖： set FLUX_PROBE_W=1400&& set FLUX_PROBE_H=900&& node tools/ops-frame-probe.js
// 说明：
//  - FLUX_IDLE_SKIP=0 关「空闲窗跳帧」，FLUX_SCROLLBLIT=0 关「滚动条带 blit」→ 每次 renderFrame 都走全量
//    paint+present，量到「一次真实重绘帧」的成本（Phase 1 扩缓存/op 瘦身要压的就是这个）。
//  - 探针同步紧循环里 pump 定时器无法插入，只有本循环在调 renderFrame，帧时不被后台动画噪声污染。
//  - 与正在运行的 gallery 主窗可能撞单实例锁：这里用独立 FLUX_APP_DIR=ops-probe 规避。
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-probe';
process.env.FLUX_FRAMESTATS = '1';
process.env.FLUX_IDLE_SKIP = '0';
process.env.FLUX_SCROLLBLIT = '0';

const lib = require('react-native-flux-desktop');
const React = require('react');
const { HeavyChartsDemo } = require('../dist/cases/heavy-charts.js');

const W = Number(process.env.FLUX_PROBE_W) || 1400;
const H = Number(process.env.FLUX_PROBE_H) || 900;

function pct(sorted, p) { return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]; }

(async () => {
  if (typeof HeavyChartsDemo !== 'function') {
    console.log('[ops-probe] FATAL: 未取到 HeavyChartsDemo（检查 dist/cases/heavy-charts.js 是否已构建）');
    process.exit(1);
  }
  await lib.render(React.createElement(HeavyChartsDemo), { width: W, height: H, title: 'ops-frame-probe' });
  await new Promise((r) => setTimeout(r, 500)); // 等首帧 + 字体/图集预热

  const recs = lib.Application.windows();
  const host = recs && recs[0] && recs[0].host;
  if (!host || typeof host.renderFrame !== 'function') {
    console.log('[ops-probe] FATAL: 拿不到 host.renderFrame（windows=' + (recs ? recs.length : 'null') + '）');
    process.exit(1);
  }
  console.log('[ops-probe] mode=CPU _gpuMode=' + (host._gpuMode === true) + ' 场景=Ops Live ' + W + 'x' + H);
  console.log('[ops-probe] 以下 [framestats] 行由 lib 每满 30 帧自动输出（win=30 滞动窗口，单位 ms）：');

  for (let i = 0; i < 30; i++) host.renderFrame(); // warmup：字体/图集/图片解码预热，且让首批 30 帧 dump 稳定

  const N = 240; // 8 个 30 帧窗口
  const times = [];
  for (let i = 0; i < N; i++) {
    const s = process.hrtime.bigint();
    host.renderFrame();
    const e = process.hrtime.bigint();
    times.push(Number(e - s) / 1e6);
  }
  const sorted = times.slice().sort((a, b) => a - b);
  const avg = times.reduce((a, b) => 0 + a + b, 0) / N;
  console.log(
    '[ops-probe] RESULT N=' + N +
    ' total avg=' + avg.toFixed(2) + 'ms' +
    ' p50=' + pct(sorted, 0.5).toFixed(2) +
    ' p95=' + pct(sorted, 0.95).toFixed(2) +
    ' max=' + sorted[N - 1].toFixed(2) +
    ' → 理论上限 fps=' + (1000 / avg).toFixed(1),
  );
  process.exit(0);
})().catch((err) => {
  console.log('[ops-probe] ERR ' + (err && err.stack ? err.stack : err.message));
  process.exit(1);
});
