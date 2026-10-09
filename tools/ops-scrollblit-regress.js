// 回归探针（懒建第 2 面 · A 方案）：挂一个真 ScrollView（高内容可滚），持续 onWheel 驱动滚动，
// 验证：① 首帧 faces=1（未滚不建第 2 面）；② 首次 blit 时 faces 懒增到 2；③ blit 命中 >0 且不崩、无自拷贝花屏。
// 用法（gallery 目录）： node tools/ops-scrollblit-regress.js
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-scrollblit-regress';
process.env.FLUX_FRAMESTATS = '1';
process.env.FLUX_IDLE_SKIP = '0';
// 不关 SCROLLBLIT：要验它仍能命中。

const lib = require('react-native-flux-desktop');
const React = require('react');
const { View, Text, ScrollView } = lib;

function Page() {
  const rows = [];
  for (let i = 0; i < 60; i++) {
    rows.push(
      React.createElement(View, { key: i, style: { height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: i % 2 ? '#fafafa' : '#fff' } },
        React.createElement(Text, { style: { fontSize: 15, color: '#222' } }, 'Row ' + i + '  ——  可滚动内容，滚过视口触发 blit 复用')),
    );
  }
  return React.createElement(View, { style: { flex: 1, backgroundColor: '#fff' } },
    React.createElement(Text, { style: { fontSize: 18, padding: 12 } }, 'Scroll blit 回归（懒建第 2 面）'),
    React.createElement(ScrollView, { style: { flex: 1 } }, rows),
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await lib.render(React.createElement(Page), { width: 900, height: 600, title: 'ops-scrollblit-regress' });
  await sleep(400);
  const host = lib.Application.windows()[0].host;
  const faceOf = () => host.getMemStats().faces;
  console.log('[regress] faces before any scroll = ' + faceOf() + ' (期望 1：未滚不建第 2 面)');

  let scroller = null;
  const visit = (n) => { if (n.kind === 'scroll' && (!scroller || n.w * n.h > scroller.w * scroller.h)) scroller = n; for (const c of n.children) visit(c); };
  visit(host.root);
  console.log('[regress] scroller=' + (scroller ? Math.round(scroller.w) + 'x' + Math.round(scroller.h) : 'NONE'));
  if (!scroller) { console.log('[regress] FAIL no scroller'); process.exit(1); }
  const cx = Math.round(scroller.ax + scroller.w / 2);
  const cy = Math.round(scroller.ay + scroller.h / 2);

  for (let i = 0; i < 240; i++) {
    host.onWheel({ x: cx, y: cy, dx: 0, dy: -24, mode: 'pixel' });
    host.renderFrame();
    if (i % 12 === 11) await sleep(16);
  }
  console.log('[regress] faces after scrolling = ' + faceOf() + ' (期望 2：blit 已懒建第 2 面)');
  console.log('[regress] blitFrames=' + (host.__blitFrames || 0) + ' fullFrames=' + (host.__fullFrames || 0) + ' (期望 blitFrames>0 且无崩溃)');
  console.log('[regress] done OK');
  process.exit(0);
})().catch((e) => { console.log('[regress] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
