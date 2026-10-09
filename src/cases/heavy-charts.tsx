// OPS-LIVE：实时交易运营监控大屏 —— 一张图表密集的常规业务看板（非压力测试页）。
// 主题：电商/交易平台的实时运营中心。顶栏常驻「渲染帧率」（复用 FpsMonitor，反映本大屏实时重绘顺滑度）+
//   GPU/CPU 模式徽章 + 刷新频率切换；主体用十余种图表从多维度刻画实时业务：
//   成交/订单滚动走势（每拍滚动）、支付成功率仪表 + 延迟/QPS 实时折线、渠道×地区堆叠、订单构成、
//   成交量-客单价组合、热销榜、转化漏斗、区域能力雷达、时段热度玫瑰、用户价值气泡、收入瀑布、
//   活跃热力矩阵、类目矩形树、资源径向条、发布活跃日历热力，外加实时订单流水 ProTable + 风控告警 Timeline。
// 业务逻辑：选刷新频率后每拍滚动时序缓冲 + 随机游走演化 KPI/风控 + 前插订单 + 追加告警；「刷新大盘」换种子重排静态分布。
// 用法：CaseBoard 卡片「实时运营监控大屏」→ 独立窗口打开（scroll:true，由窗口提供整页滚动）。
import React from 'react';
import { View, Text, Card, Tag, Button, Switch, Segmented, Divider, useToken, type StatCardProps, AreaChart, LineChart, ColumnChart, BarChart, PieChart, ComboChart, GaugeChart, FunnelChart, RadarChart, RoseChart, ScatterChart, WaterfallChart, HeatmapChart, TreemapChart, RadialBarChart, CalendarHeatmapChart, type ProColumn, Timeline } from 'react-native-flux-desktop';
import { FpsMonitor } from 'react-native-flux-desktop-dev';
import { StatisticGroup, ProTable } from 'react-native-flux-desktop-pro';

const ROLL_N = 30;
const CHANNELS = ['搜索', '直接', '社交', '邮件', '联盟'];
const REGIONS = ['华东', '华南', '华北', '西南'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const PRODUCTS = ['蓝牙耳机 Pro', '机械键盘 K87', '无线鼠标 M3', '4K 显示器 27', '高清摄像头 C2', '移动电源 20K', '降噪耳麦 H1'];
const CATS = [
  { name: '数码', value: 4200, group: '电子' },
  { name: '家电', value: 3100, group: '电子' },
  { name: '服饰', value: 2600, group: '生活' },
  { name: '美妆', value: 1900, group: '生活' },
  { name: '食品', value: 1500, group: '生鲜' },
  { name: '生鲜', value: 900, group: '生鲜' },
  { name: '图书', value: 600, group: '文化' },
];
type RefreshKey = 'off' | '1s' | '2.5s' | '5s';
const REFRESH_MS: Record<RefreshKey, number> = { off: 0, '1s': 1000, '2.5s': 2500, '5s': 5000 };

/** 确定性伪随机（同种子重排一致，换种子全量重排） */
function makeRng(seed: number): () => number {
  let s = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (): number => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
/** 有界随机游走：围绕 mid 摆动、被 lo/hi 夹取，演化实时业务量 */
function walk(prev: number, mid: number, swing: number, lo: number, hi: number, rnd: () => number): number {
  const pull = (mid - prev) * 0.15;
  return clamp(Math.round(prev + pull + (rnd() - 0.5) * 2 * swing), lo, hi);
}
function hhmmss(d: Date): string {
  return d.toTimeString().slice(0, 8);
}

/** 静态图卡位图缓存标：直接打在 Card 根（CardBase 已自带 overflow:'hidden'，且无 shadowColor/transform/zIndex 浮层，
 *  满足 canCache 全部前置）。切勿再套无尺寸的 overflow:hidden 壳——那会让 flexShrink 把整条固定高列链挤成 0。
 *  仅静态区打此标；滚动/live 区不打。配合 useMemo([seed]) 冻结元素引用使 Card props 跨 tick 恒定 → epoch 不涨 → 位图命中。 */
const CARD_CACHE = { cacheAsBitmap: true } as const;

/** 滚动实时流：GMV/订单/延迟/QPS 各 ROLL_N 点，每拍 shift+push */
interface Rolling {
  gmv: number[];
  orders: number[];
  latency: number[];
  qps: number[];
}
function initRolling(rnd: () => number): Rolling {
  const gmv: number[] = [];
  const orders: number[] = [];
  const latency: number[] = [];
  const qps: number[] = [];
  let g = 42000, o = 720, l = 180, q = 1200;
  for (let i = 0; i < ROLL_N; i++) {
    g = walk(g, 46000, 5200, 20000, 90000, rnd);
    o = walk(o, 760, 120, 200, 1600, rnd);
    l = walk(l, 180, 45, 60, 400, rnd);
    q = walk(q, 1250, 220, 400, 2600, rnd);
    gmv.push(g); orders.push(o); latency.push(l); qps.push(q);
  }
  return { gmv, orders, latency, qps };
}
function toSeries(vals: number[], type: string, labels: string[]): Record<string, any>[] {
  return vals.map((v, i): Record<string, any> => ({ x: labels[i], value: v, type }));
}

// ---- 静态分布数据（随 seed 重排） ----
function genStacked(rnd: () => number): Record<string, any>[] {
  const out: Record<string, any>[] = [];
  for (const q of QUARTERS) for (const r of REGIONS) out.push({ quarter: q, region: r, value: Math.round(140 + rnd() * 300) });
  return out;
}
function genFunnel(rnd: () => number): Record<string, any>[] {
  const stages = ['曝光', '点击', '加购', '下单', '支付'];
  let v = 100000;
  return stages.map((stage): Record<string, any> => {
    const cur = v;
    v = Math.round(v * (0.42 + rnd() * 0.18));
    return { stage, value: cur };
  });
}
function genScatter(rnd: () => number): Record<string, any>[] {
  const groups = ['新客', '成长', '成熟', '沉睡'];
  const out: Record<string, any>[] = [];
  for (let i = 0; i < 64; i++) {
    const g = i % groups.length;
    out.push({ x: Math.round(1 + rnd() * 30), y: Math.round(50 + rnd() * 4000 + g * 300), size: Math.round(50 + rnd() * 900), type: groups[g] });
  }
  return out;
}
function genWaterfall(rnd: () => number): Record<string, any>[] {
  const out: Record<string, any>[] = [
    { label: '期初', value: Math.round(3200 + rnd() * 600), total: true },
    { label: '搜索', value: Math.round(600 + rnd() * 500) },
    { label: '直接', value: Math.round(300 + rnd() * 400) },
    { label: '社交', value: Math.round(400 + rnd() * 500) },
    { label: '联盟', value: -Math.round(100 + rnd() * 200) },
    { label: '退款', value: -Math.round(200 + rnd() * 250) },
    { label: '期末', value: 0, total: true },
  ];
  let cum = out[0].value;
  for (let i = 1; i < out.length - 1; i++) cum += out[i].value;
  out[out.length - 1].value = cum;
  return out;
}
function genHeat(rnd: () => number): Record<string, any>[] {
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const hours = ['0点', '4点', '8点', '12点', '16点', '20点'];
  const out: Record<string, any>[] = [];
  for (const y of days) for (const x of hours) {
    const base = x === '12点' || x === '16点' || x === '20点' ? 60 : 20;
    out.push({ x, y, value: Math.round(base + rnd() * 60) });
  }
  return out;
}
function genRose(rnd: () => number): Record<string, any>[] {
  const buckets = ['凌晨', '早晨', '上午', '中午', '下午', '傍晚', '夜间'];
  return buckets.map((type): Record<string, any> => ({ type, value: Math.round(120 + rnd() * 480) }));
}
function genRadar(rnd: () => number): Record<string, any>[] {
  const dims = ['拉新', '转化', '复购', '客单', '满意', '留存'];
  const out: Record<string, any>[] = [];
  for (const t of ['华东', '华南']) for (const d of dims) out.push({ dim: d, value: Math.round(40 + rnd() * 58), type: t });
  return out;
}
function genRadial(rnd: () => number): Record<string, any>[] {
  return [
    { name: '服务器', value: Math.round(55 + rnd() * 40) },
    { name: '磁盘', value: Math.round(40 + rnd() * 45) },
    { name: '带宽', value: Math.round(30 + rnd() * 55) },
    { name: 'CPU', value: Math.round(50 + rnd() * 45) },
  ];
}
function genContrib(seed: number): Record<string, any>[] {
  const rnd = makeRng(seed * 7 + 20260101);
  const out: Record<string, any>[] = [];
  const start = Date.UTC(2026, 0, 1);
  for (let i = 0; i < 270; i++) {
    const ms = start + i * 86400000;
    const wd = new Date(ms).getUTCDay();
    const r = rnd();
    let v = 0;
    if (wd === 0 || wd === 6) { if (r > 0.45) v = Math.floor(rnd() * 6); }
    else if (r > 0.12) v = 1 + Math.floor(rnd() * 12);
    if (rnd() > 0.9) v = 0;
    const d = new Date(ms);
    out.push({ date: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`, value: v });
  }
  return out;
}

interface OrderRow {
  id: number;
  no: string;
  product: string;
  channel: string;
  amount: number;
  status: string;
}
interface AlertItem {
  key: string;
  color: string;
  label: string;
  text: string;
}

function genOrders(seed: number, n: number): OrderRow[] {
  const rnd = makeRng(seed * 131 + 9999);
  const st = ['成功', '成功', '成功', '待支付', '风控'];
  const out: OrderRow[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      id: i,
      no: 'SN' + String(880000 + Math.floor(rnd() * 9999)),
      product: PRODUCTS[Math.floor(rnd() * PRODUCTS.length)],
      channel: CHANNELS[Math.floor(rnd() * CHANNELS.length)],
      amount: Math.round(60 + rnd() * 5000),
      status: st[Math.floor(rnd() * st.length)],
    });
  }
  return out;
}

/** 看板主体：依赖 tick 演化实时量、依赖 seed 重排静态分布（key=seed → 换种子重挂载重播入场动画） */
function OpsBody(props: { tick: number; seed: number; rolling: Rolling; orders: OrderRow[]; alerts: AlertItem[] }): React.ReactElement {
  const { tick, seed, rolling, orders, alerts } = props;
  const { token } = useToken();
  const rnd = makeRng(seed + tick * 17);

  // 时间轴标签：末位为“现在”，向前每秒回推
  const now = Date.now();
  const labels: string[] = [];
  for (let i = ROLL_N - 1; i >= 0; i--) labels.push(hhmmss(new Date(now - i * 1000)));

  // ---- KPI（最新滚动值 + 本拍增量 + 迷你走势） ----
  const lastGmv = rolling.gmv[ROLL_N - 1];
  const lastOrders = rolling.orders[ROLL_N - 1];
  const successRate = rolling.latency[ROLL_N - 1] > 320 ? 94.2 : 99.1 - (rolling.latency[ROLL_N - 1] % 30) / 10;
  const activeUsers = Math.round(rolling.qps[ROLL_N - 1] * 0.6) + tick * 5;
  const riskBlocked = 40 + (tick % 5) * 11 + Math.round(rnd() * 8);
  const kpis: StatCardProps[] = [
    { title: '实时成交额', value: lastGmv + tick * 120, prefix: '¥ ', trend: { direction: 'up', value: '12.4%' }, spark: rolling.gmv.slice(-12) },
    { title: '成交订单', value: lastOrders + tick, trend: { direction: 'up', value: '6.1%' }, spark: rolling.orders.slice(-12) },
    { title: '支付成功率', value: successRate, precision: 2, suffix: '%', trend: { direction: successRate >= 97 ? 'up' : 'down', value: '0.6%' }, spark: rolling.latency.slice(-12).map((v): number => 100 - v / 12) },
    { title: '在线用户', value: activeUsers, tag: '实时', trend: { direction: 'up', value: '3.2%' }, spark: rolling.qps.slice(-12) },
    { title: '风控拦截', value: riskBlocked, trend: { direction: 'down', value: '1.1%' }, spark: rolling.orders.slice(-12).map((v): number => Math.round(v * 0.06)) },
  ];

  // ---- 静态分布图（只随 seed 变、不随 tick 变）：整段 JSX 冻结在 useMemo 里 ----
  // tick 期 OpsBody 会重渲染；若这些数据数组/图元素每拍新建，会逐拍重传 props → 推高子树 epoch
  // → cacheAsBitmap 每拍重烘（白打）。useMemo([seed]) 令静态图元素引用跨 tick 恒定 → React 跳过其
  // reconciliation → 节点不动、epoch 不涨 → 位图命中；配合 cacheAsBitmap 把该子树每帧绘制 op 塌成一次 drawImage（paint 段与 data() 光栅同降）。
  const staticRows = React.useMemo<React.ReactElement>(() => {
    const stacked = genStacked(makeRng(seed + 1));
    const source = CHANNELS.map((type): Record<string, any> => ({ type, value: Math.round(300 + makeRng(seed + 2)() * 900) }));
    const comboData = QUARTERS.map((x): Record<string, any> => {
      const r = makeRng(seed + x.charCodeAt(1));
      return { x, volume: Math.round(600 + r() * 900), price: Math.round(180 + r() * 220) };
    });
    const prodrnd = makeRng(seed + 5);
    const topProducts = PRODUCTS.map((name): Record<string, any> => ({ name, value: Math.round(1200 + prodrnd() * 8600) }))
      .sort((a, b): number => b.value - a.value).slice(0, 6);
    const funnel = genFunnel(makeRng(seed + 6));
    const radar = genRadar(makeRng(seed + 7));
    const rose = genRose(makeRng(seed + 8));
    const scatter = genScatter(makeRng(seed + 9));
    const waterfall = genWaterfall(makeRng(seed + 10));
    const heat = genHeat(makeRng(seed + 11));
    const treemap = CATS.map((c): Record<string, any> => ({ ...c, value: Math.round(c.value * (0.7 + makeRng(seed + c.name.length)() * 0.6)) }));
    return (
      <>
        {/* 渠道堆叠 / 构成 / 组合 */}
        <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
          <Card title="渠道 × 地区成交额" style={{ flex: 2, ...CARD_CACHE }} extra={<Tag>堆叠</Tag>}>
            <ColumnChart data={stacked} xField="quarter" yField="value" seriesField="region" stack maxColumnWidth={48} height={230} animation={false} />
          </Card>
          <Card title="订单渠道构成" style={{ flex: 1, ...CARD_CACHE }}>
            <PieChart data={source} angleField="value" colorField="type" size={160} innerRadius={0.55} centerTitle="总订单" />
          </Card>
          <Card title="成交量 · 客单价" style={{ flex: 2, ...CARD_CACHE }}>
            <ComboChart data={comboData} xField="x" barField="volume" lineField="price" height={230} animation={false} />
          </Card>
        </View>
        {/* 热销榜 / 漏斗 / 雷达 / 玫瑰 */}
        <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
          <Card title="热销商品 Top6" size="small" style={{ flex: 2, ...CARD_CACHE }}>
            <BarChart data={topProducts} xField="name" yField="value" height={240} animation={false} legend={false} maxBarWidth={22} />
          </Card>
          <Card title="转化漏斗" size="small" style={{ flex: 2, ...CARD_CACHE }}>
            <FunnelChart data={funnel} xField="stage" yField="value" animation={false} />
          </Card>
          <Card title="区域能力雷达" size="small" style={{ flex: 1, ...CARD_CACHE }}>
            <RadarChart data={radar} xField="dim" yField="value" seriesField="type" size={200} levels={4} animation={false} />
          </Card>
          <Card title="时段热度" size="small" style={{ flex: 1, ...CARD_CACHE }}>
            <RoseChart data={rose} xField="type" yField="value" size={200} roseType="area" legend={false} animation={false} />
          </Card>
        </View>
        {/* 气泡 / 瀑布 / 热力 / 矩形树 */}
        <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
          <Card title="用户价值分布 (RFM)" size="small" style={{ flex: 2, ...CARD_CACHE }}>
            <ScatterChart data={scatter} xField="x" yField="y" seriesField="type" sizeField="size" sizeRange={[5, 24]} height={240} animation={false} />
          </Card>
          <Card title="收入增减瀑布" size="small" style={{ flex: 2, ...CARD_CACHE }}>
            <WaterfallChart data={waterfall} xField="label" yField="value" totalField="total" height={240} animation={false} />
          </Card>
          <Card title="类目成交占比" size="small" style={{ flex: 2, ...CARD_CACHE }}>
            <TreemapChart data={treemap} nameField="name" valueField="value" colorField="group" height={240} animation={false} />
          </Card>
          <Card title="活跃热力矩阵" size="small" style={{ flex: 2, ...CARD_CACHE }}>
            <HeatmapChart data={heat} xField="x" yField="y" valueField="value" height={240} showValue={false} animation={false} />
          </Card>
        </View>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const staticBottom = React.useMemo<React.ReactElement>(() => {
    const radial = genRadial(makeRng(seed + 12));
    const contrib = genContrib(seed);
    return (
      <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
        <Card title="资源占用率" style={{ flex: 1, ...CARD_CACHE }}>
          <RadialBarChart data={radial} nameField="name" valueField="value" max={100} centerTitle="资源" size={170} />
        </Card>
        <Card title="发布活跃度" style={{ flex: 3, ...CARD_CACHE }} extra={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>近 9 个月</Text>}>
          <CalendarHeatmapChart data={contrib} color="#2EA043" cellSize={11} cellGap={3} startOfWeek={1} levels={5} weekdayNames={['日', '一', '二', '三', '四', '五', '六']} />
        </Card>
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const orderCols: ProColumn<OrderRow>[] = [
    { title: '订单号', dataIndex: 'no', key: 'no', width: 110 },
    { title: '商品', dataIndex: 'product', key: 'product', width: 150, search: true },
    { title: '渠道', dataIndex: 'channel', key: 'channel', width: 90 },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 100, sorter: (a, b) => a.amount - b.amount, render: (v: number) => <Text>¥ {v.toLocaleString()}</Text> },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => <Tag color={v === '成功' ? 'success' : v === '风控' ? 'error' : 'warning'}>{v}</Tag>,
    },
  ];

  return (
    <View style={{ gap: token.marginLG }}>
      <View style={{ gap: token.margin }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>实时核心指标</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>更新于 {hhmmss(new Date())}</Text>
        </View>
        <StatisticGroup items={kpis} />
      </View>

      <Divider />

      {/* 滚动走势 + 成功率（每卡一图） */}
      <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
        <Card title="成交额滚动走势" style={{ flex: 3 }} extra={<Tag color="processing">实时滚动</Tag>}>
          <AreaChart data={toSeries(rolling.gmv, '成交额', labels)} xField="x" yField="value" seriesField="type" smooth gradient animation={false} height={220} legend={false} />
        </Card>
        <Card title="支付成功率" style={{ flex: 2 }}>
          <View style={{ alignItems: 'center' }}>
            <GaugeChart value={successRate} max={100} size={200} title="成功率" color={token.colorSuccess} formatter={(v): string => v.toFixed(1) + '%'} animation={false} />
          </View>
        </Card>
      </View>
      <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
        <Card title="订单数滚动走势" style={{ flex: 3 }}>
          <LineChart data={toSeries(rolling.orders, '订单数', labels)} xField="x" yField="value" seriesField="type" animation={false} height={180} color={[token.colorWarning]} legend={false} />
        </Card>
        <Card title="实时 QPS / 平均延迟" style={{ flex: 2 }}>
          <LineChart data={[...toSeries(rolling.qps, 'QPS', labels), ...toSeries(rolling.latency, '延迟ms', labels)]} xField="x" yField="value" seriesField="type" animation={false} height={180} legend={false} point={false} />
        </Card>
      </View>

      {staticRows}

      <Divider />

      {/* 实时订单流水 + 风控告警 */}
      <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
        <Card title="实时订单流水" size="small" style={{ flex: 3 }} extra={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>每拍前插新单</Text>}>
          <ProTable<OrderRow>
            columns={orderCols}
            dataSource={orders}
            rowKey={(r) => r.id}
            pageSize={5}
            striped
            filterFields={[{ name: 'channel', label: '渠道', type: 'select', options: CHANNELS.map((c) => ({ label: c, value: c })), width: 120 }]}
          />
        </Card>
        <Card title="风控告警动态" size="small" style={{ flex: 2 }}>
          <Timeline
            pending="监控中…"
            items={alerts.map((e) => ({
              key: e.key,
              color: e.color,
              label: e.label,
              children: <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{e.text}</Text>,
            }))}
          />
        </Card>
      </View>

      {staticBottom}
    </View>
  );
}

export function HeavyChartsDemo(): React.ReactElement {
  const { token } = useToken();
  const isGpu = process.env.FLUX_GPU === '1';
  const [refreshKey, setRefreshKey] = React.useState<RefreshKey>('2.5s');
  const [auto, setAuto] = React.useState(true);
  const [seed, setSeed] = React.useState(11);
  const [tick, setTick] = React.useState(0);
  const [rolling, setRolling] = React.useState<Rolling>(() => initRolling(makeRng(11)));
  const [orders, setOrders] = React.useState<OrderRow[]>(() => genOrders(11, 12));
  const [alerts, setAlerts] = React.useState<AlertItem[]>(() => [
    { key: 'a0', color: 'green', label: '开屏', text: '监控大屏已就绪，实时数据流接入' },
    { key: 'a1', color: 'blue', label: '系统', text: '「搜索」渠道流量激增 32%' },
    { key: 'a2', color: 'red', label: '风控', text: '检测到异常下单频次，已限流 1 账户' },
  ]);

  const running = auto && refreshKey !== 'off';

  // 每拍：滚动时序缓冲 + 前插订单 + 追加告警 + tick++（驱动 KPI 增量）
  React.useEffect(() => {
    if (!running) return;
    const ms = REFRESH_MS[refreshKey];
    const t = setInterval(() => {
      const rnd = makeRng(Date.now() % 100000 + tick);
      setRolling((r): Rolling => ({
        gmv: [...r.gmv.slice(1), walk(r.gmv[r.gmv.length - 1], 46000, 5200, 20000, 90000, rnd)],
        orders: [...r.orders.slice(1), walk(r.orders[r.orders.length - 1], 760, 120, 200, 1600, rnd)],
        latency: [...r.latency.slice(1), walk(r.latency[r.latency.length - 1], 180, 45, 60, 400, rnd)],
        qps: [...r.qps.slice(1), walk(r.qps[r.qps.length - 1], 1250, 220, 400, 2600, rnd)],
      }));
      setTick((x) => x + 1);
      const st = ['成功', '成功', '成功', '待支付', '风控'];
      const st1 = st[Math.floor(rnd() * st.length)];
      setOrders((prev) => [{
        id: Date.now() + Math.floor(rnd() * 1000),
        no: 'SN' + String(880000 + Math.floor(rnd() * 9999)),
        product: PRODUCTS[Math.floor(rnd() * PRODUCTS.length)],
        channel: CHANNELS[Math.floor(rnd() * CHANNELS.length)],
        amount: Math.round(60 + rnd() * 5000),
        status: st1,
      }, ...prev].slice(0, 14));
      if (st1 === '风控' || rnd() > 0.6) {
        const now = hhmmss(new Date());
        const msgs = [
          '「' + CHANNELS[Math.floor(rnd() * CHANNELS.length)] + '」渠道成交额创新高',
          '平均延迟升至 ' + Math.round(120 + rnd() * 240) + 'ms，触发预警',
          '风控拦截可疑交易 ' + Math.round(1 + rnd() * 6) + ' 笔',
          '在线峰值突破 ' + Math.round(1300 + rnd() * 900) + ' QPS',
        ];
        const c = rnd() > 0.7 ? 'red' : rnd() > 0.4 ? 'blue' : 'green';
        setAlerts((prev) => [{ key: 'a' + Date.now(), color: c, label: now, text: msgs[Math.floor(rnd() * msgs.length)] }, ...prev].slice(0, 6));
      }
    }, ms);
    return () => clearInterval(t);
  }, [running, refreshKey, tick]);

  const doRefresh = (): void => {
    const ns = seed + 1;
    setSeed(ns);
    setTick(0);
    setRolling(initRolling(makeRng(ns)));
    setOrders(genOrders(ns, 12));
  };

  return (
    <View style={{ gap: token.marginLG }}>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: token.margin,
          padding: token.padding,
          borderRadius: token.borderRadiusLG,
          backgroundColor: token.colorBgContainer,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexShrink: 0 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: running ? token.colorSuccess : token.colorTextTertiary }} />
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorText }}>实时运营监控大屏</Text>
          <Tag color="processing">组合示例</Tag>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexShrink: 0 }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: token.borderRadius, backgroundColor: isGpu ? token.colorSuccessBg : token.colorPrimaryBg }}>
            <Text style={{ fontSize: token.fontSizeSM, fontWeight: '700' }}>
              {isGpu ? 'GPU 直呈' : 'CPU 光栅'}
            </Text>
          </View>
          <FpsMonitor showChart maxPoints={30} intervalMs={500} label="帧率" good={50} warn={28} />
        </View>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, flexShrink: 0 }}>刷新频率</Text>
        <Segmented
          value={refreshKey}
          onChange={(v) => { setRefreshKey(v as RefreshKey); setTick(0); }}
          options={[
            { label: '关', value: 'off' },
            { label: '1s', value: '1s' },
            { label: '2.5s', value: '2.5s' },
            { label: '5s', value: '5s' },
          ]}
          style={{ alignSelf: 'center', flexShrink: 0 }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS, flexShrink: 0 }}>
          <Switch checked={auto} onChange={setAuto} size="small" />
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>自动</Text>
        </View>
        <View style={{ flexShrink: 0 }}>
          <Button size="small" onClick={doRefresh}>刷新大盘</Button>
        </View>
      </View>
      <OpsBody key={seed} tick={tick} seed={seed} rolling={rolling} orders={orders} alerts={alerts} />
    </View>
  );
}

export default HeavyChartsDemo;
