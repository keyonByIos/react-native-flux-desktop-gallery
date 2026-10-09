// 系统 / 系统方法 SystemStats：把「内存监控面板」的取数逻辑抽成的可随时调用类的用法演示。
// systemStats 单例聚合 进程内存 / 图片缓存 / 运行时长 / 逐窗渲染面 / 帧率 / GC，全部即时快照。
import React from 'react';
import {
  View,
  Text,
  Button,
  Tag,
  useToken,
  systemStats,
  SystemStats,
  type SystemSnapshot,
} from 'react-native-flux-desktop';
import { DemoPage, type DemoItem } from '../DemoPage';

const f1 = (n: number): string => n.toFixed(1);

/** 一段说明文字 */
function Prose(props: { lines: string[] }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ marginTop: token.margin }}>
      {props.lines.map((l, i) => (
        <Text key={i} style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize * 1.4, marginBottom: token.marginXXS }}>
          {l}
        </Text>
      ))}
    </View>
  );
}

/** 键值行 */
function KV(props: { k: string; v: string; strong?: boolean }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: token.marginXS, paddingVertical: 2 }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, flex: 1 }} numberOfLines={1}>{props.k}</Text>
      <Text style={{ fontSize: token.fontSizeSM, color: props.strong ? token.colorText : token.colorTextSecondary, fontVariant: ['tabular-nums'] }} numberOfLines={1}>{props.v}</Text>
    </View>
  );
}

/** 实时快照面板：默认 1s 自刷，也可手动刷新 / 暂停 */
function LiveSnapshot(): React.ReactElement {
  const { token } = useToken();
  const [snap, setSnap] = React.useState<SystemSnapshot>(() => systemStats.snapshot());
  const [auto, setAuto] = React.useState(true);
  React.useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setSnap(systemStats.snapshot()), 1000);
    return () => clearInterval(t);
  }, [auto]);
  const m = snap.memoryMB;
  const card = { flex: 1, minWidth: 240, padding: token.paddingSM, borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderStyle: 'solid' as const, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer };
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, marginBottom: token.marginSM, flexWrap: 'wrap' }}>
        <Button size="small" type="primary" onClick={() => setSnap(systemStats.snapshot())}>立即取数</Button>
        <Button size="small" onClick={() => setAuto((a) => !a)}>{auto ? '暂停自刷' : '开启自刷'}</Button>
        <Tag color={auto ? 'processing' : 'default'}>{auto ? '1s 轮询中' : '已暂停'}</Tag>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginSM }}>
        <View style={card}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginXS, fontWeight: '600' as const }}>进程内存</Text>
          <KV k="RSS 常驻集" v={`${f1(m.rss)} MB`} strong />
          <KV k="Heap V8 已用" v={`${f1(m.heapUsed)} MB`} />
          <KV k="Heap V8 预留" v={`${f1(m.heapTotal)} MB`} />
          <KV k="External 原生侧" v={`${f1(m.external)} MB`} />
          <KV k="arrayBuffers" v={`${f1(m.arrayBuffers)} MB`} />
        </View>
        <View style={card}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginXS, fontWeight: '600' as const }}>运行时</Text>
          <KV k="运行时长" v={SystemStats.fmtUptime(snap.uptimeSec)} />
          <KV k="主窗帧率" v={`${snap.fps} fps`} />
          <KV k="图片缓存张数" v={`${snap.imageCache.count} 张`} />
          <KV k="图片缓存占用" v={`${f1(snap.imageCache.bytes / 1048576)} MB`} />
          <KV k="缓存上限" v={`${f1(snap.imageCache.maxBytes / 1048576)} MB`} />
        </View>
      </View>
      {/* 逐窗卡是外层列容器的直接子项：勿沿用 card 的 flex:1（列方向 flex:1 在高不定父容器下会按 flexBasis:0 塌陷成 0 高），显式 flex:0 回到内容自适应 */}
      <View style={{ ...card, flex: 0, minWidth: 0, marginTop: token.marginSM }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginXS, fontWeight: '600' as const }}>逐窗渲染面（{snap.windows.length} 窗 · 面合计 {f1(snap.totalSurfaceMB)} MB）</Text>
        {snap.windows.length === 0 ? (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>（无已注册窗口）</Text>
        ) : (
          snap.windows.map((w) => (
            <View key={w.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: token.marginXS, paddingVertical: 2 }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorText, flex: 1 }} numberOfLines={1}>#{w.id} {w.title}</Text>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, fontVariant: ['tabular-nums'] }} numberOfLines={1}>
                {Math.round(w.w)}×{Math.round(w.h)}@{w.dpr} · 面 {f1(w.surfaceMB)} · 节点 {w.nodes} · 堆≈ {f1(w.heapShareMB)} MB
              </Text>
            </View>
          ))
        )}
      </View>
      <Prose lines={['· 堆占比 heapShareMB 是按节点数把进程 V8 堆摊算到各窗的估算值（多窗共享同一堆，非精确隔离量），仅用于观察相对分布。']} />
    </View>
  );
}

/** 单次调用 + GC：把快照打到 console，并演示 gc() 可用性 */
function OneShotDemo(): React.ReactElement {
  const { token } = useToken();
  const [log, setLog] = React.useState<string[]>([]);
  const push = (m: string): void => setLog((l) => [`${new Date().toLocaleTimeString()} · ${m}`, ...l].slice(0, 6));
  const doSnapshot = (): void => {
    const s = systemStats.snapshot();
    console.log('[systemStats.snapshot]', s);
    push(`snapshot() → RSS ${f1(s.memoryMB.rss)}MB · ${s.windows.length} 窗 · ${s.fps}fps（已打到 console）`);
  };
  const doGc = (): void => {
    const before = systemStats.memoryMB().rss;
    const ok = systemStats.gc();
    const after = systemStats.memoryMB().rss;
    push(ok ? `gc() ✓ RSS ${f1(before)} → ${f1(after)} MB` : 'gc() ✗ 需以 node --expose-gc 启动');
  };
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button type="primary" onClick={doSnapshot}>snapshot() 打到 console</Button>
        <Button onClick={doGc}>gc()</Button>
        <Tag color={systemStats.gcAvailable() ? 'success' : 'default'}>{systemStats.gcAvailable() ? 'GC 可用' : 'GC 不可用（未 --expose-gc）'}</Tag>
      </View>
      <View style={{ marginTop: token.marginSM, gap: 2 }}>
        {log.length === 0 ? (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>点按钮：任意处即时取数，无需定时器、无需挂载组件。</Text>
        ) : (
          log.map((l, i) => (
            <Text key={i} style={{ fontSize: token.fontSizeSM, color: i === 0 ? token.colorText : token.colorTextTertiary }}>{l}</Text>
          ))
        )}
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: 'SystemStats 是什么',
    desc: '把内存监控面板的取数逻辑抽成可随时调用的类：即时快照、无内部定时器、无副作用（除 gc）。',
    node: (
      <Prose
        lines={[
          '① 单例 systemStats：任意处 import { systemStats } from "react-native-flux-desktop" 即可调用，不必挂载任何组件、不必自设定时器。',
          '② 数据源与 MemMonitor 面板统一：MemMonitor 内部已改为消费本类，二者永远同源，不会漂移。',
          '③ 细粒度方法（memory / memoryMB / imageCache / uptimeSec / fps / windows）各取一类；snapshot() 一次拉全量，且内部只读一次 memoryUsage 保证一致。',
          '④ 格式化辅助 SystemStats.fmtMB / fmtUptime 为静态纯函数，可直接复用。',
        ]}
      />
    ),
    code: [
      'import { systemStats, SystemStats } from "react-native-flux-desktop";',
      '',
      'const m = systemStats.memoryMB();       // { rss, heapUsed, heapTotal, external, arrayBuffers } 单位 MB',
      'const ic = systemStats.imageCache();     // { count, bytes, maxBytes }',
      'const wins = systemStats.windows();       // 逐窗渲染面 + 堆摊算估算',
      'const snap = systemStats.snapshot();      // 一次性全量（含 fps / uptimeSec / totalSurfaceMB）',
      '',
      "console.log('RSS', SystemStats.fmtMB(snap.memory.rss), 'uptime', SystemStats.fmtUptime(snap.uptimeSec));",
    ].join('\n'),
  },
  {
    name: '实时快照（内存 / 运行时 / 逐窗）',
    desc: '默认 1s 轮询 snapshot()；可切「暂停自刷」后用「立即取数」手动拉。这就是本类被随时调用的实况。',
    node: <LiveSnapshot />,
    code: [
      'const [snap, setSnap] = React.useState(() => systemStats.snapshot());',
      'React.useEffect(() => {',
      '  const t = setInterval(() => setSnap(systemStats.snapshot()), 1000);',
      '  return () => clearInterval(t);',
      '}, []);',
    ].join('\n'),
  },
  {
    name: '单次调用 & GC',
    desc: '不挂面板也能即时取数（打到 console），并演示 gc() 的可用性判定（需 node --expose-gc）。',
    node: <OneShotDemo />,
    code: [
      'const s = systemStats.snapshot();     // 任意处一次性取数',
      'console.log(s);',
      '',
      'if (systemStats.gcAvailable()) systemStats.gc();  // 主动触发一次 GC',
    ].join('\n'),
  },
];

const API = [
  { name: 'memory()', desc: '进程内存原始字节快照（process.memoryUsage）', type: '(): MemoryUsage' },
  { name: 'memoryMB()', desc: '进程内存，MB 单位', type: '(): MemoryUsageMB' },
  { name: 'imageCache()', desc: '图片解码缓存：张数 / 占用 / 上限（字节）', type: '(): ImageCacheStat' },
  { name: 'uptimeSec()', desc: '进程运行时长（秒）', type: '(): number' },
  { name: 'fps(windowId?)', desc: '主窗（或指定窗）当前帧率，委托 Application.getFps', type: '(windowId?: number): number' },
  { name: 'fpsSnapshot()', desc: '逐窗帧率快照（按打开顺序）', type: '(): { id; title; fps }[]' },
  { name: 'windows()', desc: '逐窗渲染面 + 按节点占比摊算的 V8 堆估算', type: '(): WindowMemStat[]' },
  { name: 'snapshot()', desc: '一次性全量快照（内部仅读一次 memoryUsage）', type: '(): SystemSnapshot' },
  { name: 'gcAvailable()', desc: '是否可调 GC（需 --expose-gc）', type: '(): boolean' },
  { name: 'gc()', desc: '主动触发一次 GC，成功 true / 不可用 false（不抛）', type: '(): boolean' },
  { name: 'SystemStats.fmtMB(bytes)', desc: '静态：字节 → 「x.x MB」', type: '(bytes: number): string' },
  { name: 'SystemStats.fmtUptime(sec)', desc: '静态：秒 → 「2m44s」/「1h05m」', type: '(sec: number): string' },
];

export function SysMethodsDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
