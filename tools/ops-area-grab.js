// 独立抓 Area 图：以固定数据挂一个 AreaChart（smooth+gradient，animation=false）放大到窗口，验证 Phase 2 迁移后的观感。
// 用法： FLUX_GRAB_DIR=<目录> FLUX_GRAB_NAME=<名称> node tools/ops-area-grab.js
process.env.FLUX_PACKAGED = '1';
process.env.FLUX_APP_DIR = process.env.FLUX_APP_DIR || 'ops-area-grab';
process.env.FLUX_IDLE_SKIP = '0';
process.env.FLUX_GRAB_DIR = process.env.FLUX_GRAB_DIR || './grab-area';

const lib = require('react-native-flux-desktop');
const React = require('react');
const { AreaChart } = lib;

// 固定、确定性的两段序列（无 Math.random），保证 old/new 抓帧除渲染法外完全一致
function mk() {
  const rows = [];
  for (let i = 0; i < 24; i++) {
    const x = 'T' + i;
    rows.push({ x, value: 40 + Math.round(30 * Math.sin(i / 3) + i), type: '成交额' });
    rows.push({ x, value: 25 + Math.round(18 * Math.cos(i / 2.5)), type: '订单' });
  }
  return rows;
}

(async () => {
  await lib.render(
    React.createElement(AreaChart, {
      data: mk(), xField: 'x', yField: 'value', seriesField: 'type',
      smooth: true, gradient: true, animation: false, height: 360, legend: true, color: ['#5B8FF9', '#5AD8A6'],
    }),
    { width: 900, height: 520, title: 'ops-area-grab' },
  );
  await new Promise((r) => setTimeout(r, Number(process.env.FLUX_GRAB_DELAY) || 700));
  lib.grabAll(process.env.FLUX_GRAB_DIR);
  console.log('[ops-area-grab] wrote ' + process.env.FLUX_GRAB_DIR + '/' + (process.env.FLUX_GRAB_NAME || 'area') + '.png');
  process.exit(0);
})().catch((e) => { console.log('[ops-area-grab] ERR ' + (e && e.stack ? e.stack : e.message)); process.exit(1); });
