// 图表 demo 集：Line / Area / Column / Bar / Pie / Radar / Gauge，统一 DemoPage 三段式。
// 每图首个示例带「重播入场动画」按钮（换 key 重挂载触发 useEnter）——实机可见动画，静态帧为落位成品。
import React from 'react';
import { View, Text, Button, Space, ChartExportButton } from 'react-native-flux-desktop';
import {
  LineChart, AreaChart, ColumnChart, BarChart, PieChart, RadarChart, GaugeChart,
  ScatterChart, RoseChart, FunnelChart, WaterfallChart, HeatmapChart, ComboChart, SparklineChart, TreemapChart, SunburstChart, SankeyChart, BoxPlotChart, HistogramChart, ViolinChart, RangeBarChart, RadialBarChart, BulletChart, CalendarHeatmapChart,
  type SunburstNode,
} from 'react-native-flux-desktop-chart';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 重播容器：换 key 重挂载子图，触发一次入场动画。 */
function Replay(props: { children: (seed: number) => React.ReactElement }): React.ReactElement {
  const [seed, setSeed] = React.useState(0);
  return (
    <View style={{ gap: 10 }}>
      <View key={seed}>{props.children(seed)}</View>
      <Button size="small" style={{ alignSelf: 'flex-start' }} onClick={() => setSeed((s) => s + 1)}>
        重播入场动画
      </Button>
    </View>
  );
}

// ---- mock 数据（模块级常量，避免每次渲染重排导致抖动）----
const TREND: Record<string, any>[] = [
  { month: '1月', value: 320, type: '访问量' },
  { month: '2月', value: 410, type: '访问量' },
  { month: '3月', value: 380, type: '访问量' },
  { month: '4月', value: 520, type: '访问量' },
  { month: '5月', value: 610, type: '访问量' },
  { month: '6月', value: 560, type: '访问量' },
  { month: '7月', value: 720, type: '访问量' },
  { month: '8月', value: 830, type: '访问量' },
  { month: '1月', value: 180, type: '下单量' },
  { month: '2月', value: 230, type: '下单量' },
  { month: '3月', value: 250, type: '下单量' },
  { month: '4月', value: 310, type: '下单量' },
  { month: '5月', value: 360, type: '下单量' },
  { month: '6月', value: 340, type: '下单量' },
  { month: '7月', value: 430, type: '下单量' },
  { month: '8月', value: 470, type: '下单量' },
];
const TREND_SINGLE: Record<string, any>[] = TREND.filter((r) => r.type === '访问量');

const CHANNEL: Record<string, any>[] = [
  { month: '1月', value: 120, type: '直营' },
  { month: '2月', value: 132, type: '直营' },
  { month: '3月', value: 101, type: '直营' },
  { month: '4月', value: 134, type: '直营' },
  { month: '5月', value: 90, type: '直营' },
  { month: '1月', value: 220, type: '分销' },
  { month: '2月', value: 182, type: '分销' },
  { month: '3月', value: 191, type: '分销' },
  { month: '4月', value: 234, type: '分销' },
  { month: '5月', value: 290, type: '分销' },
  { month: '1月', value: 150, type: '线上' },
  { month: '2月', value: 212, type: '线上' },
  { month: '3月', value: 201, type: '线上' },
  { month: '4月', value: 154, type: '线上' },
  { month: '5月', value: 190, type: '线上' },
];

const SALES: Record<string, any>[] = [
  { quarter: 'Q1', value: 289, region: '华东' },
  { quarter: 'Q2', value: 332, region: '华东' },
  { quarter: 'Q3', value: 394, region: '华东' },
  { quarter: 'Q4', value: 312, region: '华东' },
  { quarter: 'Q1', value: 195, region: '华南' },
  { quarter: 'Q2', value: 246, region: '华南' },
  { quarter: 'Q3', value: 298, region: '华南' },
  { quarter: 'Q4', value: 255, region: '华南' },
  { quarter: 'Q1', value: 142, region: '华北' },
  { quarter: 'Q2', value: 178, region: '华北' },
  { quarter: 'Q3', value: 205, region: '华北' },
  { quarter: 'Q4', value: 188, region: '华北' },
];

const RANK: Record<string, any>[] = [
  { name: '蓝牙耳机', value: 9820 },
  { name: '机械键盘', value: 8210 },
  { name: '无线鼠标', value: 6740 },
  { name: '显示器', value: 5320 },
  { name: '摄像头', value: 3910 },
  { name: '移动电源', value: 2480 },
];

const SOURCE: Record<string, any>[] = [
  { type: '搜索引擎', value: 1048 },
  { type: '直接访问', value: 735 },
  { type: '社交媒体', value: 580 },
  { type: '邮件营销', value: 484 },
  { type: '联盟广告', value: 300 },
];

const ABILITY: Record<string, any>[] = [
  { axis: '攻击', value: 92, series: '英雄 A' },
  { axis: '防御', value: 70, series: '英雄 A' },
  { axis: '速度', value: 85, series: '英雄 A' },
  { axis: '耐力', value: 60, series: '英雄 A' },
  { axis: '智力', value: 78, series: '英雄 A' },
  { axis: '运气', value: 66, series: '英雄 A' },
  { axis: '攻击', value: 68, series: '英雄 B' },
  { axis: '防御', value: 90, series: '英雄 B' },
  { axis: '速度', value: 62, series: '英雄 B' },
  { axis: '耐力', value: 88, series: '英雄 B' },
  { axis: '智力', value: 74, series: '英雄 B' },
  { axis: '运气', value: 82, series: '英雄 B' },
];

const SCATTER: Record<string, any>[] = [
  { x: 20, y: 420, size: 30, type: 'A 组' }, { x: 34, y: 380, size: 80, type: 'A 组' }, { x: 28, y: 510, size: 45, type: 'A 组' },
  { x: 45, y: 620, size: 120, type: 'A 组' }, { x: 52, y: 580, size: 60, type: 'A 组' }, { x: 38, y: 470, size: 95, type: 'A 组' },
  { x: 60, y: 300, size: 50, type: 'B 组' }, { x: 72, y: 360, size: 140, type: 'B 组' }, { x: 66, y: 250, size: 35, type: 'B 组' },
  { x: 80, y: 420, size: 110, type: 'B 组' }, { x: 88, y: 340, size: 70, type: 'B 组' }, { x: 75, y: 280, size: 25, type: 'B 组' },
  { x: 30, y: 700, size: 90, type: 'C 组' }, { x: 42, y: 760, size: 160, type: 'C 组' }, { x: 55, y: 820, size: 55, type: 'C 组' },
  { x: 48, y: 690, size: 100, type: 'C 组' }, { x: 62, y: 740, size: 40, type: 'C 组' }, { x: 36, y: 650, size: 130, type: 'C 组' },
];

const FUNNEL: Record<string, any>[] = [
  { stage: '广告曝光', value: 12000 },
  { stage: '点击进入', value: 7800 },
  { stage: '到达落地', value: 4600 },
  { stage: '加入购物车', value: 2100 },
  { stage: '提交订单', value: 1250 },
  { stage: '支付成功', value: 980 },
];

const WATERFALL: Record<string, any>[] = [
  { label: '上月结存', value: 3200, total: true },
  { label: '销售收入', value: 1800 },
  { label: '服务收入', value: 950 },
  { label: '采购成本', value: -1200 },
  { label: '人力支出', value: -860 },
  { label: '营销费用', value: -540 },
  { label: '本月结存', value: 3350, total: true },
];

const COMBO: Record<string, any>[] = [
  { month: '1月', sales: 320, rate: 12 },
  { month: '2月', sales: 410, rate: 18 },
  { month: '3月', sales: 380, rate: 15 },
  { month: '4月', sales: 520, rate: 24 },
  { month: '5月', sales: 610, rate: 21 },
  { month: '6月', sales: 560, rate: 28 },
  { month: '7月', sales: 720, rate: 33 },
];

const HEATMAP: Record<string, any>[] = (() => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const slots = ['上午', '午后', '傍晚', '夜间'];
  const seed = [2, 4, 6, 3, 5, 9, 7, 3, 5, 7, 4, 6, 10, 8, 5, 7, 9, 6, 8, 12, 10, 7, 9, 11, 8, 10, 14, 12, 9, 11, 13, 10, 12, 15, 13, 11];
  const rows: Record<string, any>[] = [];
  let k = 0;
  for (const s of slots) for (const d of days) rows.push({ x: d, y: s, value: seed[k++] });
  return rows;
})();

const SPARK_UP: Record<string, any>[] = [
  { value: 12 }, { value: 18 }, { value: 15 }, { value: 24 }, { value: 22 },
  { value: 31 }, { value: 28 }, { value: 38 }, { value: 42 }, { value: 40 }, { value: 52 },
];
const SPARK_DOWN: Record<string, any>[] = [
  { value: 48 }, { value: 44 }, { value: 46 }, { value: 38 }, { value: 40 },
  { value: 32 }, { value: 30 }, { value: 26 }, { value: 22 }, { value: 24 }, { value: 16 },
];

// ---- 各图 demo ----
function LineDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '基础折线', desc: '单序列：沿弧长自左向右描线，顶点随到达浮现（点按钮重播）', node: <Replay>{() => <LineChart data={TREND_SINGLE} xField="month" yField="value" height={260} />}</Replay>, code: 'import { LineChart } from "react-native-flux-desktop";\n\n// 单序列：沿弧长自左向右描线\n<LineChart data={TREND_SINGLE} xField="month" yField="value" height={260} />' },
    { name: '多序列 + 图例', desc: 'seriesField 拆多线，弧长揭示各线并行绘制；点图例可切换序列显隐', node: <Replay>{() => <LineChart data={TREND} xField="month" yField="value" seriesField="type" height={280} />}</Replay>, code: '// seriesField 拆多序列，自动上图例\n<LineChart data={TREND} xField="month" yField="value" seriesField="type" height={280} />' },
    { name: '平滑曲线', desc: 'smooth 用 Catmull-Rom 过点曲线代替直折线（顶点仍在原数据位）', node: <Replay>{() => <LineChart data={TREND} xField="month" yField="value" seriesField="type" smooth height={280} />}</Replay>, code: '// smooth：Catmull-Rom 过点曲线\n<LineChart data={TREND} xField="month" yField="value" seriesField="type" smooth height={280} />' },
    { name: '平滑 + 无顶点', desc: 'smooth 且 point={false}：纯曲线，适合密集时间序列', node: <Replay>{() => <LineChart data={TREND_SINGLE} xField="month" yField="value" smooth point={false} height={240} />}</Replay>, code: '// smooth + point={false}：纯曲线（密集时序）\n<LineChart data={TREND_SINGLE} xField="month" yField="value" smooth point={false} height={240} />' },
    { name: '参考线 / 阈值线', desc: 'referenceLine 画横向虚线 + 右端标签，值自动并入 y 轴域', node: <Replay>{() => <LineChart data={TREND_SINGLE} xField="month" yField="value" smooth height={260} referenceLine={[{ value: 700, label: '目标 700' }, { value: 400, label: '预警线', color: '#F6BD16' }]} />}</Replay>, code: '// referenceLine：横向阈值虚线 + 右端标签\n<LineChart\n  data={TREND_SINGLE}\n  xField="month"\n  yField="value"\n  smooth\n  height={260}\n  referenceLine={[{ value: 700, label: \'目标 700\' }, { value: 400, label: \'预警线\', color: \'#F6BD16\' }]}\n/>' },
    { name: '线型（虚线 / 粗细）', desc: 'dash 虚线序列（预测/基准常用）+ lineWidth 加粗', node: <Replay>{() => <LineChart data={TREND_SINGLE} xField="month" yField="value" dash={[6, 4]} lineWidth={2.5} smooth height={240} />}</Replay>, code: '// dash 虚线序列（[实段, 空白]）+ lineWidth 加粗\n<LineChart data={TREND_SINGLE} xField="month" yField="value" dash={[6, 4]} lineWidth={2.5} smooth height={240} />' },
    { name: '阶梯线型', desc: 'step 三态：start 先平后升 / middle 中点转折 / end 先升后平（电价/费率常用，设置后 smooth 失效）', node: <Replay>{() => <Space size="large" wrap><LineChart data={TREND_SINGLE} xField="month" yField="value" step="start" height={200} width={280} /><LineChart data={TREND_SINGLE} xField="month" yField="value" step="middle" height={200} width={280} /></Space>}</Replay>, code: '// step 阶梯线型：start / middle / end（与 smooth 互斥）\n<LineChart data={TREND_SINGLE} xField="month" yField="value" step="start" height={200} width={280} />\n<LineChart data={TREND_SINGLE} xField="month" yField="value" step="middle" height={200} width={280} />' },
    { name: '数据标签', desc: 'label 在每个顶点上方显数值，随描线节奏逐点浮现', node: <Replay>{() => <LineChart data={TREND_SINGLE} xField="month" yField="value" label height={260} />}</Replay>, code: '// label：顶点上方数据标签，随揭示逐点浮现\n<LineChart data={TREND_SINGLE} xField="month" yField="value" label height={260} />' },
    { name: '关闭动画', desc: 'animation={false} 直接落位', node: <LineChart data={TREND} xField="month" yField="value" seriesField="type" height={260} point={false} animation={false} />, code: '// animation={false} 跳过入场直接落位\n<LineChart data={TREND} xField="month" yField="value" seriesField="type" height={260} point={false} animation={false} />' },
  ];
  const api: ApiRow[] = [
    { name: 'data', desc: '扁平行表', type: 'object[]', default: '–' },
    { name: 'xField / yField', desc: '类目维 / 数值维', type: 'string', default: '–' },
    { name: 'seriesField', desc: '多序列拆分字段', type: 'string', default: '–' },
    { name: 'point', desc: '顶点圆点', type: 'boolean', default: 'true' },
    { name: 'lineWidth / dash', desc: '线宽 / 虚线模式 [实段, 空白]', type: 'number / [number, number]', default: '2 / –' },
    { name: 'smooth', desc: 'Catmull-Rom 平滑曲线（每段 12 次采样）', type: 'boolean', default: 'false' },
    { name: 'step', desc: '阶梯线型 start / middle / end（与 smooth 互斥）', type: "'start'|'middle'|'end'", default: '–' },
    { name: 'label', desc: '顶点上方数据标签（随揭示逐点浮现）', type: 'boolean', default: 'false' },
    { name: 'tooltip', desc: '悬浮提示 + 十字准星 + 点位强调环', type: 'boolean', default: 'true' },
    { name: 'grid', desc: '网格自定义（color/dash/width/vertical）', type: 'GridConfig', default: '–' },
    { name: 'referenceLine', desc: '横向参考线（value + label + color）', type: 'RefLine[]', default: '–' },
    { name: 'yAxisFormatter / xAxisFormatter', desc: '轴刻度文本格式化', type: 'function', default: 'compactNumber / –' },
    { name: 'animation / animateDuration', desc: '入场开关 / 时长', type: 'boolean / number', default: 'true / 900' },
    { name: 'color', desc: '色板覆盖（串或数组）', type: 'string | string[]', default: '内置' },
  ];
  const tokens: TokenRow[] = [
    { name: 'colorSplit', desc: '网格线', default: '分割色' },
    { name: 'colorBorderSecondary', desc: '基线', default: '次边框' },
    { name: 'palette', desc: '分类色板（AntV G2）', default: '10 色' },
  ];
  return <DemoPage demos={demos} api={api} tokens={tokens} />;
}

function AreaDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '面积图', desc: '折线下方半透明填充，薄片沿 x 左→右生长', node: <Replay>{() => <AreaChart data={TREND_SINGLE} xField="month" yField="value" height={260} />}</Replay>, code: 'import { AreaChart } from "react-native-flux-desktop";\n\n// 折线下方半透明填充，薄片沿 x 生长\n<AreaChart data={TREND_SINGLE} xField="month" yField="value" height={260} />' },
    { name: '堆叠面积', desc: 'stack 逐序列堆叠基线', node: <Replay>{() => <AreaChart data={CHANNEL} xField="month" yField="value" seriesField="type" stack height={300} />}</Replay>, code: '// stack：逐序列堆叠基线\n<AreaChart data={CHANNEL} xField="month" yField="value" seriesField="type" stack height={300} />' },
    { name: '平滑面积', desc: 'smooth 上/下边界转曲线，填充薄片跟随曲线', node: <Replay>{() => <AreaChart data={TREND_SINGLE} xField="month" yField="value" smooth height={260} />}</Replay>, code: '// smooth：上下边界转曲线\n<AreaChart data={TREND_SINGLE} xField="month" yField="value" smooth height={260} />' },
    { name: '平滑堆叠', desc: 'stack + smooth 多序列曲线堆叠', node: <Replay>{() => <AreaChart data={CHANNEL} xField="month" yField="value" seriesField="type" stack smooth height={300} />}</Replay>, code: '// stack + smooth：多序列曲线堆叠\n<AreaChart data={CHANNEL} xField="month" yField="value" seriesField="type" stack smooth height={300} />' },
    { name: '渐变填充', desc: 'gradient 面积自顶向基线渐隐（ECharts/antd 观感），可叠 smooth', node: <Replay>{() => <AreaChart data={TREND_SINGLE} xField="month" yField="value" gradient smooth height={260} />}</Replay>, code: '// gradient：面积自顶向基线渐隐\n<AreaChart data={TREND_SINGLE} xField="month" yField="value" gradient smooth height={260} />' },
    { name: '数据点标记', desc: 'point 在上边界标圆点（与折线图对齐），随揭示前沿逐个浮现', node: <Replay>{() => <AreaChart data={CHANNEL} xField="month" yField="value" seriesField="type" point height={300} />}</Replay>, code: '// point：上边界标圆点\n<AreaChart data={CHANNEL} xField="month" yField="value" seriesField="type" point height={300} />' },
    { name: '数据标签', desc: 'label 在上边界点上方显原值（堆叠时不显累加值），随前沿逐点浮现', node: <Replay>{() => <AreaChart data={TREND_SINGLE} xField="month" yField="value" gradient label height={260} />}</Replay>, code: '// label：上边界点上方显原值\n<AreaChart data={TREND_SINGLE} xField="month" yField="value" gradient label height={260} />' },
  ];
  const api: ApiRow[] = [
    { name: 'stack', desc: '堆叠', type: 'boolean', default: 'false' },
    { name: 'fillOpacity', desc: '填充 alpha（两位十六进制）', type: 'string', default: "'55'" },
    { name: 'gradient', desc: '面积自顶向基线渐变透明', type: 'boolean', default: 'false' },
    { name: 'smooth', desc: '边界曲线平滑（Catmull-Rom）', type: 'boolean', default: 'false' },
    { name: 'point', desc: '上边界数据点圆点标记', type: 'boolean', default: 'false' },
    { name: 'label', desc: '上边界数据标签', type: 'boolean', default: 'false' },
    { name: 'animateDuration', desc: '入场时长', type: 'number', default: '1000' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function ColumnDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '分组柱', desc: '每柱从基线长高，类目间错峰', node: <Replay>{() => <ColumnChart data={SALES} xField="quarter" yField="value" seriesField="region" height={300} />}</Replay>, code: 'import { ColumnChart } from "react-native-flux-desktop";\n\n// seriesField 分组：每柱从基线长高\n<ColumnChart data={SALES} xField="quarter" yField="value" seriesField="region" height={300} />' },
    { name: '堆叠柱', desc: 'stack 系列累加', node: <Replay>{() => <ColumnChart data={SALES} xField="quarter" yField="value" seriesField="region" stack height={300} />}</Replay>, code: '// stack：系列累加\n<ColumnChart data={SALES} xField="quarter" yField="value" seriesField="region" stack height={300} />' },
    { name: '参考线', desc: 'referenceLine 在柱上叠阈值虚线（值并入轴域）', node: <Replay>{() => <ColumnChart data={SALES.filter((r) => r.region === '华东')} xField="quarter" yField="value" height={280} referenceLine={[{ value: 360, label: '均值 360' }]} />}</Replay>, code: '// referenceLine：柱上叠阈值虚线\n<ColumnChart\n  data={SALES}\n  xField="quarter"\n  yField="value"\n  height={280}\n  referenceLine={[{ value: 360, label: \'均值 360\' }]}\n/>' },
    { name: '单序列 + 错峰', desc: 'stagger 控制类目错峰强度', node: <Replay>{() => <ColumnChart data={RANK} xField="name" yField="value" height={280} stagger={0.6} />}</Replay>, code: '// stagger：类目错峰强度\n<ColumnChart data={RANK} xField="name" yField="value" height={280} stagger={0.6} />' },
    { name: '数据标签', desc: 'label 在柱顶显示数值（堆叠时柱段内白字）', node: <Replay>{() => <ColumnChart data={SALES.filter((r) => r.region === '华东')} xField="quarter" yField="value" height={280} label />}</Replay>, code: '// label：柱顶显示数值\n<ColumnChart data={SALES} xField="quarter" yField="value" height={280} label />' },
    { name: '柱宽上限', desc: 'maxColumnWidth：类目少带宽大时柱不无限拉伸，在带内居中（只画 4 根粗柱的痛点解）', node: <Replay>{() => <ColumnChart data={SALES.filter((r) => r.region === '华东')} xField="quarter" yField="value" height={280} maxColumnWidth={36} />}</Replay>, code: '// maxColumnWidth：柱宽上限，带内居中\n<ColumnChart data={SALES} xField="quarter" yField="value" height={280} maxColumnWidth={36} />' },
  ];
  const api: ApiRow[] = [
    { name: 'stack', desc: '堆叠', type: 'boolean', default: 'false' },
    { name: 'radius', desc: '顶部圆角', type: 'number', default: '4' },
    { name: 'label', desc: '柱顶数据标签', type: 'boolean', default: 'false' },
    { name: 'maxColumnWidth', desc: '柱宽上限（带内居中）', type: 'number', default: '–' },
    { name: 'stagger', desc: '错峰占比', type: 'number', default: '0.45' },
    { name: 'referenceLine', desc: '横向参考线（value + label + color）', type: 'RefLine[]', default: '–' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function BarDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '横向条形', desc: '类目在 y、数值在 x；每条自左伸出、错峰', node: <Replay>{() => <BarChart data={RANK} xField="name" yField="value" />}</Replay>, code: 'import { BarChart } from "react-native-flux-desktop";\n\n// 横向条形：类目在 y、数值在 x\n<BarChart data={RANK} xField="name" yField="value" />' },
    { name: '堆叠条', desc: 'stack 多段累加', node: <Replay>{() => <BarChart data={SALES} xField="quarter" yField="value" seriesField="region" stack />}</Replay>, code: '// stack：多段累加\n<BarChart data={SALES} xField="quarter" yField="value" seriesField="region" stack />' },
    { name: '数据标签', desc: 'label 在条末端显示数值', node: <Replay>{() => <BarChart data={RANK} xField="name" yField="value" label />}</Replay>, code: '// label：条末端显示数值\n<BarChart data={RANK} xField="name" yField="value" label />' },
    { name: '条高上限', desc: 'maxBarWidth：行高大了条不无限增粗，在槽位内居中', node: <Replay>{() => <BarChart data={RANK} xField="name" yField="value" height={320} maxBarWidth={14} />}</Replay>, code: '// maxBarWidth：条高上限，槽内居中\n<BarChart data={RANK} xField="name" yField="value" height={320} maxBarWidth={14} />' },
  ];
  const api: ApiRow[] = [
    { name: 'xField / yField', desc: '类目维（纵）/ 数值维（横）', type: 'string', default: '–' },
    { name: 'stack', desc: '堆叠', type: 'boolean', default: 'false' },
    { name: 'valueFormatter', desc: 'x 轴数值格式化', type: '(v)=>string', default: '紧凑' },
    { name: 'label', desc: '条末端数据标签', type: 'boolean', default: 'false' },
    { name: 'maxBarWidth', desc: '条高上限（槽内居中）', type: 'number', default: '–' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function PieDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '饼图', desc: '扇区总扫角 0→360 推进；点图例可隐藏类目，占比重算补满整圆', node: <Replay>{() => <PieChart data={SOURCE} angleField="value" colorField="type" size={220} />}</Replay>, code: 'import { PieChart } from "react-native-flux-desktop";\n\n// angleField 数值 / colorField 类目；扇区总扫角 0→360\n<PieChart data={SOURCE} angleField="value" colorField="type" size={220} />' },
    { name: '环形 + 中心合计', desc: 'innerRadius>0，中心显示总计与标题', node: <Replay>{() => <PieChart data={SOURCE} angleField="value" colorField="type" size={220} innerRadius={0.62} centerTitle="总访问量" />}</Replay>, code: '// innerRadius>0 镂空为环，中心显总计 + 标题\n<PieChart data={SOURCE} angleField="value" colorField="type" size={220} innerRadius={0.62} centerTitle="总访问量" />' },
    { name: '间隙扇区', desc: 'padAngle 拉开扇块', node: <Replay>{() => <PieChart data={SOURCE} angleField="value" colorField="type" size={220} innerRadius={0.5} padAngle={2} />}</Replay>, code: '// padAngle：拉开扇块间隙\n<PieChart data={SOURCE} angleField="value" colorField="type" size={220} innerRadius={0.5} padAngle={2} />' },
    { name: '数据标签', desc: 'label 在扇区中角外侧显示百分比（占比 <4% 省略）', node: <Replay>{() => <PieChart data={SOURCE} angleField="value" colorField="type" size={220} innerRadius={0.58} centerTitle="总访问量" label />}</Replay>, code: '// label：扇区外侧显百分比\n<PieChart data={SOURCE} angleField="value" colorField="type" size={220} innerRadius={0.58} label />' },
    { name: '悬浮交互', desc: 'tooltip：命中扇区外扩提亮、邻区压暗，气泡显 值+占比（内接小矩形逐段命中，不越界误伤邻扇区）', node: <Replay>{() => <PieChart data={SOURCE} angleField="value" colorField="type" size={220} innerRadius={0.55} centerTitle="总访问量" />}</Replay>, code: '// tooltip（默认开）：命中扇区外扩提亮 + 邻区压暗\n<PieChart data={SOURCE} angleField="value" colorField="type" size={220} innerRadius={0.55} centerTitle="总访问量" />' },
  ];
  const api: ApiRow[] = [
    { name: 'angleField / colorField', desc: '数值 / 类目字段', type: 'string', default: "value / type" },
    { name: 'innerRadius', desc: '内径比例（>0 环形）', type: 'number', default: '0' },
    { name: 'padAngle', desc: '扇区间隙角', type: 'number', default: '0' },
    { name: 'centerTitle', desc: '环形中心副标题', type: 'string', default: '–' },
    { name: 'label', desc: '扇区外侧百分比数据标签', type: 'boolean', default: 'false' },
    { name: 'tooltip', desc: '悬浮扇区外扩 + 邻区压暗 + 值/占比气泡', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function RadarDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '雷达图', desc: '数据点自圆心绽开；多 series 叠加，顶点圆点；点图例可切换系列显隐；悬浮顶点高亮环 + 系列/维度/数值气泡', node: <Replay>{() => <RadarChart data={ABILITY} xField="axis" yField="value" seriesField="series" size={300} />}</Replay>, code: 'import { RadarChart } from "react-native-flux-desktop";\n\n// xField 轴名 / yField 数值 / seriesField 多系列叠加\n<RadarChart data={ABILITY} xField="axis" yField="value" seriesField="series" size={300} />' },
    { name: '纯线框', desc: 'fill={false} 只描边不填充', node: <Replay>{() => <RadarChart data={ABILITY} xField="axis" yField="value" seriesField="series" size={300} fill={false} />}</Replay>, code: '// fill={false}：只描边不填充\n<RadarChart data={ABILITY} xField="axis" yField="value" seriesField="series" size={300} fill={false} />' },
  ];
  const api: ApiRow[] = [
    { name: 'xField / yField', desc: '维度（轴名）/ 数值', type: 'string', default: '–' },
    { name: 'levels', desc: '网格环层数', type: 'number', default: '4' },
    { name: 'point', desc: '顶点圆点', type: 'boolean', default: 'true' },
    { name: 'fill', desc: '多边形面积填充', type: 'boolean', default: 'true' },
    { name: 'size', desc: '画布边长', type: 'number', default: '280' },
    { name: 'tooltip', desc: '悬浮顶点显高亮环 + 系列/维度/数值气泡（需 point，靠边自动翻边）', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function GaugeDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '仪表盘',
      desc: '值弧扫描入场；>=60 warning、>=85 error 自动着色；悬浮显数值/占比/上限气泡 + 端点标记，中心数值染色',
      node: (
        <Replay>
          {() => (
            <Space size="large" wrap>
              <GaugeChart value={42} size={160} title="完成率" />
              <GaugeChart value={68} size={160} title="负载" />
              <GaugeChart value={91} size={160} title="告警" />
            </Space>
          )}
        </Replay>
      ),
      code: 'import { GaugeChart } from "react-native-flux-desktop";\n\n// value 值弧；>=60 warning、>=85 error 自动着色\n<GaugeChart value={42} size={160} title="完成率" />\n<GaugeChart value={68} size={160} title="负载" />\n<GaugeChart value={91} size={160} title="告警" />',
    },
    { name: '自定义量程与格式', desc: 'max + formatter 接管中心文本', node: <Replay>{() => <GaugeChart value={7320} max={10000} size={180} color="#5AD8A6" formatter={(v) => Math.round(v).toString()} title="积分" />}</Replay>, code: '// max + formatter 接管中心文本\n<GaugeChart\n  value={7320}\n  max={10000}\n  size={180}\n  color="#5AD8A6"\n  formatter={(v) => Math.round(v).toString()}\n  title="积分"\n/>' },
  ];
  const api: ApiRow[] = [
    { name: 'value / max', desc: '当前值 / 上界', type: 'number', default: '0 / 100' },
    { name: 'strokeWidth', desc: '弧宽', type: 'number', default: 'size*0.1' },
    { name: 'color', desc: '值弧色（缺省按阈值）', type: 'string', default: '语义' },
    { name: 'formatter', desc: '中心文本格式化', type: '(v)=>string', default: '百分比' },
    { name: 'tooltip', desc: '悬浮显数值/占比/上限气泡 + 值弧端点标记点', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function ScatterDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '分组散点', desc: 'x/y 均为连续数值，seriesField 分组着色；点错峰淡入放大，点图例切分组显隐（轴域随可见点重算）', node: <Replay>{() => <ScatterChart data={SCATTER} xField="x" yField="y" seriesField="type" height={300} />}</Replay>, code: 'import { ScatterChart } from "react-native-flux-desktop";\n\n// x/y 均连续数值，seriesField 分组着色\n<ScatterChart data={SCATTER} xField="x" yField="y" seriesField="type" height={300} />' },
    { name: '单组 + 大点', desc: '不传 seriesField 即单色，size 调点半径', node: <Replay>{() => <ScatterChart data={SCATTER.filter((r) => r.type === 'A 组')} xField="x" yField="y" size={8} color="#5B8FF9" height={280} />}</Replay>, code: '// 不传 seriesField 即单色，size 调点半径\n<ScatterChart data={SCATTER} xField="x" yField="y" size={8} color="#5B8FF9" height={280} />' },
    { name: '气泡图', desc: 'sizeField 第三维→半径（√ 面积比例），sizeRange 控大小气泡跨度；悬浮多一行显第三维值', node: <Replay>{() => <ScatterChart data={SCATTER} xField="x" yField="y" seriesField="type" sizeField="size" sizeRange={[6, 26]} height={300} />}</Replay>, code: '// sizeField 第三维→半径（√ 面积），sizeRange 控跨度\n<ScatterChart data={SCATTER} xField="x" yField="y" seriesField="type" sizeField="size" sizeRange={[6, 26]} height={300} />' },
  ];
  const api: ApiRow[] = [
    { name: 'xField / yField', desc: '横 / 纵连续数值字段', type: 'string', default: '–' },
    { name: 'seriesField', desc: '分组字段（决定颜色）', type: 'string', default: '–' },
    { name: 'sizeField / sizeRange', desc: '第三维→气泡半径（√ 面积比例）/ 半径跨度', type: 'string / [number, number]', default: '– / [4, 22]' },
    { name: 'size', desc: '点半径（无 sizeField 时）', type: 'number', default: '5' },
    { name: 'stagger', desc: '点序错峰占比', type: 'number', default: '0.5' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// Treemap 技术栈占比：名称 + 值（面积）+ 分组（颜色）
const TREEMAP: Record<string, any>[] = [
  { name: 'React', value: 420, group: '前端' }, { name: 'Vue', value: 360, group: '前端' }, { name: 'TypeScript', value: 280, group: '前端' },
  { name: 'Java', value: 520, group: '后端' }, { name: 'Go', value: 300, group: '后端' }, { name: 'Python', value: 380, group: '后端' }, { name: 'Node.js', value: 240, group: '后端' },
  { name: 'PostgreSQL', value: 260, group: '数据库' }, { name: 'Redis', value: 180, group: '数据库' }, { name: 'MongoDB', value: 140, group: '数据库' },
  { name: 'Docker', value: 220, group: '运维' }, { name: 'K8s', value: 160, group: '运维' }, { name: 'Nginx', value: 90, group: '运维' },
];

function TreemapDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '分组矩形树图', desc: 'squarify 布局面积∝值；colorField 分组着色 + 图例切换；cell 内显名称/值，悬浮其余降透明 + 气泡（名称/值/占比）', node: <Replay>{() => <TreemapChart data={TREEMAP} nameField="name" valueField="value" colorField="group" height={320} />}</Replay>, code: 'import { TreemapChart } from "react-native-flux-desktop";\n\n// squarify 布局面积正比于值；colorField 分组着色\n<TreemapChart data={TREEMAP} nameField="name" valueField="value" colorField="group" height={320} />' },
    { name: '无分组', desc: '不传 colorField 按叶子序号取色板色，无图例', node: <Replay>{() => <TreemapChart data={TREEMAP.slice(0, 8)} nameField="name" valueField="value" height={280} />}</Replay>, code: '// 不传 colorField：按叶子序号取色板色\n<TreemapChart data={TREEMAP} nameField="name" valueField="value" height={280} />' },
    { name: '纯色块', desc: 'label={false} 只留色块；gap 调 cell 间隙', node: <Replay>{() => <TreemapChart data={TREEMAP} nameField="name" valueField="value" colorField="group" label={false} gap={4} height={280} />}</Replay>, code: '// label={false} 只留色块；gap 调 cell 间隙\n<TreemapChart data={TREEMAP} nameField="name" valueField="value" colorField="group" label={false} gap={4} height={280} />' },
  ];
  const api: ApiRow[] = [
    { name: 'nameField / valueField', desc: '名称 / 数值字段（面积依据，≤0 不画）', type: 'string', default: "'name' / 'value'" },
    { name: 'colorField', desc: '分组字段（颜色 + 图例切换）', type: 'string', default: '–' },
    { name: 'gap', desc: 'cell 间隙', type: 'number', default: '2' },
    { name: 'label', desc: 'cell 内标签（空间不足自动省略）', type: 'boolean', default: 'true' },
    { name: 'tooltip', desc: '逐块悬浮高亮 + 名称/值/占比气泡', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// Sunburst 层级树：根「技术栈」→ 四大分支 → 各自子项（叶子 value 向上聚合）
const SUNBURST: SunburstNode = {
  name: '技术栈',
  children: [
    { name: '前端', children: [{ name: 'React', value: 420 }, { name: 'Vue', value: 360 }, { name: 'TypeScript', value: 280 }] },
    { name: '后端', children: [{ name: 'Java', value: 520 }, { name: 'Go', value: 300 }, { name: 'Python', value: 380 }, { name: 'Node.js', value: 240 }] },
    { name: '数据库', children: [{ name: 'PostgreSQL', value: 260 }, { name: 'Redis', value: 180 }, { name: 'MongoDB', value: 140 }] },
    { name: '运维', children: [{ name: 'Docker', value: 220 }, { name: 'K8s', value: 160 }, { name: 'Nginx', value: 90 }] },
  ],
};

function SunburstDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '双层环形树图', desc: '角度分区∝聚合值；子弧填满父弧区间；按顶层分支着色、逐环向外提亮；入场总扫角 0→360 揭示；点图例隐藏分支后重排（颜色锁定）', node: <Replay>{() => <SunburstChart data={SUNBURST} size={300} centerTitle="总热度" />}</Replay>, code: 'import { SunburstChart } from "react-native-flux-desktop";\n\n// data 为层级树根；角度分区正比于聚合值\n<SunburstChart data={SUNBURST} size={300} centerTitle="总热度" />' },
    { name: '单层 + 标签', desc: 'maxDepth=1 仅留顶层分支环；label 在外缘标占比', node: <Replay>{() => <SunburstChart data={SUNBURST} size={280} maxDepth={1} label innerRadius={0.32} />}</Replay>, code: '// maxDepth=1 仅顶层分支环；label 外缘标占比\n<SunburstChart data={SUNBURST} size={280} maxDepth={1} label innerRadius={0.32} />' },
    { name: '深环镂空', desc: 'innerRadius 调中心洞、padAngle 调弧间隙', node: <Replay>{() => <SunburstChart data={SUNBURST} size={300} innerRadius={0.24} padAngle={1.4} centerTitle="总计" />}</Replay>, code: '// innerRadius 中心洞、padAngle 弧间隙\n<SunburstChart data={SUNBURST} size={300} innerRadius={0.24} padAngle={1.4} centerTitle="总计" />' },
  ];
  const api: ApiRow[] = [
    { name: 'data', desc: '层级树根（value 或后代叶子聚合；根作中心洞不画）', type: 'SunburstNode', default: '—' },
    { name: 'size', desc: '直径', type: 'number', default: '300' },
    { name: 'innerRadius', desc: '中心洞半径比例（0..0.6）', type: 'number', default: '0.16' },
    { name: 'maxDepth', desc: '最多渲染环数（1 = 仅顶层分支环）', type: 'number', default: 'Infinity' },
    { name: 'padAngle', desc: '弧间隙角（度）', type: 'number', default: '0.8' },
    { name: 'label', desc: '顶层分支外缘占比标签', type: 'boolean', default: 'false' },
    { name: 'legend', desc: '顶层分支图例（点击切换显隐并重排）', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// Sankey 流量转化：来源 → 落地页 → 行为 → 结果（节点名引用）
const SANKEY_NODES = ['直接访问', '搜索引擎', '社交媒体', '首页', '活动页', '商品详情', '注册', '下单'];
const SANKEY_LINKS = [
  { source: '直接访问', target: '首页', value: 400 },
  { source: '搜索引擎', target: '首页', value: 500 },
  { source: '搜索引擎', target: '活动页', value: 300 },
  { source: '社交媒体', target: '活动页', value: 220 },
  { source: '首页', target: '商品详情', value: 600 },
  { source: '首页', target: '注册', value: 200 },
  { source: '活动页', target: '商品详情', value: 320 },
  { source: '活动页', target: '注册', value: 150 },
  { source: '商品详情', target: '下单', value: 520 },
  { source: '注册', target: '下单', value: 160 },
];

function SankeyDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '流量转化桑基图', desc: '分层 DAG：节点高∵流量、贝塞尔缎带宽度∵链接值；列按最长路径、节点色按序号、流带取源色半透明', node: <Replay>{() => <SankeyChart nodes={SANKEY_NODES} links={SANKEY_LINKS} width={640} height={340} />}</Replay>, code: 'import { SankeyChart } from "react-native-flux-desktop";\n\n// nodes 节点名 / links source,target,value\n<SankeyChart nodes={SANKEY_NODES} links={SANKEY_LINKS} width={640} height={340} />' },
    { name: '无标签 + 紧间距', desc: 'label={false} 只留色块与缎带；nodePadding 调列内间隙', node: <Replay>{() => <SankeyChart nodes={SANKEY_NODES} links={SANKEY_LINKS} width={640} height={300} label={false} nodePadding={20} />}</Replay>, code: '// label={false}；nodePadding 调列内间隙\n<SankeyChart nodes={SANKEY_NODES} links={SANKEY_LINKS} width={640} height={300} label={false} nodePadding={20} />' },
    { name: '悬浮联动', desc: 'tooltip：悬浮节点→提亮其全部进出链路（其余压暗）+ 流入/流出气泡；悬浮链路包围盒→自身提亮 + 流向气泡', node: <Replay>{() => <SankeyChart nodes={SANKEY_NODES} links={SANKEY_LINKS} width={640} height={340} />}</Replay>, code: '// tooltip（默认开）：悬浮节点提亮其全部进出链路\n<SankeyChart nodes={SANKEY_NODES} links={SANKEY_LINKS} width={640} height={340} />' },
  ];
  const api: ApiRow[] = [
    { name: 'nodes', desc: '节点（字符串名或 {name}）', type: '(string|{name})[]', default: '—' },
    { name: 'links', desc: '链接（source/target 可用下标或名字 + value 流量）', type: 'SankeyLinkDatum[]', default: '—' },
    { name: 'width / height', desc: '画布尺寸', type: 'number', default: '640 / 360' },
    { name: 'nodeWidth', desc: '节点矩形宽度', type: 'number', default: '14' },
    { name: 'nodePadding', desc: '同列节点竖直间隙', type: 'number', default: '14' },
    { name: 'label', desc: '节点侧标名称 + 流量', type: 'boolean', default: 'true' },
    { name: 'tooltip', desc: '节点/链路悬浮高亮联动 + 流量气泡', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function RoseDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '玫瑰图（半径）', desc: '等分角度、半径∝值；扇形自圆心绽放；点图例可隐藏类目（角度重分、按剩余最大值缩半径）', node: <Replay>{() => <RoseChart data={SOURCE} xField="type" yField="value" size={260} roseType="radius" />}</Replay>, code: 'import { RoseChart } from "react-native-flux-desktop";\n\n// 等分角度、半径正比于值；roseType=radius\n<RoseChart data={SOURCE} xField="type" yField="value" size={260} roseType="radius" />' },
    { name: '面积正比 + 环', desc: 'roseType=area 半径∝√值，innerRadius 镂空', node: <Replay>{() => <RoseChart data={SOURCE} xField="type" yField="value" size={260} roseType="area" innerRadius={0.28} />}</Replay>, code: '// roseType=area 半径正比于开方值；innerRadius 镂空\n<RoseChart data={SOURCE} xField="type" yField="value" size={260} roseType="area" innerRadius={0.28} />' },
    { name: '数据标签', desc: 'label 在花瓣顶端中角外侧显数值', node: <Replay>{() => <RoseChart data={SOURCE} xField="type" yField="value" size={260} roseType="area" label />}</Replay>, code: '// label：花瓣顶端外侧显数值\n<RoseChart data={SOURCE} xField="type" yField="value" size={260} roseType="area" label />' },
    { name: '悬浮交互', desc: 'tooltip：命中花瓣外扩提亮、邻瓣压暗，气泡显 值+占比（完全绽放后才挂命中盒）', node: <Replay>{() => <RoseChart data={SOURCE} xField="type" yField="value" size={260} innerRadius={0.22} />}</Replay>, code: '// tooltip（默认开）：命中花瓣外扩提亮 + 邻瓣压暗\n<RoseChart data={SOURCE} xField="type" yField="value" size={260} innerRadius={0.22} />' },
  ];
  const api: ApiRow[] = [
    { name: 'xField / yField', desc: '类目 / 数值字段', type: 'string', default: "type / value" },
    { name: 'roseType', desc: 'radius 线性 / area 面积正比', type: "'radius' | 'area'", default: "'radius'" },
    { name: 'innerRadius', desc: '内径比例（>0 环）', type: 'number', default: '0' },
    { name: 'padAngle', desc: '扇区间隙角', type: 'number', default: '1' },
    { name: 'label', desc: '花瓣顶端数值数据标签', type: 'boolean', default: 'false' },
    { name: 'tooltip', desc: '悬浮花瓣外扩 + 邻瓣压暗 + 值/占比气泡', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function FunnelDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '转化漏斗', desc: '倒梯形首尾相接（顶宽∝本阶段、底宽∝下一阶段）+ 右侧转化率；悬停高亮阶段并弹 tooltip', node: <Replay>{() => <FunnelChart data={FUNNEL} xField="stage" yField="value" />}</Replay>, code: 'import { FunnelChart } from "react-native-flux-desktop";\n\n// 倒梯形首尾相接 + 右侧转化率\n<FunnelChart data={FUNNEL} xField="stage" yField="value" />', },
    { name: '降序排列', desc: 'sortable 按值重排', node: <Replay>{() => <FunnelChart data={FUNNEL} xField="stage" yField="value" sortable stageHeight={40} />}</Replay>, code: '// sortable：按值降序重排\n<FunnelChart data={FUNNEL} xField="stage" yField="value" sortable stageHeight={40} />' },
  ];
  const api: ApiRow[] = [
    { name: 'xField / yField', desc: '阶段 / 数值字段', type: 'string', default: "stage / value" },
    { name: 'stageHeight / gap', desc: '单阶段梯形高 / 细缝间隙', type: 'number', default: '46 / 3' },
    { name: 'sortable', desc: '按值降序', type: 'boolean', default: 'false' },
    { name: 'tooltip', desc: '悬停高亮阶段 + 数值/转化率/占首阶段气泡', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function WaterfallDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '瀑布图', desc: '浮动柱表增减；增=绿 减=红 合计=主色，柱间虚线连接；悬停高亮并显增减/累计', node: <Replay>{() => <WaterfallChart data={WATERFALL} xField="label" yField="value" totalField="total" height={320} />}</Replay>, code: 'import { WaterfallChart } from "react-native-flux-desktop";\n\n// 浮动柱表增减；增=绿 减=红 合计=主色，柱间虚线连接\n<WaterfallChart data={WATERFALL} xField="label" yField="value" totalField="total" height={320} />' },
  ];
  const api: ApiRow[] = [
    { name: 'yField', desc: '增减量（合计行给绝对累计值）', type: 'string', default: "'value'" },
    { name: 'totalField', desc: '合计行标记字段（真值即合计）', type: 'string', default: '–' },
    { name: 'color', desc: '{ increase, decrease, total } 覆盖', type: 'object', default: '语义色' },
    { name: 'tooltip', desc: '悬停高亮柱 + 增减/累计气泡', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function HeatmapDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '热力网格', desc: 'x/y 类目成网格，单元以基准色 alpha 强度映射值；对角错峰淡入；悬停高亮描边+气泡', node: <Replay>{() => <HeatmapChart data={HEATMAP} xField="x" yField="y" valueField="value" height={260} />}</Replay>, code: 'import { HeatmapChart } from "react-native-flux-desktop";\n\n// x/y 类目成网格，单元以基准色 alpha 强度映射值\n<HeatmapChart data={HEATMAP} xField="x" yField="y" valueField="value" height={260} />' },
    { name: '显数值', desc: 'showValue 格内渲染数值（深色格转浅字）', node: <Replay>{() => <HeatmapChart data={HEATMAP} xField="x" yField="y" valueField="value" height={260} showValue color="#5AD8A6" />}</Replay>, code: '// showValue 格内渲染数值（深色格转浅字）\n<HeatmapChart data={HEATMAP} xField="x" yField="y" valueField="value" height={260} showValue color="#5AD8A6" />' },
  ];
  const api: ApiRow[] = [
    { name: 'xField / yField', desc: '横 / 纵类目字段', type: 'string', default: '–' },
    { name: 'valueField', desc: '强度数值字段', type: 'string', default: "'value'" },
    { name: 'color', desc: '基准色（alpha 随值递增）', type: 'string', default: '主色' },
    { name: 'showValue', desc: '单元显数值', type: 'boolean', default: 'false' },
    { name: 'tooltip', desc: '悬停高亮单元格 + x/y 类目与数值', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function ComboDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '折柱组合', desc: '柱取 sales、线取 rate，共享左 y 轴；柱长高 + 线描出', node: <Replay>{() => <ComboChart data={COMBO} xField="month" barField="sales" lineField="rate" height={320} />}</Replay>, code: 'import { ComboChart } from "react-native-flux-desktop";\n\n// 柱取 sales、线取 rate，共享左 y 轴；柱长高 + 线描出\n<ComboChart data={COMBO} xField="month" barField="sales" lineField="rate" height={320} />' },
  ];
  const api: ApiRow[] = [
    { name: 'barField / lineField', desc: '柱 / 线数值字段', type: 'string', default: '–' },
    { name: 'color', desc: '[柱色, 线色]', type: '[string, string]', default: '色板' },
    { name: 'radius', desc: '柱顶圆角', type: 'number', default: '4' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function SparklineDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '迷你趋势', desc: '无坐标轴，内联一行走势；折线自左描出', node: <Replay>{() => <Space size="large" wrap><SparklineChart data={SPARK_UP} height={48} color="#5AD8A6" /><SparklineChart data={SPARK_DOWN} height={48} color="#F4664A" /></Space>}</Replay>, code: 'import { SparklineChart, Space } from "react-native-flux-desktop";\n\n// 无坐标轴，内联一行走势；折线自左描出\n<Space size="large" wrap>\n  <SparklineChart data={SPARK_UP} height={48} color="#5AD8A6" />\n  <SparklineChart data={SPARK_DOWN} height={48} color="#F4664A" />\n</Space>' },
    { name: '面积迷你', desc: 'type=area 折线下方半透明填充', node: <Replay>{() => <SparklineChart data={SPARK_UP} type="area" height={56} width={220} />}</Replay>, code: '// type=area：折线下方半透明填充\n<SparklineChart data={SPARK_UP} type="area" height={56} width={220} />' },
    { name: '平滑迷你', desc: 'smooth 曲线走势（可叠 area）', node: <Replay>{() => <SparklineChart data={SPARK_UP} type="area" smooth height={56} width={220} color="#5B8FF9" />}</Replay>, code: '// smooth 曲线走势（可叠 area）\n<SparklineChart data={SPARK_UP} type="area" smooth height={56} width={220} color="#5B8FF9" />' },
    { name: '悬浮查数', desc: 'tooltip：透明列命中→准星 + 锚点 + 小气泡（类目/值），迷你图也能查数', node: <Replay>{() => <SparklineChart data={SPARK_UP} type="area" height={56} width={260} color="#5AD8A6" />}</Replay>, code: '// 透明列命中→准星 + 锚点 + 小气泡，迷你图也能查数\n<SparklineChart data={SPARK_UP} type="area" height={56} width={260} color="#5AD8A6" />' },
  ];
  const api: ApiRow[] = [
    { name: 'yField', desc: '数值字段', type: 'string', default: "'value'" },
    { name: 'type', desc: 'line 仅线 / area 填充', type: "'line' | 'area'", default: "'line'" },
    { name: 'endDot', desc: '高亮末点', type: 'boolean', default: 'true' },
    { name: 'height', desc: '画布高', type: 'number', default: '48' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// 班级成绩分布（每类一组原始分数，含离群点）
const BOX_DATA: Record<string, any>[] = [
  { cls: '一班', scores: [78, 82, 85, 88, 90, 76, 84, 89, 91, 79, 83, 87, 60, 86, 81] },
  { cls: '二班', scores: [65, 70, 72, 68, 74, 69, 71, 73, 66, 70, 99, 67, 72, 69, 71] },
  { cls: '三班', scores: [88, 90, 92, 85, 89, 91, 87, 93, 86, 90, 88, 91, 45, 89, 92] },
  { cls: '四班', scores: [72, 75, 78, 80, 77, 74, 79, 76, 73, 81, 78, 75, 100, 77, 74] },
];

function BoxPlotDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '成绩分布箱线图', desc: 'Tukey 五数概括：箱体 Q1~Q3 + 中位粗线 + 上下须（1.5·IQR 内极值）+ 空心离群点；自带非零基线 y 轴，入场由中位线向两端展开', node: <Replay>{() => <BoxPlotChart data={BOX_DATA} xField="cls" yField="scores" width={560} height={320} mean />}</Replay>, code: 'import { BoxPlotChart } from "react-native-flux-desktop";\n\n// Tukey 五数概括：箱体 Q1~Q3 + 中位粗线 + 上下须 + 离群点；mean 叠均值菱形\n<BoxPlotChart data={BOX_DATA} xField="cls" yField="scores" width={560} height={320} mean />' },
    { name: '隐藏离群 + 图例', desc: 'outliers={false} 只留箱体；legend 按类目着色块图例', node: <Replay>{() => <BoxPlotChart data={BOX_DATA} xField="cls" yField="scores" width={560} height={300} outliers={false} legend />}</Replay>, code: '// outliers={false} 只留箱体；legend 按类目着色块图例\n<BoxPlotChart data={BOX_DATA} xField="cls" yField="scores" width={560} height={300} outliers={false} legend />' },
  ];
  const api: ApiRow[] = [
    { name: 'data / xField / yField', desc: '每行一个类目；yField 指向一组原始数值 number[]', type: 'Record[]/string', default: '—' },
    { name: 'mean', desc: '均值菱形标记', type: 'boolean', default: 'false' },
    { name: 'outliers', desc: '离群点（fence 外）空心圈', type: 'boolean', default: 'true' },
    { name: 'boxOpacity', desc: '箱体填充透明度后缀（十六进制）', type: 'string', default: "'33'" },
    { name: 'color', desc: '按类目序号取色板或自定义', type: 'string | string[]', default: '色板' },
    { name: 'tooltip', desc: '悬停逐类目显五数概括/样本数/离群', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// 直方图样本：120 名员工月薪（近似正态 + 少量高薪长尾），每行一个原始数值参与分箱
const HIST_DATA: Record<string, any>[] = ((): Record<string, any>[] => {
  // 伪随机（种子固定，可复现）正态样本
  let seed = 42;
  const rand = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const normal = (mu: number, sd: number): number => {
    const u = Math.max(1e-9, rand());
    const v = rand();
    return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const rows: Record<string, any>[] = [];
  for (let i = 0; i < 160; i++) {
    let s = normal(12000, 3200);
    if (i % 23 === 0) s += 14000; // 少量高薪长尾
    rows.push({ salary: Math.max(3000, Math.round(s / 100) * 100) });
  }
  return rows;
})();

function HistogramDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '月薪分布直方图', desc: 'Freedman–Diaconis 自动分箱（等宽末箱右闭）；相邻柱自基线长高、类目错峰；悬停逐箱显 [下界,上界) 与频数', node: <Replay>{() => <HistogramChart data={HIST_DATA} valueField="salary" width={560} height={320} label />}</Replay>, code: 'import { HistogramChart } from "react-native-flux-desktop";\n\n// Freedman–Diaconis 自动分箱（等宽末箱右闭）；label 显频数\n<HistogramChart data={HIST_DATA} valueField="salary" width={560} height={320} label />' },
    { name: '固定箱数', desc: 'binCount={8} 手动指定组数', node: <Replay>{() => <HistogramChart data={HIST_DATA} valueField="salary" binCount={8} width={560} height={300} color="#5AD8A6" />}</Replay>, code: '// binCount={8} 手动指定组数\n<HistogramChart data={HIST_DATA} valueField="salary" binCount={8} width={560} height={300} color="#5AD8A6" />' },
    { name: '固定箱宽', desc: 'binWidth={5000} 每 5k 一档，优先于 binCount', node: <Replay>{() => <HistogramChart data={HIST_DATA} valueField="salary" binWidth={5000} width={560} height={300} label color="#F6BD16" />}</Replay>, code: '// binWidth={5000} 每 5k 一档，优先于 binCount\n<HistogramChart data={HIST_DATA} valueField="salary" binWidth={5000} width={560} height={300} label color="#F6BD16" />' },
  ];
  const api: ApiRow[] = [
    { name: 'data / valueField', desc: '每行一个样本，取 valueField 数值参与分箱', type: 'Record[]/string', default: '—' },
    { name: 'binCount', desc: '期望箱数（与 binWidth 二选一）', type: 'number', default: 'FD 自动' },
    { name: 'binWidth', desc: '固定箱宽（优先于 binCount）', type: 'number', default: '—' },
    { name: 'label', desc: '柱顶频数标签', type: 'boolean', default: 'false' },
    { name: 'color', desc: '柱色（单色或色板）', type: 'string | string[]', default: '主色' },
    { name: 'binFormatter / yAxisFormatter', desc: '箱下界 / 频数轴刻度格式化', type: 'fn', default: 'compactNumber' },
    { name: 'tooltip', desc: '悬停逐箱显区间与频数', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// 小提琴图样本：三组分布形态各异的大样本（正态 / 双峰 / 右偏），展示 KDE 轮廓
const VIOLIN_DATA: Record<string, any>[] = ((): Record<string, any>[] => {
  let seed = 7;
  const rand = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const normal = (mu: number, sd: number): number => {
    const u = Math.max(1e-9, rand());
    const v = rand();
    return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const normalGroup = (n: number, mu: number, sd: number): number[] => {
    const a: number[] = [];
    for (let i = 0; i < n; i++) a.push(Math.round(normal(mu, sd) * 10) / 10);
    return a;
  };
  const bimodal = (n: number): number[] => {
    const a: number[] = [];
    for (let i = 0; i < n; i++) a.push(Math.round((rand() < 0.5 ? normal(45, 6) : normal(72, 6)) * 10) / 10);
    return a;
  };
  const skewed = (n: number): number[] => {
    const a: number[] = [];
    for (let i = 0; i < n; i++) a.push(Math.round((40 + Math.pow(rand(), 2.4) * 55) * 10) / 10);
    return a;
  };
  return [
    { group: 'A 正态', scores: normalGroup(120, 60, 12) },
    { group: 'B 双峰', scores: bimodal(120) },
    { group: 'C 右偏', scores: skewed(120) },
  ];
})();

function ViolinDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '分布小提琴图', desc: '高斯 KDE 密度→对称轮廓（密集水平矩形条栅格化）；内嵌迷你箱（白 IQR 盒 + 中位线 + 须线）；组间共享横向量程便于比较形态；入场由中轴展开，悬停逐组 tooltip', node: <Replay>{() => <ViolinChart data={VIOLIN_DATA} xField="group" yField="scores" width={560} height={340} />}</Replay>, code: 'import { ViolinChart } from "react-native-flux-desktop";\n\n// 高斯 KDE 密度→对称轮廓；内嵌迷你箱（IQR + 中位 + 须）\n<ViolinChart data={VIOLIN_DATA} xField="group" yField="scores" width={560} height={340} />' },
    { name: '纯轮廓', desc: 'box={false} 只看密度形状；fillOpacity 调填充', node: <Replay>{() => <ViolinChart data={VIOLIN_DATA} xField="group" yField="scores" width={560} height={320} box={false} legend />}</Replay>, code: '// box={false} 只看密度形状；legend 图例\n<ViolinChart data={VIOLIN_DATA} xField="group" yField="scores" width={560} height={320} box={false} legend />' },
    { name: '自定义带宽', desc: 'bandwidth={6} 加粗平滑（欠拟合→更宽峰）', node: <Replay>{() => <ViolinChart data={VIOLIN_DATA} xField="group" yField="scores" width={560} height={320} bandwidth={6} mean />}</Replay>, code: '// bandwidth={6} 加粗平滑（欠拟合→更宽峰）；mean 均值圆点\n<ViolinChart data={VIOLIN_DATA} xField="group" yField="scores" width={560} height={320} bandwidth={6} mean />' },
  ];
  const api: ApiRow[] = [
    { name: 'data / xField / yField', desc: '每行一个类目；yField 指向一组原始数值 number[]', type: 'Record[]/string', default: '—' },
    { name: 'box', desc: '内嵌迷你箱（IQR + 中位 + 须）', type: 'boolean', default: 'true' },
    { name: 'mean', desc: '均值圆点（需 box）', type: 'boolean', default: 'false' },
    { name: 'bandwidth', desc: 'KDE 带宽（缺省 Silverman）', type: 'number', default: '自动' },
    { name: 'fillOpacity', desc: '轮廓填充透明度后缀', type: 'string', default: "'cc'" },
    { name: 'color', desc: '按类目序号取色板或自定义', type: 'string | string[]', default: '色板' },
    { name: 'tooltip', desc: '悬停逐类目显五数概括/样本数', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// 区间条示例：项目甘特工期 / 城市气温区间 / 分数带
const GANTT_DATA: Record<string, any>[] = [
  { task: '需求调研', start: 0, end: 5, phase: '前期' },
  { task: '原型设计', start: 3, end: 8, phase: '前期' },
  { task: '前端开发', start: 7, end: 18, phase: '开发' },
  { task: '后端开发', start: 6, end: 20, phase: '开发' },
  { task: '联调测试', start: 17, end: 24, phase: '测试' },
  { task: '上线部署', start: 23, end: 26, phase: '测试' },
];
const TEMP_DATA: Record<string, any>[] = [
  { city: '哈尔滨', lo: -18, hi: -2 },
  { city: '北京', lo: -3, hi: 8 },
  { city: '上海', lo: 4, hi: 13 },
  { city: '广州', lo: 13, hi: 22 },
  { city: '三亚', lo: 21, hi: 29 },
];

function RangeBarDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '项目甘特图', desc: '每行一任务 [开始,结束] 周 → 横向浮动条（x 轴线性数值、y 轴类目）；按 phase 字段分色 + 图例；入场由起端生长，悬停逐行显 起/止/跨度', node: <Replay>{() => <RangeBarChart data={GANTT_DATA} yField="task" startField="start" endField="end" colorField="phase" legend width={600} height={300} label />}</Replay>, code: 'import { RangeBarChart } from "react-native-flux-desktop";\n\n// 每行一任务 [start,end] 横向浮动条；colorField 分色 + 图例\n<RangeBarChart data={GANTT_DATA} yField="task" startField="start" endField="end" colorField="phase" legend width={600} height={300} label />' },
    { name: '气温区间', desc: '含负值域（-18~29）；单色板按行序号取色', node: <Replay>{() => <RangeBarChart data={TEMP_DATA} yField="city" startField="lo" endField="hi" width={560} height={280} xAxisFormatter={(v): string => `${v}°`} />}</Replay>, code: '// 含负值域；xAxisFormatter 自定义轴刻度（本例加度数符号）\n<RangeBarChart data={TEMP_DATA} yField="city" startField="lo" endField="hi" width={560} height={280} xAxisFormatter={(v): string => `${v}°`} />' },
    { name: '粗条无标签', desc: 'barRatio=0.85 radius=2 块状区间带', node: <Replay>{() => <RangeBarChart data={TEMP_DATA} yField="city" startField="lo" endField="hi" width={560} height={280} barRatio={0.85} radius={2} color="#5A7FF6" />}</Replay>, code: '// barRatio=0.85 radius=2 块状区间带\n<RangeBarChart data={TEMP_DATA} yField="city" startField="lo" endField="hi" width={560} height={280} barRatio={0.85} radius={2} color="#5A7FF6" />' },
  ];
  const api: ApiRow[] = [
    { name: 'data / yField / startField / endField', desc: '每行一类目；起/止两个数值字段', type: 'Record[]/string', default: '—' },
    { name: 'colorField', desc: '按此字段分色（缺省按行序号）', type: 'string', default: '—' },
    { name: 'barRatio', desc: '条高占带高比例', type: 'number', default: '0.6' },
    { name: 'radius', desc: '条端圆角', type: 'number', default: '4' },
    { name: 'label', desc: '条末显示区间文本', type: 'boolean', default: 'false' },
    { name: 'color', desc: '单色 / 色板', type: 'string | string[]', default: '色板' },
    { name: 'tooltip', desc: '悬停逐行显 起/止/跨度', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// 径向条示例：多项指标完成度同心环
const RADIAL_DATA: Record<string, any>[] = [
  { name: '服务器', value: 86 },
  { name: '磁盘', value: 62 },
  { name: '带宽', value: 45 },
  { name: 'CPU', value: 73 },
];

function RadialBarDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '指标完成度', desc: '多条同心环，每环一指标，弧长∵value/max（满圈 360°）；右侧图例悬停→对应环提亮其余淡出 + 中心显该项统计；入场各环扫角错峰', node: <Replay>{() => <RadialBarChart data={RADIAL_DATA} nameField="name" valueField="value" max={100} centerTitle="资源占用" size={240} />}</Replay>, code: 'import { RadialBarChart } from "react-native-flux-desktop";\n\n// 多条同心环，每环一指标，弧长正比 value/max；右侧图例悬停联动\n<RadialBarChart data={RADIAL_DATA} nameField="name" valueField="value" max={100} centerTitle="资源占用" size={240} />' },
    { name: '无图例单环', desc: 'legend={false} + 单环 + 中心标题，作大号 KPI 环形进度', node: <Replay>{() => <RadialBarChart data={[{ name: '达成率', value: 78 }]} max={100} legend={false} centerTitle="季度目标" color="#5AD8A6" size={200} formatter={(v): string => `${v}%`} />}</Replay>, code: '// legend={false} 单环 + 中心标题，作大号 KPI 环形进度\n<RadialBarChart data={[{ name: \'达成率\', value: 78 }]} max={100} legend={false} centerTitle="季度目标" color="#5AD8A6" size={200} formatter={(v): string => `${v}%`} />' },
  ];
  const api: ApiRow[] = [
    { name: 'data / nameField / valueField', desc: '每项一个环：名称 + 数值', type: 'Record[]/string', default: 'name/value' },
    { name: 'max / maxField', desc: '全局上限 / 每项独立上限字段', type: 'number/string', default: '取最大值' },
    { name: 'size', desc: '画布直径', type: 'number', default: '260' },
    { name: 'centerTitle', desc: '中心标题（悬停图例时换为该项）', type: 'string', default: '—' },
    { name: 'legend', desc: '右侧图例（悬停驱动高亮）', type: 'boolean', default: 'true' },
    { name: 'color', desc: '单色 / 色板（按环序号）', type: 'string | string[]', default: '色板' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// 子弹图示例：KPI 达成度并排（定性区间带 + 性能条 + 目标标记）
const BULLET_DATA: Record<string, any>[] = [
  { label: '销售额', value: 220, target: 250 },
  { label: '客单价', value: 48, target: 45 },
  { label: '转化率', value: 3.2, target: 3.8 },
  { label: '复购率', value: 61, target: 55 },
];
const BULLET_SCORE: Record<string, any>[] = [
  { label: '语文', value: 86, target: 90 },
  { label: '数学', value: 72, target: 85 },
  { label: '英语', value: 95, target: 88 },
  { label: '物理', value: 63, target: 75 },
];

function BulletDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: 'KPI 达成度', desc: '每行一条：浅→深定性区间带铺底 + 深色性能条（实际值）+ 竖线目标标记；ranges 定义合格线，入场性能条自左生长、目标延迟淡入，悬停逐行 tooltip 显 实际/目标/所处区间', node: <Replay>{() => <BulletChart data={BULLET_SCORE} ranges={[60, 80, 90]} rangeColors={['#FFD8D8', '#FFF3C4', '#D3F9D8', '#A6E7C1']} width={560} label />}</Replay>, code: 'import { BulletChart } from "react-native-flux-desktop";\n\n// 每行：浅→深定性区间带铺底 + 性能条（实际值）+ 竖线目标标记\n<BulletChart data={BULLET_SCORE} ranges={[60, 80, 90]} rangeColors={[\'#FFD8D8\', \'#FFF3C4\', \'#D3F9D8\', \'#A6E7C1\']} width={560} label />' },
    { name: '业务指标', desc: '无量纲差异大的多指标，各自独立量程更适用 max；此处统一 0~300 展示相对达成', node: <Replay>{() => <BulletChart data={BULLET_DATA.slice(0, 2)} ranges={[120, 200, 280]} max={300} width={560} color="#5B8FF9" targetColor="#E86452" />}</Replay>, code: '// 各自独立量程更适用 max；统一 0~300 展示相对达成\n<BulletChart data={BULLET_DATA.slice(0, 2)} ranges={[120, 200, 280]} max={300} width={560} color="#5B8FF9" targetColor="#E86452" />' },
    { name: '紧凑无区间', desc: '不传 ranges → 仅性能条 + 目标标记，作行内 KPI 迷你条', node: <Replay>{() => <BulletChart data={BULLET_SCORE} max={100} width={560} barRatio={0.5} color="#1E9493" />}</Replay>, code: '// 不传 ranges → 仅性能条 + 目标标记，作行内 KPI 迷你条\n<BulletChart data={BULLET_SCORE} max={100} width={560} barRatio={0.5} color="#1E9493" />' },
  ];
  const api: ApiRow[] = [
    { name: 'data / labelField / valueField / targetField', desc: '每行：名称 + 实际值 + 目标值', type: 'Record[]/string', default: 'label/value/target' },
    { name: 'ranges', desc: '定性区间上界数组（升序），n 个上界→n+1 段带', type: 'number[]', default: '[]' },
    { name: 'rangeColors', desc: '各段带颜色（长度 = ranges.length+1）', type: 'string[]', default: '灰阶递增' },
    { name: 'color / targetColor', desc: '性能条色 / 目标标记色', type: 'string', default: '主色 / 文字色' },
    { name: 'max', desc: '值轴上限（缺省取区间/实际/目标最大值）', type: 'number', default: '自动' },
    { name: 'barRatio', desc: '性能条高占行高比例', type: 'number', default: '0.42' },
    { name: 'label', desc: '条末显示实际值', type: 'boolean', default: 'false' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

// 日历热力图示例：GitHub 风格年度贡献（确定性伪随机生成，周末偏高、含休整空档）
function genContrib(seed: number): Record<string, any>[] {
  let s = seed;
  const rnd = (): number => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const out: Record<string, any>[] = [];
  const start = Date.UTC(2026, 0, 1);
  for (let i = 0; i < 270; i++) {
    const ms = start + i * 86400000;
    const wd = new Date(ms).getUTCDay();
    const r = rnd();
    let v = 0;
    if (wd === 0 || wd === 6) { if (r > 0.45) v = Math.floor(rnd() * 6); } // 周末较少
    else if (r > 0.12) v = 1 + Math.floor(rnd() * 12);
    if (rnd() > 0.9) v = 0; // 随机空档
    const d = new Date(ms);
    const date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    out.push({ date, value: v });
  }
  return out;
}
const CONTRIB = genContrib(20260927);

function CalendarHeatmapDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '年度贡献图', desc: '周列 × 星期行栅格，每格颜色深浅映射当日提交数（基准色 + alpha）；顶部月份标签、左侧星期标签、右下 Less→More 色阶图例；入场按列错峰淡入，悬停逐格 tooltip 显日期+数值', node: <Replay>{() => <CalendarHeatmapChart data={CONTRIB} color="#2EA043" cellSize={12} cellGap={3} />}</Replay>, code: 'import { CalendarHeatmapChart } from "react-native-flux-desktop";\n\n// 周列 × 星期行栅格，每格颜色深浅映射当日提交数\n<CalendarHeatmapChart data={CONTRIB} color="#2EA043" cellSize={12} cellGap={3} />' },
    { name: '主色连续', desc: '不传 color → 用品牌主色；不传 levels → 连续色阶', node: <Replay>{() => <CalendarHeatmapChart data={CONTRIB} cellSize={11} cellGap={2} />}</Replay>, code: '// 不传 color → 用品牌主色；不传 levels → 连续色阶\n<CalendarHeatmapChart data={CONTRIB} cellSize={11} cellGap={2} />' },
    { name: '周一开篇 + 离散 5 级', desc: 'startOfWeek=1（周一起）+ levels=5（分档着色，更接近 GitHub 观感）', node: <Replay>{() => <CalendarHeatmapChart data={CONTRIB} startOfWeek={1} levels={5} color="#5B8FF9" weekdayNames={['日', '一', '二', '三', '四', '五', '六']} />}</Replay>, code: '// startOfWeek=1（周一起）+ levels=5（分档着色）+ 中文星期标签\n<CalendarHeatmapChart data={CONTRIB} startOfWeek={1} levels={5} color="#5B8FF9" weekdayNames={[\'日\', \'一\', \'二\', \'三\', \'四\', \'五\', \'六\']} />' },
  ];
  const api: ApiRow[] = [
    { name: 'data / dateField / valueField', desc: '每项 { date: \'YYYY-MM-DD\', value }', type: 'Record[]/string', default: 'date/value' },
    { name: 'cellSize / cellGap', desc: '单元格边长 / 间隙', type: 'number', default: '12 / 3' },
    { name: 'startOfWeek', desc: '每周起始日 0=周日..6=周六', type: 'number', default: '0' },
    { name: 'color', desc: '基准色（alpha 随值递增）', type: 'string', default: '主色' },
    { name: 'levels', desc: '离散色阶级数（缺省连续）', type: 'number', default: '—' },
    { name: 'monthNames / weekdayNames', desc: '月/星期标签（可中文）', type: 'string[]', default: '英文' },
    { name: 'showMonthLabels / showWeekdayLabels', desc: '显示月/星期标签', type: 'boolean', default: 'true' },
    { name: 'tooltip', desc: '悬停逐格显日期+数值', type: 'boolean', default: 'true' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

function ExportDemo(): React.ReactElement {
  const pieRef = React.useRef<any>(null);
  const lineRef = React.useRef<any>(null);
  const [saved, setSaved] = React.useState('');
  const demos: DemoItem[] = [
    {
      name: '导出图表 PNG',
      desc: 'ChartExportButton：把任意图表容器当前帧从画布裁成 PNG → 原生另存为对话框写盘（区域快照链路：ref → 场景节点 → 最近一帧画布按 ax/ay×dpr 裁剪）；高分屏下按物理像素导出不降采样',
      node: (
        <View style={{ gap: 12 }}>
          <View ref={pieRef}>
            <PieChart data={SOURCE} angleField="value" colorField="type" size={200} innerRadius={0.55} centerTitle="总访问量" />
          </View>
          <ChartExportButton target={pieRef} filename="pie.png" title="导出饼图" onSaved={setSaved} />
          <ChartExportButton target={pieRef} filename="pie-2x.png" title="再存一份" onSaved={setSaved} />
          {saved ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5AD8A6' }} /><Text style={{ fontSize: 12, color: '#5AD8A6' }} numberOfLines={1}>已保存：{saved}</Text></View> : null}
        </View>
      ),
      code: 'import { ChartExportButton, PieChart, View } from "react-native-flux-desktop";\n\n// ref → 场景节点 → 最近一帧画布按区域裁成 PNG → 原生另存为对话框写盘\nconst pieRef = useRef<any>(null);\n<View ref={pieRef}>\n  <PieChart data={SOURCE} angleField="value" colorField="type" size={200} innerRadius={0.55} centerTitle="总访问量" />\n</View>\n<ChartExportButton target={pieRef} filename="pie.png" title="导出饼图" onSaved={setSaved} />',
    },
    {
      name: '导出折线图',
      desc: '任意容器同理：把图表包在带 ref 的 View 里即可导出（含坐标轴/网格/标签整块区域）',
      node: (
        <View style={{ gap: 12 }}>
          <View ref={lineRef}>
            <LineChart data={TREND_SINGLE} xField="month" yField="value" label height={220} animation={false} />
          </View>
          <ChartExportButton target={lineRef} filename="line.png" title="导出折线图" onSaved={setSaved} />
        </View>
      ),
      code: '// 任意容器同理：把图表包在带 ref 的 View 里即可导出（含坐标轴/网格/标签整块区域）\nconst lineRef = useRef<any>(null);\n<View ref={lineRef}>\n  <LineChart data={TREND_SINGLE} xField="month" yField="value" label height={220} animation={false} />\n</View>\n<ChartExportButton target={lineRef} filename="line.png" title="导出折线图" onSaved={setSaved} />',
    },
  ];
  const api: ApiRow[] = [
    { name: 'target', desc: '要导出的容器节点 ref（ref → SceneNode，快照取其屏幕区域）', type: 'RefObject', default: '—' },
    { name: 'filename', desc: '默认文件名（含 .png）', type: 'string', default: "'chart.png'" },
    { name: 'title', desc: '按钮文案', type: 'string', default: "'导出 PNG'" },
    { name: 'onSaved', desc: '保存成功回调（最终绝对路径）', type: '(path)=>void', default: '—' },
    { name: 'disabled', desc: '禁用按钮', type: 'boolean', default: 'false' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

export { LineDemo, AreaDemo, ColumnDemo, BarDemo, PieDemo, RadarDemo, GaugeDemo, ScatterDemo, RoseDemo, FunnelDemo, WaterfallDemo, HeatmapDemo, ComboDemo, SparklineDemo, TreemapDemo, SunburstDemo, SankeyDemo, BoxPlotDemo, HistogramDemo, ViolinDemo, RangeBarDemo, RadialBarDemo, BulletDemo, CalendarHeatmapDemo, ExportDemo };
