// 开发期热更新 runner（dev-only，不在 src/、不随包发布）。
// 职责：持有稳定外壳（Window/FluxProvider/App + 全局浮层）+ 动态装载可重载内容 dist/Shell.js，
//   fs.watch dist → 清 app 模块缓存 → 重取 Shell → 调库的通用重渲染原语 hotReload 复用主窗根。
//   效果：改 src/** 经 tsc -w 落到 dist 后，本进程内只 remount 内容子树，窗口不关、不闪、进程不重启。
// 关键：外壳元素（Window/FluxProvider/App/浮层）全部来自 node_modules 里的库（flush 缓存时跳过 node_modules），
//   类型恒定 → fiber 不 remount → WindowHost 存活；只有 dist/Shell（app 内容）换类型 → 其子树 remount。
// app 的 src/App.tsx 保持纯净（生产/抓帧入口），本 runner 是并行的 dev 入口，二者外壳等价。
// 用法：由 scripts/dev.js 拉起（tsc -w + 本文件）。也可手动：先 npm run build，再 node scripts/dev-runner.js
'use strict';
// dev 构建：要 React warning，故不切 production（不设 FLUX_PACKAGED）。
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const React = require('react');
const fs = require('fs');
const path = require('path');
const flux = require('react-native-flux-desktop');
const {
  render,
  grabAll,
  hotReload,
  Window,
  View,
  Text,
  ScrollView,
  FluxProvider,
  ContextMenuLayer,
  TextSelectionLayer,
  DragLayer,
  App: FeedbackApp,
  Application,
  acquireSingleInstance,
  configureLogger,
} = flux;
const { seedThemeFromEnv, useAppTheme } = require('../dist/components/ThemeSettings');

// ---- app 配置（根目录 app.json）+ 与原入口一致的 env 副作用 ----
function readAppJson() {
  const fallback = { name: 'App', description: '', version: '0.0.0', icon: 'assets/icon.png' };
  try {
    return Object.assign(fallback, JSON.parse(fs.readFileSync(path.join(process.cwd(), 'app.json'), 'utf8')));
  } catch {
    return fallback;
  }
}
const APP = readAppJson();
if (APP.icon) process.env.FLUX_ICON = path.isAbsolute(APP.icon) ? APP.icon : path.join(process.cwd(), APP.icon);
process.env.FLUX_APP_ID = `FluxDesktop.${String(APP.name).replace(/[^0-9A-Za-z]+/g, '')}`;
if (typeof APP.maxDpr === 'number' && APP.maxDpr > 0) process.env.FLUX_MAX_DPR = String(APP.maxDpr);
// 字体：app.json fonts 列表 + 全局默认族注入 env，供库 registerFonts() 首帧前消费（与 App.tsx 生产入口同构）。
// 全局默认优先级：持久化偏好 App.prefs.font（用户手选）> app.json defaultFont > 内置。
if (Array.isArray(APP.fonts) && APP.fonts.length) process.env.FLUX_FONTS = JSON.stringify(APP.fonts);
let __prefFont = '';
try { __prefFont = (Application.config.getPrefs().font) || ''; } catch { __prefFont = ''; }
process.env.FLUX_DEFAULT_FAMILY = __prefFont || APP.defaultFont || '';

// ---- 父进程看门狗：dev.js 被终端关闭杀掉时，本进程会变孤儿却继续跑（关终端 app 不退）。
//      Windows 关终端不给子进程发信号，故轮询 ppid：父 dev.js 不在 → ppid 改变/回落 → 自退。
//      自退后 tsc -w 失去 stdio 连接随之退出、窗口随本进程销毁 → 一次收摊干净。
//      例外：Application.relaunch 重拉的子进程（FLUX_RELAUNCH=1）无 dev.js 父，跳过看门狗，否则新实例会被自己掉死。
if (!process.env.FLUX_RELAUNCH) {
  const __ppid0 = process.ppid;
  setInterval(() => {
    if (process.ppid === __ppid0) return;
    let alive = false;
    try { process.kill(__ppid0, 0); alive = true; } catch { alive = false; }
    if (!alive) { console.log('[dev-hmr] 检测到父进程(dev.js)已退出 → 关闭应用并退出'); process.exit(0); }
  }, 1500).unref();
}

// ---- 可重载内容 + 错误态（模块级可变绑定，Root 渲染时读取最新值） ----
let Shell = null;
let hmrError = null;

/** 热重载失败时的错误浮层（dev-only）：叠在窗口底部，保留上一版界面，绝不重建窗口。 */
function ErrorOverlay(props) {
  const e = props.error;
  const msg = e ? (e.stack || String(e)) : '';
  return React.createElement(
    View,
    { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 220, backgroundColor: '#7f1d1d', padding: 16 } },
    React.createElement(Text, { style: { color: '#ffffff', fontSize: 14, fontWeight: '700' } }, '⚠ dev 热重载失败（已保留上一版界面）'),
    React.createElement(ScrollView, { style: { flex: 1, marginTop: 8 } }, React.createElement(Text, { style: { color: '#fecaca', fontSize: 12 } }, msg))
  );
}

/** 稳定外壳：主题 + Window/FluxProvider/App + 内容(Shell) + 浮层。类型恒定，不随热重载 remount。 */
function Root() {
  const { dark, compact, primary, animation, fontSize, controlHeight } = useAppTheme();
  const algorithm = [dark ? 'dark' : 'default'];
  if (compact) algorithm.push('compact');
  const token = { colorPrimary: primary, colorLink: primary, colorInfo: primary };
  if (fontSize != null) token.fontSize = fontSize;
  if (controlHeight != null) token.controlHeight = controlHeight;
  return React.createElement(
    Window,
    { title: APP.name, width: 1280, height: Number(process.env.FLUX_WIN_H) || 640, minWidth: 1280, minHeight: 640, maxHeight: Number(process.env.FLUX_WIN_H) || 640,
      // 关主窗 = 退出整个 dev 进程：否则 fs.watch 会吊着 node 事件循环，窗口关了终端却不退。
      onClose: () => { try { if (distWatcher) distWatcher.close(); } catch { /* ignore */ } process.exit(0); } },
    React.createElement(
      FluxProvider,
      { theme: { algorithm, token }, animation },
      React.createElement(
        FeedbackApp,
        null,
        React.createElement(Shell, {
          dark,
          compact,
          setDark: (v) => Application.config.setTheme({ dark: v }),
          setCompact: (v) => Application.config.setTheme({ compact: v }),
          animation,
          setAnimation: (v) => Application.config.setTheme({ animation: v }),
          primary,
          setPrimary: (v) => Application.config.setTheme({ primary: v }),
          appName: APP.name,
        })
      ),
      hmrError ? React.createElement(ErrorOverlay, { error: hmrError }) : null,
      React.createElement(ContextMenuLayer, null),
      React.createElement(TextSelectionLayer, null),
      React.createElement(DragLayer, null)
    )
  );
}

// ---- 热更新：清 dist 下 app 模块缓存（跳过 node_modules）→ 重取 Shell → hotReload 复用主窗根 ----
function flushAppCache() {
  const distDir = path.resolve(__dirname, '..', 'dist');
  for (const k of Object.keys(require.cache)) {
    const f = path.resolve(k);
    if (f.indexOf('node_modules') >= 0) continue;
    if (f.startsWith(distDir + path.sep)) delete require.cache[k];
  }
}

function reload() {
  flushAppCache();
  try {
    Shell = require('../dist/Shell').Shell;
    hmrError = null;
    hotReload(React.createElement(Root));
    console.log('[dev-hmr] reloaded @ ' + new Date().toLocaleTimeString());
  } catch (e) {
    hmrError = e; // 保留旧 Shell（未替换），仅叠加错误浮层，窗口与上一版界面不受损
    hotReload(React.createElement(Root));
    console.error('[dev-hmr] reload failed: ' + ((e && e.stack) || e));
  }
}

let distWatcher = null; // 供主窗 onClose 关闭，释放 fs.watch 对事件循环的占用
function startWatch() {
  const distDir = path.join(__dirname, '..', 'dist');
  let timer = null;
  console.log('[dev-hmr] watching ' + distDir + '（改 src → tsc -w → dist → 进程内 remount 内容，窗口不关）');
  try {
    distWatcher = fs.watch(distDir, { recursive: true }, (_ev, file) => {
      const f = String(file || '');
      if (!f.endsWith('.js')) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(reload, 150); // 防抖：一次保存常触发多次写事件
    });
  } catch (e) {
    console.error('[dev-hmr] watch failed: ' + e);
  }
}

// ---- 启动 ----
configureLogger({ path: APP.logger && APP.logger.path, level: APP.logger && APP.logger.level });
seedThemeFromEnv();

if (
  acquireSingleInstance({
    name: `flux-${String(APP.name).replace(/[^0-9A-Za-z]+/g, '')}`,
    allowMulti: APP.allowMultiOpen === true,
    onSecondInstance: () => Application.wakeMainWindow(),
  })
) {
  Application.log.write('gallery', 'dev-runner 启动（热更新）', { name: APP.name, version: APP.version });
  Shell = require('../dist/Shell').Shell; // 首次装载内容（失败则直接崩，属启动期错误）
  render(React.createElement(Root))
    .then(() => {
      const dir = process.env.FLUX_GRAB_DIR;
      if (dir) {
        const delay = Number(process.env.FLUX_GRAB_DELAY) || 700;
        setTimeout(() => {
          grabAll(dir);
          process.exit(0);
        }, delay);
        return; // 抓帧模式不启监视
      }
      startWatch();
    })
    .catch((e) => {
      console.error('[dev-hmr] 启动失败：', e);
    });
} else {
  console.log('[dev-hmr] 已有实例在运行：已请求唤醒老窗口，本进程即将退出（单实例锁）');
}
