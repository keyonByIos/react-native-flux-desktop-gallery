// PerfDetails：性能详情独立窗口（从顶栏头像下拉「性能详情」点入）。
// 数据单一来源：systemStats.snapshot()（进程内存 / 图片解码缓存 / 逐窗渲染面 / 帧率 / 运行时长）
//   + systemStats.fpsSnapshot()（逐窗帧率）+ Application.config.getTheme()（当前主题参数）+ getMainWindowScale()（DPR）。
// 版式：全部即时模式自绘，刻意不用 Statistic/StatCard（大数值行高在本栈会塌陷致趋势行叠字），
//   改自绘 MetricTile，每段 Text 显式给 lineHeight；栅格用 flexDirection:row + flex 等分（本 Yoga 下 Row/Col 的 wrap 会丢画）。
// 刷新：默认 1s 轮询快照，可切频率 / 暂停 / 手动刷新；顶栏常驻 FpsMonitor 反映本窗实时帧率。
import React from 'react';
import { View, Text, Card, Tag, Button, Switch, Segmented, Progress, Descriptions, useToken, Application, systemStats, type SystemSnapshot, type WindowMemStat, type AliasToken } from 'react-native-flux-desktop';
import { FpsMonitor } from 'react-native-flux-desktop-dev';
import { openThemedWindow } from '../components/AppWindow';

type RefreshKey = 'off' | '1s' | '2s' | '5s';
const REFRESH_MS: Record<RefreshKey, number> = { off: 0, '1s': 1000, '2s': 2000, '5s': 5000 };
// 重采样（逐窗 getMemStats 会递归遍历整棵场景树）固定低频，与轻采样解耦，避免每秒遍历全树致主线程卡顿。
const HEAVY_MS = 5000;
const REFRESH_OPTIONS = [
  { label: '关', value: 'off' },
  { label: '1s', value: '1s' },
  { label: '2s', value: '2s' },
  { label: '5s', value: '5s' },
];

const hhmmss = (d: Date): string => d.toTimeString().slice(0, 8);
const mb = (n: number): string => (Number.isFinite(n) ? n.toFixed(1) : '0.0');
const pct = (a: number, b: number): number => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);

/** 帧率配色：≥good 绿、≥warn 黄、否则红；0（空闲）灰 */
function fpsColor(fps: number, token: AliasToken): string {
  if (fps <= 0) return token.colorTextTertiary;
  if (fps >= 50) return token.colorSuccess;
  if (fps >= 30) return token.colorWarning;
  return token.colorError;
}

/** 指标块：小标题 + 大数值 + 单位 + 可选占比条。显式 lineHeight 保证行高稳定不叠字。 */
const MetricTile = React.memo(function MetricTile(props: {
  label: string;
  value: string;
  unit?: string;
  ratio?: number;
  ratioText?: string;
  accent?: string;
}): React.ReactElement {
  const { token } = useToken();
  const { label, value, unit, ratio, ratioText, accent } = props;
  return (
    <View
      style={{
        flex: 1,
        padding: token.paddingSM,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorFillQuaternary,
        gap: token.marginXXS,
      }}
    >
      <Text style={{ fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.5), color: token.colorTextSecondary }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontSize: token.fontSizeXL, lineHeight: Math.round(token.fontSizeXL * 1.3), fontWeight: '600', color: accent ?? token.colorText }}>{value}</Text>
        {unit ? (
          <Text style={{ fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.9), color: token.colorTextTertiary, marginBottom: 3 }}>{unit}</Text>
        ) : null}
      </View>
      {ratio != null ? (
        <View style={{ gap: 2 }}>
          <Progress percent={ratio} showInfo={false} size="small" strokeColor={accent ?? token.colorPrimary} />
          {ratioText ? (
            <Text style={{ fontSize: 11, lineHeight: 15, color: token.colorTextTertiary }}>{ratioText}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

/** 区块标题（左竖条 + 文案 + 右侧插槽） */
function SectionTitle(props: { text: string; extra?: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
      <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: token.colorPrimary }} />
      <Text style={{ fontSize: token.fontSizeLG, lineHeight: Math.round(token.fontSizeLG * 1.4), fontWeight: '600', color: token.colorText }}>{props.text}</Text>
      <View style={{ flex: 1 }} />
      {props.extra}
    </View>
  );
}

/** 逐窗性能表：本 Yoga 下用 flex 等分列（勿用 Row/Col wrap），表头浅底、行间分隔线。 */
const WindowTable = React.memo(function WindowTable(props: { rows: WindowMemStat[] }): React.ReactElement {
  const { token } = useToken();
  const cols: { key: string; label: string; flex: number; align?: 'right' | 'left'; render: (w: WindowMemStat) => React.ReactNode }[] = [
    { key: 'title', label: '窗口', flex: 5, render: (w) => w.title },
    { key: 'size', label: '尺寸', flex: 4, render: (w) => `${w.w}×${w.h}` },
    { key: 'dpr', label: 'DPR', flex: 2, align: 'right', render: (w) => w.dpr.toFixed(2) },
    { key: 'faces', label: '面数', flex: 2, align: 'right', render: (w) => String(w.faces) },
    { key: 'nodes', label: '节点', flex: 3, align: 'right', render: (w) => w.nodes.toLocaleString() },
    { key: 'surface', label: '面内存', flex: 3, align: 'right', render: (w) => `${mb(w.surfaceMB)} MB` },
    { key: 'heap', label: '堆占比', flex: 3, align: 'right', render: (w) => `${mb(w.heapShareMB)} MB` },
  ];
  const cellText = (align?: 'right' | 'left') => ({
    fontSize: token.fontSizeSM,
    lineHeight: Math.round(token.fontSizeSM * 1.6),
    color: token.colorText,
    textAlign: (align === 'right' ? 'right' : 'left') as 'right' | 'left',
  });
  return (
    <View style={{ borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', gap: token.margin, padding: token.paddingSM, backgroundColor: token.colorFillTertiary }}>
        {cols.map((c) => (
          <Text key={c.key} style={{ flex: c.flex, fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.6), fontWeight: '600', color: token.colorTextSecondary, textAlign: c.align === 'right' ? 'right' : 'left' }}>{c.label}</Text>
        ))}
      </View>
      {props.rows.length === 0 ? (
        <View style={{ padding: token.padding }}>
          <Text style={{ fontSize: token.fontSizeSM, lineHeight: 20, color: token.colorTextTertiary }}>暂无已登记窗口</Text>
        </View>
      ) : (
        props.rows.map((w, i) => (
          <View key={w.id} style={{ flexDirection: 'row', gap: token.margin, padding: token.paddingSM, borderTopWidth: i > 0 ? token.lineWidth : 0, borderTopColor: token.colorBorderSecondary }}>
            {cols.map((c) => (
              <Text key={c.key} style={{ flex: c.flex, ...cellText(c.align) }}>{c.render(w)}</Text>
            ))}
          </View>
        ))
      )}
    </View>
  );
});

/** 帧率单元：窗口名 + 大号 fps + 迷你占比条（相对 60） */
const FpsCell = React.memo(function FpsCell(props: { title: string; fps: number; main?: boolean }): React.ReactElement {
  const { token } = useToken();
  const col = fpsColor(props.fps, token);
  return (
    <View style={{ flex: 1, minWidth: 120, padding: token.paddingSM, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorFillQuaternary, gap: token.marginXXS }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        {props.main ? <Tag color="processing" style={{ margin: 0 }}>主窗</Tag> : null}
        <Text style={{ flex: 1, fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.5), color: token.colorTextSecondary }} numberOfLines={1}>{props.title}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontSize: token.fontSizeXL, lineHeight: Math.round(token.fontSizeXL * 1.3), fontWeight: '700', color: col }}>{props.fps}</Text>
        <Text style={{ fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.9), color: token.colorTextTertiary, marginBottom: 3 }}>fps</Text>
      </View>
      <Progress percent={pct(props.fps, 60)} showInfo={false} size="small" strokeColor={col} />
    </View>
  );
});

function PerfBody(props: { snap: SystemSnapshot; fpsList: { id: number; title: string; fps: number }[]; sampledAt: string }): React.ReactElement {
  const { token } = useToken();
  const { snap, fpsList } = props;
  const m = snap.memoryMB;
  const isGpu = process.env.FLUX_GPU === '1';
  const theme = Application.config.getTheme();
  const dpr = Application.getMainWindowScale();
  const img = snap.imageCache;
  const mainFps = fpsList.length ? fpsList[0].fps : snap.fps;

  return (
    <View style={{ gap: token.marginXS }}>
      {/* 顶部标题栏 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: token.marginSM,
          padding: token.paddingSM,
          borderRadius: token.borderRadiusLG,
          borderWidth: token.lineWidth,
          borderColor: token.colorBorderSecondary,
          backgroundColor: token.colorBgContainer,
        }}
      >
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: token.colorSuccess }} />
        <Text style={{ fontSize: token.fontSizeLG, lineHeight: Math.round(token.fontSizeLG * 1.4), fontWeight: '700', color: token.colorText }}>性能详情</Text>
        <Tag color={isGpu ? 'success' : 'processing'} bordered={false}>{isGpu ? 'GPU 直呈' : 'CPU 光栅'}</Tag>
        <Text style={{ fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.5), color: token.colorTextTertiary }}>采样 {props.sampledAt} · 运行 {SystemStats_fmtUptime(snap.uptimeSec)}</Text>
        <View style={{ flex: 1 }} />
        <FpsMonitor intervalMs={1000} maxPoints={24} label="帧率" good={50} warn={28} />
      </View>

      {/* 内存占用 */}
      <View style={{ gap: token.marginXS }}>
        <SectionTitle text="内存占用" extra={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>单位 MB</Text>} />
        <View style={{ flexDirection: 'row', gap: token.marginSM }}>
          <MetricTile label="常驻内存 RSS" value={mb(m.rss)} unit="MB" accent={token.colorPrimary} />
          <MetricTile label="V8 堆 used/total" value={mb(m.heapUsed)} unit={`/ ${mb(m.heapTotal)} MB`} ratio={pct(m.heapUsed, m.heapTotal)} ratioText={`占用率 ${pct(m.heapUsed, m.heapTotal)}%`} />
          <MetricTile label="外部内存 External" value={mb(m.external)} unit="MB" />
          <MetricTile label="ArrayBuffers" value={mb(m.arrayBuffers)} unit="MB" />
        </View>
        <View style={{ flexDirection: 'row', gap: token.marginSM }}>
          <MetricTile label="图片解码缓存" value={String(img.count)} unit={`张 · ${mb(img.bytes / (1024 * 1024))} MB`} ratio={pct(img.bytes, img.maxBytes)} ratioText={`上限 ${mb(img.maxBytes / (1024 * 1024))} MB`} accent={token.colorWarning} />
          <MetricTile label="渲染面合计" value={mb(snap.totalSurfaceMB)} unit="MB" accent={token.colorInfo} />
          <MetricTile label="窗口总数" value={String(snap.windows.length)} unit="个" />
          <MetricTile label="进程运行时长" value={SystemStats_fmtUptime(snap.uptimeSec)} />
        </View>
      </View>

      {/* 帧率 */}
      <View style={{ gap: token.marginXS }}>
        <SectionTitle text="帧率" extra={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>每秒实际上屏帧数</Text>} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginSM }}>
          {fpsList.length === 0 ? (
            <FpsCell title="主窗" fps={mainFps} main />
          ) : (
            fpsList.map((w, i) => <FpsCell key={w.id} title={w.title} fps={w.fps} main={i === 0} />)
          )}
        </View>
      </View>

      {/* 逐窗性能统计 */}
      <View style={{ gap: token.marginXS }}>
        <SectionTitle text="逐窗性能统计" extra={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{snap.windows.length} 个窗口</Text>} />
        <WindowTable rows={snap.windows} />
      </View>

      {/* 运行时参数 */}
      <View style={{ gap: token.marginXS }}>
        <SectionTitle text="运行时参数" />
        <Descriptions
          bordered
          column={3}
          size="small"
          items={[
            { key: 'backend', label: '渲染后端', children: isGpu ? 'GPU 直呈' : 'CPU 光栅' },
            { key: 'dpr', label: '主窗 DPR', children: dpr.toFixed(2) },
            { key: 'win', label: '窗口数', children: String(snap.windows.length) },
            { key: 'node', label: 'Node 版本', children: `v${process.versions.node}` },
            { key: 'chrome', label: 'V8 引擎', children: process.versions.v8 },
            { key: 'pid', label: '进程 PID', children: String(process.pid) },
            { key: 'platform', label: '平台', children: process.platform },
            { key: 'arch', label: '架构', children: process.arch },
            { key: 'pltf', label: '操作系统', children: `${process.platform} (${process.arch})` },
            { key: 'mode', label: '主题模式', children: theme.dark ? '暗色' : '亮色' },
            { key: 'compact', label: '密度', children: theme.compact ? '紧凑' : '宽松' },
            { key: 'anim', label: '动画', children: theme.animation ? '开启' : '关闭' },
            { key: 'fontsize', label: '基础字号', children: theme.fontSize != null ? String(theme.fontSize) : '跟随算法' },
            { key: 'ctrlh', label: '控件高度', children: theme.controlHeight != null ? String(theme.controlHeight) : '跟随算法' },
            {
              key: 'primary',
              label: '主色',
              children: (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: theme.primary, borderWidth: token.lineWidth, borderColor: token.colorBorder }} />
                  <Text style={{ fontSize: token.fontSizeSM, lineHeight: 18, color: token.colorText }}>{theme.primary}</Text>
                </View>
              ),
            },
          ]}
        />
      </View>
    </View>
  );
}

/** 运行时长格式化（复用 SystemStats 语义，避免额外 import 静态方法类型噪音） */
function SystemStats_fmtUptime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}m` : `${m}m${String(s).padStart(2, '0')}s`;
}

export function PerfDetails(): React.ReactElement {
  const { token } = useToken();
  const [refreshKey, setRefreshKey] = React.useState<RefreshKey>('1s');
  const [auto, setAuto] = React.useState(true);
  const [nonce, setNonce] = React.useState(0);
  const [snap, setSnap] = React.useState<SystemSnapshot>(() => systemStats.snapshot());
  const [fpsList, setFpsList] = React.useState<{ id: number; title: string; fps: number }[]>(() => systemStats.fpsSnapshot());
  const [sampledAt, setSampledAt] = React.useState<string>(() => hhmmss(new Date()));

  const running = auto && refreshKey !== 'off';

  // 轻采样：只取廉价字段（进程内存 / 图片缓存 / 运行时长 / 逐窗帧率），不遍历任何窗口场景树。
  // 保留 prev.windows / totalSurfaceMB 引用不变，令 WindowTable 的 memo 在轻采样 tick 命中跳过。
  const sampleLight = React.useCallback((): void => {
    setSnap((prev) => ({
      ...prev,
      memory: systemStats.memory(),
      memoryMB: systemStats.memoryMB(),
      imageCache: systemStats.imageCache(),
      uptimeSec: systemStats.uptimeSec(),
      fps: systemStats.fps(),
    }));
    setFpsList(systemStats.fpsSnapshot());
    setSampledAt(hhmmss(new Date()));
  }, []);

  // 重采样：逐窗 getMemStats() 递归遍历每棵场景树数节点（O(总节点数)），故降频到 HEAVY_MS。
  const sampleHeavy = React.useCallback((): void => {
    const windows = systemStats.windows();
    setSnap((prev) => ({
      ...prev,
      windows,
      totalSurfaceMB: windows.reduce((a, w) => a + w.surfaceMB, 0),
    }));
  }, []);

  // 挂载 / 手动「立即刷新」：轻+重各一次，保证首屏与手动刷新数据完整。
  React.useEffect(() => {
    sampleLight();
    sampleHeavy();
  }, [nonce, sampleLight, sampleHeavy]);

  // 轻采样定时器：跟随用户选择的刷新频率。
  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(sampleLight, REFRESH_MS[refreshKey]);
    return () => clearInterval(t);
  }, [running, refreshKey, sampleLight]);

  // 重采样定时器：固定低频，与轻采样解耦。
  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(sampleHeavy, HEAVY_MS);
    return () => clearInterval(t);
  }, [running, sampleHeavy]);

  return (
    <View style={{ gap: token.marginSM }}>
      {/* 控制条 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: token.margin,
          padding: token.paddingSM,
          borderRadius: token.borderRadiusLG,
          borderWidth: token.lineWidth,
          borderColor: token.colorBorderSecondary,
          backgroundColor: token.colorFillQuaternary,
        }}
      >
        <Text style={{ fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.5), color: token.colorTextSecondary, flexShrink: 0 }}>刷新频率</Text>
        <Segmented value={refreshKey} onChange={(v) => setRefreshKey(v as RefreshKey)} options={REFRESH_OPTIONS} style={{ alignSelf: 'center', flexShrink: 0 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS, flexShrink: 0 }}>
          <Switch checked={auto} onChange={setAuto} size="small" />
          <Text style={{ fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.5), color: token.colorTextSecondary }}>自动</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ flexShrink: 0 }}>
          <Button size="small" onClick={() => setNonce((n) => n + 1)}>立即刷新</Button>
        </View>
      </View>
      <PerfBody snap={snap} fpsList={fpsList} sampledAt={sampledAt} />
    </View>
  );
}

/** 打开「性能详情」独立窗（顶栏头像下拉调用；按 tag 去重，命中则前置）。 */
export function openPerfDetails(): void {
  openThemedWindow({
    tag: 'window-perf-details',
    title: '性能详情',
    node: React.createElement(PerfDetails),
    width: Number(process.env.FLUX_PERF_W) || 1120,
    height: Number(process.env.FLUX_PERF_H) || 820,
    scroll: true,
  });
}

export default PerfDetails;
