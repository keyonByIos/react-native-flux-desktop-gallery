// 内存时间序列探针：渲染 heavy-charts（含实时流式图，自驱动画），每 2s 采样 memoryUsage，
// 每 5 个采样点强制 global.gc() 后复采，观察是否进入平台期（非无限涨）。
// 用法（gallery 目录）： node --expose-gc tools/ops-mem-timeseries.js
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-mem-ts';
process.env.FLUX_IDLE_SKIP = '0';
const lib = require('react-native-flux-desktop');
const React = require('react');
const { HeavyChartsDemo } = require('../dist/cases/heavy-charts.js');
const MB = 1024 * 1024;
const fmt = (u) => `rss=${(u.rss / MB).toFixed(1)} heapUsed=${(u.heapUsed / MB).toFixed(1)} external=${(u.external / MB).toFixed(1)} arrayBuffers=${((u.arrayBuffers || 0) / MB).toFixed(1)}`;
(async () => {
  if (typeof global.gc !== 'function') { console.log('[ts] 需 --expose-gc'); process.exit(1); }
  await lib.render(React.createElement(HeavyChartsDemo), { width: 1400, height: 900, title: 'ops-mem-ts' });
  await new Promise((r) => setTimeout(r, 800));
  const rss = [];
  for (let i = 1; i <= 20; i++) {
    await new Promise((r) => setTimeout(r, 2000)); // 让运行时自驱动画 ~2s
    const u = process.memoryUsage();
    rss.push(u.rss / MB);
    let line = `[ts] #${String(i).padStart(2)}  ${fmt(u)}`;
    if (i % 5 === 0) { // 周期性强制 GC，看原生/堆是否回落
      global.gc(); global.gc();
      await new Promise((r) => setImmediate(r)); await new Promise((r) => setTimeout(r, 120));
      const g = process.memoryUsage();
      line += `   | afterGC rss=${(g.rss / MB).toFixed(1)} heapUsed=${(g.heapUsed / MB).toFixed(1)} external=${(g.external / MB).toFixed(1)}`;
      rss.push(g.rss / MB);
    }
    console.log(line);
  }
  const mn = Math.min(...rss), mx = Math.max(...rss), last = rss[rss.length - 1];
  console.log(`[ts] ===== rss: min=${mn.toFixed(1)} max=${mx.toFixed(1)} last=${last.toFixed(1)} 峰值-末值=${(mx - last).toFixed(1)}MB 首末增=${(last - rss[0]).toFixed(1)}MB =====`);
  console.log('[ts] 判读：末值≈均值/增量为负或个位数MB=平台期(非泄漏)；持续单调正增长且 afterGC 不回落=真累积');
  process.exit(0);
})().catch((e) => { console.log('[ts] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
