// Phase 内存探针：挂 heavy-charts，渲染若干帧后，把「进程内存」与「各离屏画布缓冲」逐项拆开量化，
// 定位 cacheAsBitmap(node.__bm) 与 CanvasLayer(customBitmaps) 这两块「拿内存换帧成本」的真实占用。
// 用法（gallery 目录）： node tools/ops-mem-probe.js
//   MEM_NOCACHE=1 → 关位图缓存(FLUX_NOCACHE)对照，量 Phase 1 的净内存增量。
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-mem-probe';
process.env.FLUX_IDLE_SKIP = '0';
process.env.FLUX_SCROLLBLIT = '0'; // 关滚动 blit：避免双面 faces 干扰，聚焦位图缓存本身
if (process.env.MEM_NOCACHE === '1') process.env.FLUX_NOCACHE = '1';

const lib = require('react-native-flux-desktop');
const React = require('react');
const { HeavyChartsDemo } = require('../dist/cases/heavy-charts.js');
const MB = 1024 * 1024;

(async () => {
  await lib.render(React.createElement(HeavyChartsDemo), { width: 1400, height: 900, title: 'ops-mem-probe' });
  await new Promise((r) => setTimeout(r, 600));
  const recs = lib.Application.windows();
  const host = recs && recs[0] && recs[0].host;
  if (!host) { console.log('[mem] FATAL no host'); process.exit(1); }
  for (let i = 0; i < 60; i++) host.renderFrame(); // 稳态：位图缓存已烘、CanvasLayer 已画

  let bmCount = 0; let bmBytes = 0;
  let cvCount = 0; let cvBoxBytes = 0; // fluxcanvas Image 节点数（自定义位图按 box 估）
  let nodeCount = 0;
  const walk = (n) => {
    nodeCount++;
    if (n.__bm && n.__bm.canvas) { bmCount++; bmBytes += (n.__bm.canvas.width || 0) * (n.__bm.canvas.height || 0) * 4; }
    const src = n.props && n.props.source;
    if (typeof src === 'string' && src.startsWith('fluxcanvas:')) { cvCount++; cvBoxBytes += Math.round(n.w * 2) * Math.round(n.h * 2) * 4; }
    for (const c of n.children) walk(c);
  };
  walk(host.root);

  const u = process.memoryUsage();
  const cb = lib.customBitmapStats ? lib.customBitmapStats() : { count: -1, bytes: -1 };
  const ics = lib.imageCacheStats ? lib.imageCacheStats() : { count: -1, bytes: -1 };
  const gm = host.getMemStats();

  console.log('[mem] ===== heavy-charts 内存分解 =====');
  console.log('[mem] rss=' + (u.rss / MB).toFixed(1) + ' heapUsed=' + (u.heapUsed / MB).toFixed(1)
    + ' heapTotal=' + (u.heapTotal / MB).toFixed(1) + ' external=' + (u.external / MB).toFixed(1)
    + ' arrayBuffers=' + ((u.arrayBuffers || 0) / MB).toFixed(1) + ' MB');
  console.log('[mem] faces=' + gm.faces + ' surfaceMB=' + gm.surfaceMB.toFixed(1) + ' (' + Math.round(gm.w) + 'x' + Math.round(gm.h) + '@' + gm.dpr + ')');
  console.log('[mem] cacheAsBitmap __bm: count=' + bmCount + ' bytes=' + (bmBytes / MB).toFixed(1) + ' MB');
  console.log('[mem] CanvasLayer customBitmaps: count=' + cb.count + ' bytes=' + (cb.bytes / MB).toFixed(1) + ' MB  (fluxcanvas Image 节点=' + cvCount + ', box估=' + (cvBoxBytes / MB).toFixed(1) + 'MB)');
  console.log('[mem] imageCache(URI 解码): count=' + ics.count + ' bytes=' + (ics.bytes / MB).toFixed(1) + ' MB');
  console.log('[mem] nodes=' + nodeCount + '  NOCACHE=' + (process.env.FLUX_NOCACHE === '1'));
  process.exit(0);
})().catch((e) => { console.log('[mem] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
