// 画质无损校验抓帧（Welcome 版）：直接挂 SysWelcomeDemo，稳定后抓当前窗口为 PNG。
// 用法： FLUX_GRAB_DIR=<目录> node tools/ops-welcome-grab.js
// 同进程内成对抓帧：先缓存开、再翻 FLUX_NOCACHE 抓关——Welcome 全静态，两次唯一差异即位图缓存本身。
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-welcome-grab';
process.env.FLUX_IDLE_SKIP = '0';
process.env.FLUX_GRAB_DIR = process.env.FLUX_GRAB_DIR || './grab-cmp-welcome';

const lib = require('react-native-flux-desktop');
const React = require('react');
const { SysWelcomeDemo } = require('../dist/demos/sys-welcome.js');

(async () => {
  await lib.render(React.createElement(SysWelcomeDemo), { width: 1280, height: 720, title: 'ops-welcome-grab' });
  await new Promise((r) => setTimeout(r, Number(process.env.FLUX_GRAB_DELAY) || 1000));
  const dir = process.env.FLUX_GRAB_DIR;
  const name = process.env.FLUX_GRAB_NAME || 'welcome';
  process.env.FLUX_NOCACHE = '';
  process.env.FLUX_GRAB_NAME = name + '-on';
  lib.grabAll(dir);
  process.env.FLUX_NOCACHE = '1';
  process.env.FLUX_GRAB_NAME = name + '-off';
  lib.grabAll(dir);
  process.env.FLUX_NOCACHE = '';
  console.log('[ops-welcome-grab] wrote ' + dir + '/' + name + '-{on,off}.png');
  process.exit(0);
})().catch((e) => { console.log('[ops-welcome-grab] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
