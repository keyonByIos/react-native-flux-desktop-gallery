// DASHBOARD：深蓝科技风「数据可视化大屏」案例页——不新增任何原子件，纯用既有组件拼一张监控指挥大屏。
// 版式对标两张大屏参考图：顶部标题条（实时时钟 + 状态标签）→ KPI 大数字栏 → 三栏面板栅格：
//   左（设备接入仪表 + 分区柱 + 在线趋势面积）｜中（区域告警散点分布 + 告警明细表）｜右（流量构成环 + 工单分组柱 + 能耗雷达 + 实时告警时间线）。
// 用到的组件：GaugeChart / Progress / ColumnChart / AreaChart / ScatterChart / PieChart / RadarChart / Table / Timeline / Tag / Segmented / Switch / ChartExportButton。
// 交互：时间范围切换（换数据重播入场动画）、自动刷新（每 2.5s tick 微采样 KPI/走势）、实时时钟每秒走字、整屏快照导出 PNG。
// 整洁约束：间距/字号走固定大屏配色常量（深底不随明暗主题变，保证「大屏」观感一致）；同排 KPI/面板等高用 row + alignItems:stretch；wrap 行内不用 flex:1。
import React from 'react';
import {
  View, Text, Tag, Button, Switch, Segmented, useToken, fade,
  GaugeChart, Progress, ColumnChart, AreaChart, ScatterChart, PieChart, RadarChart,
  Table, type TableColumn,
  Timeline, ChartExportButton,
} from 'react-native-flux-desktop';

/* ────────────────────────── 大屏配色（固定深底，不随主题） ────────────────────────── */
const BG = '#050f2b';
const PANEL = '#0a1e48';
const BORDER = '#17376f';
const CYAN = '#2fd8ff';
const BLUE = '#3f7bff';
const PURPLE = '#9d6bff';
const GREEN = '#2ee6a8';
const ORANGE = '#ffb020';
const RED = '#ff5f6d';
const PINK = '#ff5f87';
const TXT = '#cfe3ff';
const SUB = '#7f9fd0';
const PALETTE = [CYAN, BLUE, PURPLE, GREEN, ORANGE, PINK];

/** 确定性伪随机（同种子一致，换种子全量重排） */
function makeRng(seed: number): () => number {
  let s = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (): number => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const REGIONS = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山', '通州区', '大兴区'];
const HOURS = ['00', '03', '06', '09', '12', '15', '18', '21'];
const ORDER_TYPES = ['入机房流程', '入局流程', '公共区域流程', '作废流程'];
const ORDER_STATUS = ['已处理', '未处理', '未到期', '已到期'];
const RADAR_AXES = ['算力', '存储', '带宽', '并发', '能耗', '稳定性'];

type RangeKey = '1h' | '24h' | '7d';
const RANGE_LABEL: Record<RangeKey, string> = { '1h': '近 1 小时', '24h': '近 24 小时', '7d': '近 7 天' };
const RANGE_FACTOR: Record<RangeKey, number> = { '1h': 1, '24h': 18, '7d': 120 };

interface Alarm { id: number; region: string; type: string; time: string; status: '未处理' | '处理中' | '已处理' }
interface DoorLog { id: number; room: string; kind: string; result: '成功' | '人证不匹配'; time: string }

/* ────────────────────────── 面板壳 / KPI 壳 ────────────────────────── */

function Panel(props: { title: string; extra?: React.ReactNode; children: React.ReactNode; style?: any }): React.ReactElement {
  return (
    <View style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, gap: 10, ...props.style }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: CYAN }} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: TXT }}>{props.title}</Text>
        <View style={{ flex: 1 }} />
        {props.extra}
      </View>
      {props.children}
    </View>
  );
}

function Kpi(props: { label: string; value: string; unit?: string; color?: string; bar: number }): React.ReactElement {
  const c = props.color ?? CYAN;
  return (
    <View style={{ flex: 1, minWidth: 0, backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, gap: 6 }}>
      <Text style={{ fontSize: 12, color: SUB }}>{props.label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: c }}>{props.value}</Text>
        {props.unit ? <Text style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{props.unit}</Text> : null}
      </View>
      <View style={{ height: 3, borderRadius: 2, backgroundColor: fade(c, 0.16) }}>
        <View style={{ height: 3, borderRadius: 2, width: `${Math.round(props.bar * 100)}%`, backgroundColor: c }} />
      </View>
    </View>
  );
}

function RingStat(props: { label: string; value: number; percent: number; color: string }): React.ReactElement {
  return (
    <View style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 6 }}>
      <Progress type="circle" percent={props.percent} width={64} strokeWidth={6} strokeColor={props.color} trailColor={fade('#ffffff', 0.08)} showInfo={false} />
      <Text style={{ fontSize: 15, fontWeight: '700', color: props.color }}>{props.value.toLocaleString()}</Text>
      <Text style={{ fontSize: 11, color: SUB }}>{props.label}</Text>
    </View>
  );
}

/* ────────────────────────── 大屏主体 ────────────────────────── */

function ScreenBody(props: { range: RangeKey; seed: number; tick: number; clock: string }): React.ReactElement {
  const { range, seed, tick, clock } = props;
  const screenRef = React.useRef<any>(null);
  const f = RANGE_FACTOR[range];
  const rnd = makeRng(seed + (range === '1h' ? 1 : range === '24h' ? 2 : 3));

  // KPI（叠加 tick 制造实时跳动感）
  const cameras = Math.round(2513 * (0.9 + rnd() * 0.2));
  const doors = Math.round(1754 * (0.9 + rnd() * 0.2));
  const alarms = Math.round(9513 * f / 18 + tick * 3);
  const entries = Math.round(631437 * f / 18 + tick * 21);
  const online = Math.round(4826 * (0.9 + rnd() * 0.15)) + tick;

  // 设备接入仪表 + 三环
  const accessRate = 52 + Math.round(rnd() * 12);
  const total = 4826; const inCount = 2712 + tick; const outCount = total - inCount;

  // 分区接入量（分组柱：实际 / 未接入）
  const regionData: Record<string, any>[] = [];
  for (const r of REGIONS) {
    regionData.push({ x: r, value: Math.round(800 + rnd() * 2200), type: '实际接入' });
    regionData.push({ x: r, value: Math.round(200 + rnd() * 900), type: '未接入' });
  }

  // 在线趋势（面积双序列）
  const trend: Record<string, any>[] = [];
  HOURS.forEach((h, i) => {
    const jitter = 1 + (i % 3) * 0.2 + rnd() * 0.3;
    trend.push({ x: `${h}:00`, value: Math.round(2600 * jitter) + (i >= HOURS.length - 2 ? tick * 40 : 0), type: '在线' });
    trend.push({ x: `${h}:00`, value: Math.round(900 * jitter), type: '离线' });
  });

  // 区域告警散点分布（伪造地图散点）
  const scatter: Record<string, any>[] = [];
  for (let i = 0; i < 46; i++) {
    scatter.push({ x: Math.round(rnd() * 100), y: Math.round(rnd() * 100), type: rnd() > 0.35 ? '设备在线' : '设备离线' });
  }

  // 告警明细表
  const alarmTypes = ['穿越警戒线', '区域入侵', '人脸未匹配', '设备离线', '尾随检测'];
  const statuses: Alarm['status'][] = ['未处理', '处理中', '已处理'];
  const alarmRows: Alarm[] = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    region: `${REGIONS[(i * 3 + seed) % REGIONS.length]}围堵3防区`,
    type: alarmTypes[(i + seed) % alarmTypes.length],
    time: `09-${String(20 + (i % 9)).padStart(2, '0')} 11:${String(20 + i).padStart(2, '0')}:43`,
    status: statuses[(i * 2 + seed) % statuses.length],
  }));

  // 流量构成（环形饼）
  const source: Record<string, any>[] = ['门禁通行', '视频告警', '人脸核验', '梯控', '访客机'].map((type) => ({ type, value: Math.round(300 + rnd() * 900) }));

  // 工单类型统计（分组柱）
  const orders: Record<string, any>[] = [];
  for (const t of ORDER_TYPES) for (const s of ORDER_STATUS) orders.push({ x: t, value: Math.round(20 + rnd() * 260), type: s });

  // 能耗雷达（本期 / 同期）
  const radar: Record<string, any>[] = [];
  for (const a of RADAR_AXES) {
    radar.push({ x: a, value: Math.round(50 + rnd() * 50), type: '本期' });
    radar.push({ x: a, value: Math.round(40 + rnd() * 50), type: '同期' });
  }

  // 实时告警时间线
  const events = [
    { color: RED, label: '11:23:43', text: '南门西侧围堵3防区 触发穿越警戒线' },
    { color: ORANGE, label: '11:21:07', text: '通州区 设备离线，最后心跳 5 分钟前' },
    { color: CYAN, label: '11:18:52', text: '安外局公共区域 开门认证成功' },
    { color: GREEN, label: '11:12:30', text: '海淀区 分区接入量恢复至 96%' },
    { color: BLUE, label: '11:05:11', text: '长话大楼 人证不匹配告警已处理' },
  ];

  const statusColor: Record<Alarm['status'], string> = { 未处理: RED, 处理中: ORANGE, 已处理: GREEN };
  const alarmCols: TableColumn<Alarm>[] = [
    { title: '序号', dataIndex: 'id', key: 'id', width: 52, render: (v: number) => <Text style={{ color: SUB }}>{v}</Text> },
    { title: '告警区域', dataIndex: 'region', key: 'region', render: (v: string) => <Text style={{ color: TXT }}>{v}</Text> },
    { title: '告警类型', dataIndex: 'type', key: 'type', width: 110, render: (v: string) => <Text style={{ color: TXT }}>{v}</Text> },
    { title: '告警时间', dataIndex: 'time', key: 'time', width: 130, render: (v: string) => <Text style={{ color: SUB }}>{v}</Text> },
    { title: '处理状态', dataIndex: 'status', key: 'status', width: 90, render: (v: Alarm['status']) => <Text style={{ color: statusColor[v] }}>● {v}</Text> },
  ];

  const gapCol = { gap: 12 };
  return (
    <View ref={screenRef} style={{ backgroundColor: BG, borderRadius: 10, padding: 16, gap: 14 }}>
      {/* ── 顶部标题条 ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: CYAN }} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>城市运行监测中心 · 数据大屏</Text>
        <Tag bordered={false} color="purple" style={{ marginRight: 0 }}>组合示例</Tag>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: 13, color: SUB }}>{RANGE_LABEL[range]}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: CYAN }}>{clock}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN }} />
          <Text style={{ fontSize: 12, color: GREEN }}>系统正常</Text>
        </View>
        <ChartExportButton target={screenRef} filename="dashboard-screen.png" title="导出大屏快照" style={{ width: 'auto', flexShrink: 0 }} />
      </View>

      {/* ── KPI 大数字栏（同排等高：row + stretch） ── */}
      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 12 }}>
        <Kpi label="摄像头总数" value={cameras.toLocaleString()} unit="路" color={CYAN} bar={0.82} />
        <Kpi label="门禁总数" value={doors.toLocaleString()} unit="个" color={BLUE} bar={0.64} />
        <Kpi label="告警总数" value={alarms.toLocaleString()} unit="条" color={ORANGE} bar={0.47} />
        <Kpi label="出入总数" value={entries.toLocaleString()} unit="次" color={PURPLE} bar={0.9} />
        <Kpi label="在线设备" value={online.toLocaleString()} unit="台" color={GREEN} bar={0.73} />
      </View>

      {/* ── 三栏栅格（各栏纵向堆叠，栏间 flex-start 允许自然高度差） ── */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        {/* 左栏 */}
        <View style={{ flex: 1, minWidth: 0, ...gapCol }}>
          <Panel title="设备接入量" extra={<Text style={{ fontSize: 11, color: SUB }}>实时</Text>}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <GaugeChart value={accessRate} max={100} size={120} color={CYAN} title="接入比例" formatter={(v) => `${v}%`} />
              <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', gap: 6 }}>
                <RingStat label="设备总量" value={total} percent={100} color={BLUE} />
                <RingStat label="接入量" value={inCount} percent={Math.round((inCount / total) * 100)} color={GREEN} />
                <RingStat label="未接入" value={outCount} percent={Math.round((outCount / total) * 100)} color={ORANGE} />
              </View>
            </View>
          </Panel>
          <Panel title="分区接入量">
            <ColumnChart data={regionData} xField="x" yField="value" seriesField="type" color={[CYAN, ORANGE]} maxColumnWidth={16} height={190} legend tooltip grid={{ color: fade('#ffffff', 0.08) }} />
          </Panel>
          <Panel title="在线趋势">
            <AreaChart data={trend} xField="x" yField="value" seriesField="type" color={[CYAN, PURPLE]} smooth gradient height={160} legend grid={{ color: fade('#ffffff', 0.08) }} />
          </Panel>
        </View>

        {/* 中栏 */}
        <View style={{ flex: 1.5, minWidth: 0, ...gapCol }}>
          <Panel title="区域告警分布" extra={<Text style={{ fontSize: 11, color: SUB }}>{scatter.length} 个监测点</Text>}>
            <ScatterChart data={scatter} xField="x" yField="y" seriesField="type" color={[GREEN, RED]} size={7} height={300} legend grid={{ color: fade('#ffffff', 0.06) }} />
          </Panel>
          <Panel title="告警列表" extra={<Text style={{ fontSize: 11, color: CYAN }}>查看全部 ›</Text>}>
            <Table<Alarm> columns={alarmCols} dataSource={alarmRows} rowKey={(r) => r.id} size="small" />
          </Panel>
        </View>

        {/* 右栏 */}
        <View style={{ flex: 1, minWidth: 0, ...gapCol }}>
          <Panel title="流量构成">
            <PieChart data={source} angleField="value" colorField="type" color={PALETTE} size={150} innerRadius={0.62} centerTitle="总事件" legend />
          </Panel>
          <Panel title="工单类型统计">
            <ColumnChart data={orders} xField="x" yField="value" seriesField="type" color={PALETTE} maxColumnWidth={12} height={190} legend={false} grid={{ color: fade('#ffffff', 0.08) }} />
          </Panel>
          <Panel title="能耗指标">
            <RadarChart data={radar} xField="x" yField="value" seriesField="type" color={[CYAN, ORANGE]} size={150} levels={4} fill point legend />
          </Panel>
          <Panel title="实时告警">
            <Timeline
              items={events.map((e) => ({
                key: e.label,
                color: e.color,
                label: e.label,
                children: <Text style={{ fontSize: 12, color: TXT }}>{e.text}</Text>,
              }))}
            />
          </Panel>
        </View>
      </View>
    </View>
  );
}

/* ────────────────────────── 外壳（控制条 + 时钟 + 自动刷新） ────────────────────────── */

export function DashboardDemo(): React.ReactElement {
  const { token } = useToken();
  const [range, setRange] = React.useState<RangeKey>('24h');
  const [seed, setSeed] = React.useState(7);
  const [auto, setAuto] = React.useState(true);
  const [tick, setTick] = React.useState(0);
  const [clock, setClock] = React.useState(() => new Date().toLocaleTimeString('zh-CN', { hour12: false }));

  // 实时时钟：每秒走字
  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('zh-CN', { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  // 自动刷新：每 2.5s tick 一次，驱动 KPI/走势/散点微采样的 count-up 感
  React.useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setTick((x) => x + 1), 2500);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <View style={{ backgroundColor: BG, padding: 14, gap: 12 }}>
      {/* 控制条：铺在与大屏同色的深蓝底上，文字改用大屏配色常量（SUB/TXT），保证蓝底可读、整体一致 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <Text style={{ flex: 1, fontSize: 12, color: SUB }} numberOfLines={1}>
          深蓝科技风数据大屏：GaugeChart / Progress / Column / Area / Scatter / Pie / Radar / Table / Timeline 组合，零新增原子件
        </Text>
        <View style={{ flexShrink: 0 }}>
          <Segmented
            value={range}
            onChange={(v) => setRange(v as RangeKey)}
            options={[
              { label: '近 1 小时', value: '1h' },
              { label: '近 24 小时', value: '24h' },
              { label: '近 7 天', value: '7d' },
            ]}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexShrink: 0 }}>
          <Text style={{ fontSize: 12, color: TXT }}>自动刷新</Text>
          <Switch checked={auto} onChange={setAuto} size="small" />
        </View>
        <View style={{ flexShrink: 0 }}>
          <Button size="small" onClick={() => { setSeed((s) => s + 1); setTick(0); }}>重采样</Button>
        </View>
      </View>
      <ScreenBody key={`${range}-${seed}`} range={range} seed={seed} tick={tick} clock={clock} />
    </View>
  );
}

export default DashboardDemo;
