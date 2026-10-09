// 画质无损校验抓帧：直接挂 HeavyChartsDemo，稳定后（首个 tick 前）抓当前窗口为 PNG。
// 用法： FLUX_GRAB_DIR=<目录> FLUX_GRAB_NAME=<名称> [FLUX_NOCACHE=1] node tools/ops-grab.js
// 说明：useEnter 在 FLUX_GRAB_DIR 下恒返回 1（静态成品帧，无入场动画）；延迟取 <2500ms 保证 tick=0，
// 使「缓存开/关」两次抓帧的动态区内容完全一致，唯一差异即位图缓存本身。
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-grab';
process.env.FLUX_IDLE_SKIP = '0';
process.env.FLUX_GRAB_DIR = process.env.FLUX_GRAB_DIR || './grab-cmp';

const lib = require('react-native-flux-desktop');
const React = require('react');
const { HeavyChartsDemo } = require('../dist/cases/heavy-charts.js');

(async () => {
  await lib.render(React.createElement(HeavyChartsDemo), { width: 1400, height: 900, title: 'ops-grab' });
  await new Promise((r) => setTimeout(r, Number(process.env.FLUX_GRAB_DELAY) || 900));
  // 同进程内成对抓帧：先缓存开、再翻 FLUX_NOCACHE 抓关——committed 时钟/动态文本同一，唯一差异即缓存本身。
  const dir = process.env.FLUX_GRAB_DIR;
  process.env.FLUX_NOCACHE = '';
  process.env.FLUX_GRAB_NAME = (process.env.FLUX_GRAB_NAME || 'pair') + '-on';
  lib.grabAll(dir);
  process.env.FLUX_NOCACHE = '1';
  process.env.FLUX_GRAB_NAME = (process.env.FLUX_GRAB_NAME || 'pair').replace(/-on$/, '') + '-off';
  lib.grabAll(dir);
  process.env.FLUX_NOCACHE = '';
  console.log('[ops-grab] wrote pair ' + dir + '/' + (process.env.FLUX_GRAB_NAME || 'pair') + '-{on,off}.png');
  process.exit(0);
})().catch((e) => { console.log('[ops-grab] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
