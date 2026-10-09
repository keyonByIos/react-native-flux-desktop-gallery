// Welcome 页滚动剖析探针：起【完整 Shell】（受控 scrollY + 右侧锚点静区 + 13 图），停在 sys-welcome，
// 驱动内容 ScrollView 滚轮，读 lib 侧 [framestats] 的 blit/full 命中、skip 拒因直方图、paint/present/layout 拆解。
// 目的：坐实「整数 DPI 下 Welcome 滚动为何仍 <20fps」——到底是哪道闸把 blit 打回全量帧，成本压在哪一段。
// 用法（gallery 目录）： node tools/ops-welcome-scroll-probe.js
//   PROBE_PHASE=cross 跨章节稳滚（默认，会让 activeHref 变色命中锚点静区）；pure 连续快滚少让位（看纯滚动 blit 命中率）。
//   FLUX_PROBE_W/H 覆盖窗口高（宽固定 1280 与真实主窗一致）；PROBE_N 帧数。
process.env.FLUX_PACKAGED = '1'; // prod 构建：贴近打包态 CPU 成本（省 dev warning 噪声）
process.env.NODE_ENV = 'production';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-welcome-scroll-probe';
process.env.FLUX_FRAMESTATS = '1';
process.env.FLUX_IDLE_SKIP = '0'; // 关空闲跳帧：每 renderFrame 都真正落笔，才量得到重绘成本
// 关键：【不】关 SCROLLBLIT——要量的就是它在真实 Welcome 滚动下的命中率与拒因。
process.env.FLUX_SECTION = 'sys';
process.env.FLUX_ACTIVE = 'sys-welcome';

const React = require('react');
const fs = require('fs');
const path = require('path');
const flux = require('react-native-flux-desktop');
const {
  render, Window, View, FluxProvider, ContextMenuLayer, TextSelectionLayer, DragLayer,
  App: FeedbackApp, Application, acquireSingleInstance, configureLogger,
} = flux;
const { seedThemeFromEnv, useAppTheme } = require('../dist/components/ThemeSettings');
const Shell = require('../dist/Shell').Shell;

const APP = (() => {
  const fallback = { name: 'App', icon: 'assets/icon.png' };
  try { return Object.assign(fallback, JSON.parse(fs.readFileSync(path.join(process.cwd(), 'app.json'), 'utf8'))); }
  catch { return fallback; }
})();
if (APP.icon) process.env.FLUX_ICON = path.isAbsolute(APP.icon) ? APP.icon : path.join(process.cwd(), APP.icon);
process.env.FLUX_APP_ID = `FluxDesktop.${String(APP.name).replace(/[^0-9A-Za-z]+/g, '')}`;

const W = 1280; // 与真实主窗同宽
const H = Number(process.env.FLUX_PROBE_H) || 720;
const N = Number(process.env.PROBE_N) || 300;
const PHASE = process.env.PROBE_PHASE || 'cross';
const AWAIT_EVERY = Number(process.env.AWAIT_EVERY) || (PHASE === 'pure' ? 60 : 1); // cross：默认每帧都让位，让受控 scrollY 真前进（贴近真机每滚轮→commit）
const AWAIT_MS = Number(process.env.AWAIT_MS) || 30;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function Root() {
  const { dark, compact, primary, animation } = useAppTheme();
  const algorithm = [dark ? 'dark' : 'default'];
  if (compact) algorithm.push('compact');
  const token = { colorPrimary: primary, colorLink: primary, colorInfo: primary };
  return React.createElement(
    Window, { title: APP.name, width: W, height: H, minWidth: 1280, minHeight: 640 },
    React.createElement(
      FluxProvider, { theme: { algorithm, token }, animation },
      React.createElement(FeedbackApp, null,
        React.createElement(Shell, {
          dark, compact, animation, primary, appName: APP.name,
          setDark: (v) => Application.config.setTheme({ dark: v }),
          setCompact: (v) => Application.config.setTheme({ compact: v }),
          setAnimation: (v) => Application.config.setTheme({ animation: v }),
          setPrimary: (v) => Application.config.setTheme({ primary: v }),
        })),
      React.createElement(ContextMenuLayer, null),
      React.createElement(TextSelectionLayer, null),
      React.createElement(DragLayer, null)
    )
  );
}

(async () => {
  configureLogger({ path: APP.logger && APP.logger.path, level: APP.logger && APP.logger.level });
  seedThemeFromEnv();
  if (!acquireSingleInstance({ name: `flux-probe-${String(APP.name).replace(/[^0-9A-Za-z]+/g, '')}`, allowMulti: true })) {
    console.log('[probe] 单实例未获取（allowMulti 应恒 true，异常）'); process.exit(1);
  }
  await render(React.createElement(Root));
  await sleep(600); // 首帧 + 13 图解码预热
  const host = (Application.windows() || [])[0] && Application.windows()[0].host;
  if (!host) { console.log('[probe] FATAL 拿不到 host'); process.exit(1); }

  // 选内容滚动容器：面积最大且 ax 在左菜单(236)右侧
  let scroller = null;
  const visit = (n) => {
    if (n.kind === 'scroll' && n.ax >= 200 && (!scroller || n.w * n.h > scroller.w * scroller.h)) scroller = n;
    for (const c of n.children) visit(c);
  };
  visit(host.root);
  console.log('[probe] phase=' + PHASE + ' scroller=' + (scroller ? Math.round(scroller.w) + 'x' + Math.round(scroller.h) + ' @' + Math.round(scroller.ax) + ',' + Math.round(scroller.ay) : 'NONE') + ' N=' + N);
  const cx = scroller ? Math.round(scroller.ax + scroller.w / 2) : Math.round(W / 2);
  const cy = scroller ? Math.round(scroller.ay + scroller.h / 2) : Math.round(H / 2);

  // 来回弹跳：每 SEG 步换向，持续跨章节（不依赖内部字段，到底 clamp 也很快反向）
  const SEG = 40;
  console.log('[probe] 起滚（以下 [framestats] 每满 30 帧自动 dump，单位 ms）：');
  for (let i = 0; i < N; i++) {
    const down = Math.floor(i / SEG) % 2 === 0;
    host.onWheel({ x: cx, y: cy, dx: 0, dy: down ? -40 : 40, mode: 'pixel' });
    host.renderFrame();
    if (i % AWAIT_EVERY === AWAIT_EVERY - 1) await sleep(AWAIT_MS); // cross 期让 React 把 setSy commit 上膛 → 锚点 activeHref 变色
  }
  console.log('[probe] done blit=' + host.__blitFrames + ' full=' + host.__fullFrames + ' coexist=' + host.__coexistHits + ' layoutRuns=' + host.__layoutRuns + '/' + host.__frameCount);
  process.exit(0);
})().catch((e) => { console.log('[probe] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
