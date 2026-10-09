// SysMonitor.tsx —— 系统监控「托盘小部件」：无边框置顶迷你面板（对齐 TrayMenu 的开窗范式）。
//
// 尺寸策略（软栅格无 alpha 穿透，未绘制区露黑 → 窗口必须与内容严丝合缝）：
//   全部几何尺寸用本文件固定常量（绝不取 token，否则 compact 换肤让布局高与算好的窗口高脱节、露黑边）；
//   窗口高 = widgetHeight() 与内容逐项对账；token 只用于颜色（自适应明暗）。
//   圆角：外层 View 铺满整窗涂 colorBgContainer 作底，内层 flex:1 涂 colorBgElevated + 圆角，圆角外露 container 底色（非黑）。
//
// 取数：CPU/系统内存走纯 Node os（sys-monitor-lib），进程 RSS/帧率/运行时长走库 systemStats。
//
// 两形态（同源一个开窗 + 一个本体）：
//   · B 悬浮态（默认，未钉住）：openSysMonitor 在托盘图标上方弹出，onFocused 失焦关 + armDismiss 点外即关。
//   · A 常驻态（钉住）：点标题栏「锁」图标切 pinned=true → 解除失焦/点外关闭，变常驻桌面小部件；位置随拖动记忆。
//   拖动：库无 OS 级 drag_window 原语，用「保持抓取点跟随光标」法——标题栏按下进入拖拽，
//     onMouseMove 读局部坐标增量，host.setPosition 把窗口挪到令抓取点回到光标下，循环即跟手（局部坐标自洽）。
import React from 'react';
import {
  View,
  Text,
  Icon,
  Pressable,
  FluxProvider,
  useToken,
  Application,
  kv,
  type ThemeAlgorithm,
  type TrayRect,
  type AliasToken,
  type MoveEvent,
} from 'react-native-flux-desktop';
import { useAppTheme } from '../components/AppWindow';
import { useSysMetrics, fmtMem, fmtUptime, type SysMetrics } from './sys-monitor-lib';

const TAG = 'sys-monitor';

// —— 几何常量：与 SysMonitorBody 渲染严格一一对应，改这里即改窗口尺寸 ——
const W = 264; // 窗口宽（逻辑像素）
const PAD_H = 14; // 内层面板左右内边距
const PAD_V = 12; // 内层面板上下内边距
const PANEL_R = 10; // 面板圆角（常量）
const TITLE_H = 32; // 标题行高（兼拖拽把手）
const ROW_H = 46; // 每个指标行高（上：图标+标签+数值；下：占比条）
const FOOTER_H = 22; // 页脚行高
const BAR_H = 6; // 占比条粗
const BAR_R = 3; // 占比条圆角
const ICON_SIZE = 15; // 行图标边长（常量，不取 token）
const LABEL_FS = 13; // 标签字号
const VALUE_FS = 15; // 数值字号
const ROW_GAP = 8; // 图标→标签间距
const ROWS = 3; // 指标行数（CPU / 内存 / 帧率）
const CTRL = 20; // 标题栏控件点击盒边长
const CTRL_ICON = 14; // 控件图标边长
const DOCK_H = 26; // 停靠行高（仅交互态）
const DOCK_BTN = 18; // 停靠按钮盒边长
const DOCK_DOT = 6; // 停靠按钮内角落指示方块边长
const DOCK_MARGIN = 12; // 停靠时距屏幕边缘留白
const DOCK_BOT = 48; // 停靠底部时额外抬高（避开任务栏）

/** 精确窗口高 = 上下内边距 + 标题 + 指标行×3 + 页脚（+ 交互态再加停靠行）；全部常量，与内容逐项对账 */
export function widgetHeight(withControls = true): number {
  return PAD_V * 2 + TITLE_H + ROW_H * ROWS + FOOTER_H + (withControls ? DOCK_H : 0);
}
const H = widgetHeight(true); // 独立小窗（含停靠行）高
const TRACK_W = W - PAD_H * 2; // 占比条满宽

// —— 持久化状态（落 flux_app.kv，重启保留）：钉住与否 + 用户拖动/停靠后的位置。——
const KV_KEY = 'widget.sys-monitor';
let pinned = false;
let userPos: { x: number; y: number } | null = null;

/** 从 kv 读回上次持久化的钉住态与落点（模块加载即调；addon 不可用/无记录则保持默认）。 */
function loadState(): void {
  try {
    if (!kv.available) return;
    const r = kv.get('app', KV_KEY);
    const v = r?.value as { pinned?: unknown; x?: unknown; y?: unknown } | undefined;
    if (!v || typeof v !== 'object') return;
    if (typeof v.pinned === 'boolean') pinned = v.pinned;
    if (typeof v.x === 'number' && typeof v.y === 'number') userPos = { x: v.x, y: v.y };
  } catch {
    /* kv 未就绪/损坏：忽略，用默认 */
  }
}

/** 把当前钉住态与落点写回 kv（钉住切换 / 拖动结束 / 停靠时调用；写失败静默）。 */
function saveState(): void {
  try {
    if (!kv.available) return;
    kv.set('app', KV_KEY, 'json', { pinned, x: userPos?.x ?? null, y: userPos?.y ?? null });
  } catch {
    /* 忽略 */
  }
}

loadState();

type Corner = 'tl' | 'tr' | 'bl' | 'br';

/** 把小部件窗瞬移到指定屏幕角（避开任务栏），并记忆落点。 */
function dockTo(c: Corner): void {
  const host = Application.findByTag(TAG)?.host;
  if (!host?.setPosition || !host.getMonitorSize) return;
  const mon = host.getMonitorSize();
  let x = mon.x + DOCK_MARGIN;
  let y = mon.y + DOCK_MARGIN;
  if (c[1] === 'r') x = mon.x + mon.w - W - DOCK_MARGIN;
  if (c[0] === 'b') y = mon.y + mon.h - H - DOCK_BOT;
  x = Math.max(mon.x, Math.min(x, mon.x + mon.w - W));
  y = Math.max(mon.y, Math.min(y, mon.y + mon.h - H - 44));
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  host.setPosition(fx, fy);
  userPos = { x: fx, y: fy };
  saveState();
  syncDismiss(); // 未钉住时停靠后按新位重设点外关矩形
}

const clampPct = (a: number, b: number): number => (b > 0 ? Math.max(0, Math.min(100, Math.round((a / b) * 100))) : 0);

/** 负载配色（CPU/内存：越高越差）：≥90 红、≥70 黄、否则绿 */
function loadColor(pct: number, token: AliasToken): string {
  if (pct >= 90) return token.colorError;
  if (pct >= 70) return token.colorWarning;
  return token.colorSuccess;
}
/** 帧率配色（越高越好）：0 灰、≥50 绿、≥30 黄、否则红 */
function fpsColor(fps: number, token: AliasToken): string {
  if (fps <= 0) return token.colorTextTertiary;
  if (fps >= 50) return token.colorSuccess;
  if (fps >= 30) return token.colorWarning;
  return token.colorError;
}

/** 按当前 pinned + 窗口实际位置，重设「点外面即关」监听：钉住=解除，未钉=以当前矩形武装。 */
function syncDismiss(): void {
  const host = Application.findByTag(TAG)?.host;
  if (!host?.getWindowState) return;
  if (pinned) {
    Application.tray.disarmDismiss();
    return;
  }
  const scale = Application.getMainWindowScale();
  const st = host.getWindowState();
  Application.tray.armDismiss(
    { x: st.x * scale, y: st.y * scale, w: W * scale, h: H * scale },
    () => Application.closeTag(TAG),
  );
}

interface MetricRowProps {
  icon: string;
  label: string;
  pct: number; // 0-100 占比条
  valueText: string;
  color: string;
}

/** 单指标行：固定高 ROW_H；上行「图标 + 标签 …… 数值」，下行自绘占比条（数字宽，避免 %/flex 布局坑）。 */
function MetricRow(props: MetricRowProps): React.ReactElement {
  const { token } = useToken();
  const fillW = Math.max(0, Math.min(TRACK_W, Math.round((TRACK_W * props.pct) / 100)));
  return (
    <View style={{ height: ROW_H, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name={props.icon} size={ICON_SIZE} color={token.colorTextSecondary} />
        <Text style={{ marginLeft: ROW_GAP, fontSize: LABEL_FS, lineHeight: 18, color: token.colorTextSecondary }}>{props.label}</Text>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: VALUE_FS, lineHeight: 20, fontWeight: '600', color: props.color }}>{props.valueText}</Text>
      </View>
      <View style={{ marginTop: 6, height: BAR_H, borderRadius: BAR_R, backgroundColor: token.colorFillSecondary, overflow: 'hidden' }}>
        <View style={{ width: fillW, height: BAR_H, borderRadius: BAR_R, backgroundColor: props.color }} />
      </View>
    </View>
  );
}

interface BodyProps {
  /** true（独立小窗）= 显示钉住/关闭控件且标题栏可拖动；false（案例内嵌预览）= 纯静态展示 */
  controls?: boolean;
}

/** 小部件内容体（固定 W×H）：标题行 + CPU/内存/帧率三行 + 页脚；须在主题根内（useToken 才读到当前主题）。 */
export function SysMonitorBody({ controls = true }: BodyProps): React.ReactElement {
  const { token } = useToken();
  const m: SysMetrics = useSysMetrics(1000);
  const [pin, setPin] = React.useState<boolean>(pinned);
  const dragging = React.useRef(false);
  const grab = React.useRef<{ x: number; y: number } | null>(null);

  const togglePin = (): void => {
    const next = !pin;
    pinned = next;
    setPin(next);
    syncDismiss(); // 钉住→解除点外关；取消钉住→按当前位重新武装
    saveState();
  };
  const startDrag = (): void => {
    dragging.current = true;
    grab.current = null;
    // 拖动期间解除「点外即关」：armWatch 锁的是开窗时那份固定矩形，窗口 setPosition 挪走后
    // 一旦光标/窗口越出旧矩形就会被判为“外部”→ 误触发关窗（拖一会儿就消失）。松手后按新位重武装。
    Application.tray.disarmDismiss();
  };
  const endDrag = (): void => {
    dragging.current = false;
    grab.current = null;
    const host = Application.findByTag(TAG)?.host;
    if (host?.getWindowState) {
      const st = host.getWindowState();
      userPos = { x: st.x, y: st.y }; // 记忆落点，供下次打开复位
      saveState();
    }
    syncDismiss(); // 未钉住→按拖动后的新位重新武装点外关；已钉住→保持解除
  };
  const onMove = (e: MoveEvent): void => {
    if (!dragging.current) return;
    const lx = e.nativeEvent.locationX;
    const ly = e.nativeEvent.locationY;
    if (!grab.current) {
      grab.current = { x: lx, y: ly };
      return;
    }
    const host = Application.findByTag(TAG)?.host;
    if (!host?.getWindowState || !host.setPosition) return;
    const st = host.getWindowState();
    const dx = lx - grab.current.x;
    const dy = ly - grab.current.y;
    if (dx === 0 && dy === 0) return;
    const mon = host.getMonitorSize?.() ?? { x: 0, y: 0, w: 1920, h: 1080 };
    const nx = Math.max(mon.x, Math.min(st.x + dx, mon.x + mon.w - W));
    const ny = Math.max(mon.y, Math.min(st.y + dy, mon.y + mon.h - H));
    host.setPosition(nx, ny);
    userPos = { x: nx, y: ny };
  };

  const titleBar = controls ? (
    <Pressable
      onPressIn={startDrag}
      onPressOut={endDrag}
      style={{ height: TITLE_H, flexDirection: 'row', alignItems: 'center', cursor: 'move' }}
    >
      <Icon name="activity" size={16} color={token.colorPrimary} />
      <Text style={{ marginLeft: ROW_GAP, fontSize: 14, lineHeight: 18, fontWeight: '700', color: token.colorText }}>系统监控</Text>
      <View style={{ flex: 1 }} />
      <Pressable onPress={togglePin} style={{ width: CTRL, height: CTRL, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name={pin ? 'lock' : 'unlock'} size={CTRL_ICON} color={pin ? token.colorPrimary : token.colorTextTertiary} />
      </Pressable>
      <Pressable onPress={closeSysMonitor} style={{ width: CTRL, height: CTRL, marginLeft: 4, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name="close" size={CTRL_ICON} color={token.colorTextTertiary} />
      </Pressable>
    </Pressable>
  ) : (
    <View style={{ height: TITLE_H, flexDirection: 'row', alignItems: 'center' }}>
      <Icon name="activity" size={16} color={token.colorPrimary} />
      <Text style={{ marginLeft: ROW_GAP, fontSize: 14, lineHeight: 18, fontWeight: '700', color: token.colorText }}>系统监控</Text>
      <View style={{ flex: 1 }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: token.colorSuccess }} />
    </View>
  );

  return (
    <View style={{ width: W, height: widgetHeight(controls), backgroundColor: token.colorBgContainer }} onMouseMove={controls ? onMove : undefined}>
      <View style={{ flex: 1, paddingVertical: PAD_V, paddingHorizontal: PAD_H, borderRadius: PANEL_R, backgroundColor: token.colorBgElevated }}>
        {titleBar}
        {/* 指标行 */}
        <MetricRow icon="cpu" label="CPU" pct={m.cpu} valueText={`${m.cpu}%`} color={loadColor(m.cpu, token)} />
        <MetricRow
          icon="hardDrive"
          label="内存"
          pct={m.memPct}
          valueText={`${m.memPct}% · ${fmtMem(m.memUsedMB)}/${fmtMem(m.memTotalMB)}`}
          color={loadColor(m.memPct, token)}
        />
        <MetricRow icon="activity" label="帧率" pct={clampPct(m.fps, 60)} valueText={`${m.fps} fps`} color={fpsColor(m.fps, token)} />
        {/* 页脚 */}
        <View style={{ height: FOOTER_H, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, lineHeight: 14, color: token.colorTextTertiary }}>运行 {fmtUptime(m.uptimeSec)}</Text>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 11, lineHeight: 14, color: token.colorTextTertiary }}>进程 RSS {fmtMem(m.rssMB)}</Text>
        </View>
        {/* 停靠行（仅交互态）：一键把窗口瞬移到屏幕四角 */}
        {controls ? (
          <View style={{ height: DOCK_H, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, lineHeight: 14, color: token.colorTextTertiary }}>停靠</Text>
            <View style={{ flex: 1 }} />
            <DockBtn corner="tl" onPress={() => dockTo('tl')} />
            <DockBtn corner="tr" onPress={() => dockTo('tr')} />
            <DockBtn corner="bl" onPress={() => dockTo('bl')} />
            <DockBtn corner="br" onPress={() => dockTo('br')} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** 停靠四角按钮：空心小方框 + 目标角落一颗主色方块，直观指示将停靠的方位（无需图标）。 */
function DockBtn(props: { corner: Corner; onPress: () => void }): React.ReactElement {
  const { token } = useToken();
  const c = props.corner;
  const dot: Record<string, number | string> = {
    position: 'absolute',
    width: DOCK_DOT,
    height: DOCK_DOT,
    borderRadius: 1,
    backgroundColor: token.colorPrimary,
  };
  if (c[0] === 't') dot.top = 2;
  else dot.bottom = 2;
  if (c[1] === 'l') dot.left = 2;
  else dot.right = 2;
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        width: DOCK_BTN,
        height: DOCK_BTN,
        marginLeft: 4,
        borderRadius: 3,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorFillQuaternary,
        cursor: 'pointer',
      }}
    >
      <View style={dot as any} />
    </Pressable>
  );
}

/** 小部件窗根：自带 FluxProvider（订阅全局主题）→ 明暗/主色即时跟随。 */
function SysMonitorWindow(): React.ReactElement {
  const theme = useAppTheme();
  const algorithm: ThemeAlgorithm[] = [
    theme.dark ? 'dark' : 'default',
    ...(theme.compact ? (['compact'] as ThemeAlgorithm[]) : []),
  ];
  return (
    <FluxProvider
      theme={{ algorithm, token: { colorPrimary: theme.primary, colorLink: theme.primary, colorInfo: theme.primary } }}
      animation={theme.animation}
    >
      <SysMonitorBody controls />
    </FluxProvider>
  );
}

/** 关小部件并解除「点外面」监听（失焦 / dismiss / 再次 toggle / 关闭按钮均走这里；disarmDismiss 幂等）。 */
export function closeSysMonitor(): void {
  Application.tray.disarmDismiss();
  Application.closeTag(TAG);
}

/**
 * 弹出（或收起）系统监控小部件：已存在同 tag 窗则 toggle 关闭（= 显隐）。
 * 位置优先用上次拖动记忆 userPos；否则按 rect（托盘图标上方）或右下角兜底。
 * 未钉住时挂失焦关 + 点外即关；钉住则常驻（syncDismiss 在切换时处理监听武装）。
 */
export function openSysMonitor(rect?: TrayRect): void {
  if (Application.findByTag(TAG)) {
    closeSysMonitor();
    return;
  }
  const scale = Application.getMainWindowScale();
  const mon = Application.main()?.host?.getMonitorSize?.() ?? { x: 0, y: 0, w: 1920, h: 1080 };
  let x: number;
  let y: number;
  if (userPos) {
    x = userPos.x;
    y = userPos.y;
  } else if (rect) {
    x = (rect.x + rect.w) / scale - W;
    y = rect.y / scale - H - 2;
  } else {
    x = mon.x + mon.w - W - 12;
    y = mon.y + mon.h - H - 48;
  }
  x = Math.min(Math.max(x, mon.x), mon.x + mon.w - W);
  y = Math.min(y, mon.y + mon.h - H - 44);
  if (y < mon.y) y = mon.y + 4;
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  Application.open({
    content: React.createElement(SysMonitorWindow),
    title: 'sys-monitor',
    width: W,
    height: H,
    x: fx,
    y: fy,
    center: false,
    modal: false,
    alwaysOnTop: true,
    decorations: false,
    resizable: false,
    tag: TAG,
    onFocused: (focused: boolean) => {
      if (!focused && !pinned) closeSysMonitor(); // 仅悬浮态失焦即关；钉住态保留
    },
  });
  if (!pinned) {
    Application.tray.armDismiss(
      { x: fx * scale, y: fy * scale, w: W * scale, h: H * scale },
      () => Application.closeTag(TAG),
    );
  }
}
