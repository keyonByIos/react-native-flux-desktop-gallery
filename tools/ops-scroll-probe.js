// Phase 3 探针：在 heavy-charts 上「持续滚动 + 放行 tick 定时器」混压，读 lib 侧 [framestats] 的
// blit/full 命中与 skip 原因直方图，判断刷新帧能否走 coexist blit、被哪道闸拒。
// 用法（gallery 目录）： node tools/ops-scroll-probe.js
//   FLUX_PROBE_W/H 覆盖窗口；SCROLL=0 关闭滚动只测 tick；AWAIT_EVERY 每 N 帧让位一次宏任务。
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-scroll-probe';
process.env.FLUX_FRAMESTATS = '1';
process.env.FLUX_IDLE_SKIP = '0';
// 关键：本探针【不】关 SCROLLBLIT —— 要量的就是它在混压下的命中率与拒因。

const lib = require('react-native-flux-desktop');
const React = require('react');
const { HeavyChartsDemo } = require('../dist/cases/heavy-charts.js');

const W = Number(process.env.FLUX_PROBE_W) || 1400;
const H = Number(process.env.FLUX_PROBE_H) || 900;
const DO_SCROLL = process.env.SCROLL !== '0';
const AWAIT_EVERY = Number(process.env.AWAIT_EVERY) || 12;
const AWAIT_MS = Number(process.env.AWAIT_MS) || 40;
const N = Number(process.env.PROBE_N) || 360;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  if (typeof HeavyChartsDemo !== 'function') {
    console.log('[scroll-probe] FATAL: 未取到 HeavyChartsDemo');
    process.exit(1);
  }
  await lib.render(React.createElement(HeavyChartsDemo), { width: W, height: H, title: 'ops-scroll-probe' });
  await sleep(500);
  const recs = lib.Application.windows();
  const host = recs && recs[0] && recs[0].host;
  if (!host) { console.log('[scroll-probe] FATAL: 拿不到 host'); process.exit(1); }

  // 找主滚动容器（面积最大的 scroll 节点）与其视口中心，供 onWheel 命中
  let scroller = null;
  const visit = (n) => {
    if (n.kind === 'scroll' && (!scroller || n.w * n.h > scroller.w * scroller.h)) scroller = n;
    for (const c of n.children) visit(c);
  };
  visit(host.root);
  console.log('[scroll-probe] scroller=' + (scroller ? Math.round(scroller.w) + 'x' + Math.round(scroller.h) + ' id=' + scroller.id : 'NONE') + ' DO_SCROLL=' + DO_SCROLL);

  const cx = scroller ? Math.round(scroller.ax + scroller.w / 2) : Math.round(W / 2);
  const cy = scroller ? Math.round(scroller.ay + scroller.h / 2) : Math.round(H / 2);

  console.log('[scroll-probe] 混压 ' + N + ' 帧（每帧滚一小步 + 每 ' + AWAIT_EVERY + ' 帧让位 ' + AWAIT_MS + 'ms 放行 tick）：');
  for (let i = 0; i < N; i++) {
    if (DO_SCROLL && typeof host.onWheel === 'function') {
      // dy 负 → scrollY 增大（内容上移）；到底部后反向，制造来回滚动 + 偶发跳滚回顶
      host.onWheel({ x: cx, y: cy, dx: 0, dy: -24, mode: 'pixel' });
    }
    host.renderFrame();
    if (i % AWAIT_EVERY === AWAIT_EVERY - 1) await sleep(AWAIT_MS); // 让 React commit / tick 定时器上膛
  }
  console.log('[scroll-probe] done');
  process.exit(0);
})().catch((e) => { console.log('[scroll-probe] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
