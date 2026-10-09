// 系统 / 窗口 Window：演示 <Window> 的缩放开关、最小/最大尺寸约束、四阶段生命周期回调，
// 以及运行时的命令式窗口控制（Application.get(id).host.setResizable / setSize / getWindowState）。
import React from 'react';
import { View, Text, Button, Tag, useToken, Application, FluxProvider, type AppThemeConfig } from 'react-native-flux-desktop';
import type { ThemeAlgorithm } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem } from '../DemoPage';

/** 给独立窗口的内容自带 FluxProvider（否则新根无主题、会是白底） */
function useAppTheme(): AppThemeConfig {
  const [t, setT] = React.useState<AppThemeConfig>(Application.config.getTheme());
  React.useEffect(() => Application.config.subscribe((c) => setT(c.App.theme)), []);
  return t;
}
function Themed(props: { children: React.ReactNode }): React.ReactElement {
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
      {props.children}
    </FluxProvider>
  );
}

/** 时间戳：HH:mm:ss.SSS */
function stamp(): string {
  const d = new Date();
  const p = (n: number, l = 2): string => String(n).padStart(l, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

const STAGE_COLOR: Record<string, string> = {
  准备加载: '#8c8c8c',
  加载中: '#faad14',
  加载完成: '#52c41a',
  关闭: '#ff4d4f',
};

/** 生命周期事件（推入主窗时间线） */
interface LifeEvent {
  win: string;
  stage: string;
  at: string;
}

/** 生命周期时间线视图 */
function Timeline(props: { events: LifeEvent[] }): React.ReactElement {
  const { token } = useToken();
  if (props.events.length === 0) {
    return <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}>（尚无事件，点上方按钮开一扇带生命周期回调的窗口）</Text>;
  }
  return (
    <View>
      {props.events.map((e, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, marginTop: token.marginXXS }}>
          <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM, width: 96 }}>{e.at}</Text>
          <View style={{ width: 72 }}>
            <Text style={{ color: STAGE_COLOR[e.stage] ?? token.colorText, fontSize: token.fontSizeSM, fontWeight: '700' }}>{e.stage}</Text>
          </View>
          <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM, flex: 1 }}>{e.win}</Text>
        </View>
      ))}
    </View>
  );
}

/** 生命周期演示窗内容 */
function LifecycleBody(props: { tag: string }): React.ReactElement {
  const { token } = useToken();
  return (
    <Themed>
      <View style={{ flex: 1, padding: token.paddingLG, backgroundColor: token.colorBgContainer }}>
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorText, marginBottom: token.marginXS }}>
          生命周期演示窗
        </Text>
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize * 1.4, marginBottom: token.margin }}>
          本窗建窗前后与关闭时，会在主窗口时间线里依次记录「准备加载 → 加载中 → 加载完成」，关窗时记「关闭」。
          试着点下面的关闭按钮，回到主窗观察时间线追加。
        </Text>
        <View style={{ flex: 1 }} />
        <Button danger onClick={() => Application.closeTag(props.tag)}>关闭本窗口（触发 onClose）</Button>
      </View>
    </Themed>
  );
}

/** 属性演示窗内容（承载 resizable / min / max 说明） */
function ConstraintBody(props: { tag: string; heading: string; lines: string[] }): React.ReactElement {
  const { token } = useToken();
  return (
    <Themed>
      <View style={{ flex: 1, padding: token.paddingLG, backgroundColor: token.colorBgContainer }}>
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorText, marginBottom: token.marginXS }}>
          {props.heading}
        </Text>
        {props.lines.map((l, i) => (
          <Text key={i} style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize * 1.4, marginBottom: token.marginXXS }}>
            {l}
          </Text>
        ))}
        <View style={{ flex: 1 }} />
        <Button danger onClick={() => Application.closeTag(props.tag)}>关闭本窗口</Button>
      </View>
    </Themed>
  );
}

/** 生命周期 demo：开一扇回调窗，事件实时落到主窗时间线 */
function LifecycleDemo(): React.ReactElement {
  const { token } = useToken();
  const [events, setEvents] = React.useState<LifeEvent[]>([]);
  const push = (win: string, stage: string): void => setEvents((prev) => [...prev, { win, stage, at: stamp() }]);

  const open = (): void => {
    const tag = `sw-life-${Date.now()}`;
    push(tag, '准备加载');
    Application.open({
      content: React.createElement(LifecycleBody, { tag }),
      title: '窗口 · 生命周期',
      width: 420,
      height: 300,
      x: 200,
      y: 140,
      tag,
      parentId: Application.main()?.id,
      // onPreparing 在建窗句柄前触发；这里改由开窗动作即时记一次（等价时机），
      // 原生回调仍会补记，用不同措辞区分「(native)」后缀事件
      onLoading: () => push(`${tag} (native)`, '加载中'),
      onReady: () => push(`${tag} (native)`, '加载完成'),
      onClose: () => push(`${tag} (native)`, '关闭'),
    });
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: token.marginXS }}>
        <Button type="primary" onClick={open}>打开生命周期演示窗</Button>
        <Button onClick={() => setEvents([])}>清空时间线</Button>
      </View>
      <View style={{ marginTop: token.margin, padding: token.paddingSM, backgroundColor: token.colorFillQuaternary, borderRadius: token.borderRadiusSM }}>
        <Timeline events={events} />
      </View>
    </View>
  );
}

/** 缩放 / 尺寸约束 demo：开三种不同约束的窗 */
function ConstraintDemo(): React.ReactElement {
  const { token } = useToken();
  const openFixed = (): void => {
    const tag = 'sw-fixed';
    if (Application.findByTag(tag)) return;
    Application.open({
      content: React.createElement(ConstraintBody, {
        tag,
        heading: '禁止缩放窗',
        lines: ['resizable=false：边框拖拽与最大化按钮失效，窗口尺寸固定为 360×240。'],
      }),
      title: '窗口 · 禁止缩放',
      width: 360,
      height: 240,
      x: 160,
      y: 120,
      resizable: false,
      tag,
      parentId: Application.main()?.id,
    });
  };
  const openClamped = (): void => {
    const tag = 'sw-clamped';
    if (Application.findByTag(tag)) return;
    Application.open({
      content: React.createElement(ConstraintBody, {
        tag,
        heading: '尺寸约束窗',
        lines: ['min 300×200 / max 560×420：可拖拽缩放，但被限制在此区间内。'],
      }),
      title: '窗口 · 最小/最大约束',
      width: 420,
      height: 300,
      x: 180,
      y: 140,
      minWidth: 300,
      minHeight: 200,
      maxWidth: 560,
      maxHeight: 420,
      tag,
      parentId: Application.main()?.id,
    });
  };
  return (
    <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
      <Button onClick={openFixed}>打开禁止缩放窗</Button>
      <Button onClick={openClamped}>打开尺寸约束窗 (min/max)</Button>
    </View>
  );
}

/** 运行时命令式控制：对已开窗即时改缩放/尺寸并读回状态 */
function RuntimeControlDemo(): React.ReactElement {
  const { token } = useToken();
  const [state, setState] = React.useState<{ resizable: boolean; maximized: boolean; decorated: boolean; x: number; y: number; w: number; h: number } | null>(null);
  const [note, setNote] = React.useState('点「控制目标窗」按钮开一扇普通窗，再用下方按钮即时改其缩放/尺寸。');

  const ensureTarget = (): void => {
    const tag = 'sw-target';
    if (Application.findByTag(tag)) return;
    Application.open({
      content: React.createElement(ConstraintBody, {
        tag,
        heading: '命令式控制目标窗',
        lines: ['回到主窗口用「运行时控制」按钮即时改本窗的缩放开关 / 尺寸，无需重开。'],
      }),
      title: '窗口 · 控制目标',
      width: 400,
      height: 280,
      x: 220,
      y: 160,
      tag,
      parentId: Application.main()?.id,
    });
  };

  const host = (): any => {
    const r = Application.findByTag('sw-target');
    return r ? r.host : null;
  };

  const act = (fn: (h: any) => string): void => {
    const h = host();
    if (!h) {
      setNote('目标窗未打开，请先点「控制目标窗」。');
      return;
    }
    setNote(fn(h));
  };

  const refresh = (): void => {
    const h = host();
    if (!h) {
      setState(null);
      setNote('目标窗未打开。');
      return;
    }
    setState(h.getWindowState());
  };

  return (
    <View style={{ gap: token.marginXS }}>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        <Button onClick={ensureTarget}>控制目标窗</Button>
        <Button onClick={() => act((h) => { h.setResizable(true); refresh(); return '已允许缩放。'; })}>允许缩放</Button>
        <Button onClick={() => act((h) => { h.setResizable(false); refresh(); return '已禁止缩放。'; })}>禁止缩放</Button>
      </View>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        <Button onClick={() => act((h) => { h.setSize(520, 360); refresh(); return '尺寸设为 520×360。'; })}>设为 520×360</Button>
        <Button onClick={() => act((h) => { h.setMinSize(320, 240); return '最小尺寸设为 320×240。'; })}>设最小 320×240</Button>
        <Button onClick={() => act((h) => { h.setMaxSize(640, 480); return '最大尺寸设为 640×480。'; })}>设最大 640×480</Button>
        <Button onClick={() => act((h) => { h.setMinSize(null, null); h.setMaxSize(null, null); return '已清除 min/max 约束。'; })}>清除约束</Button>
        <Button onClick={refresh}>读取当前状态</Button>
      </View>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        <Button onClick={() => act((h) => { h.maximize(); refresh(); return '已最大化。'; })}>最大化</Button>
        <Button onClick={() => act((h) => { h.restore(); refresh(); return '已还原。'; })}>还原</Button>
        <Button onClick={() => act((h) => { h.minimize(); return '已最小化到任务栏（点任务栏恢复）。'; })}>最小化</Button>
        <Button onClick={() => act((h) => { h.setDecorations(!h.isDecorated()); refresh(); return '已切换标题栏/边框。'; })}>切换无边框</Button>
      </View>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        <Button onClick={() => act((h) => { h.center(); refresh(); return '已在主显示器居中。'; })}>居中</Button>
        <Button onClick={() => act((h) => { h.setPosition(80, 80); refresh(); return '已移到 (80, 80)。'; })}>移到 (80, 80)</Button>
        <Button onClick={() => act((h) => { h.setPosition(400, 260); refresh(); return '已移到 (400, 260)。'; })}>移到 (400, 260)</Button>
      </View>
      <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM }}>{note}</Text>
      {state ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, flexWrap: 'wrap' }}>
          <Tag color={state.resizable ? 'success' : 'default'}>{state.resizable ? '可缩放' : '锁定尺寸'}</Tag>
          <Tag color={state.maximized ? 'processing' : 'default'}>{state.maximized ? '最大化中' : '普通态'}</Tag>
          <Tag color={state.decorated ? 'blue' : 'warning'}>{state.decorated ? '有标题栏' : '无边框'}</Tag>
          <Text style={{ color: token.colorText, fontSize: token.fontSizeSM }}>
            当前内尺寸：{Math.round(state.w)} × {Math.round(state.h)}
          </Text>
          <Text style={{ color: token.colorText, fontSize: token.fontSizeSM }}>
            位置：({Math.round(state.x)}, {Math.round(state.y)})
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** 无标题窗内容：自带一个手画顶栏（标题 + 最小化/最大化/关闭），因系统标题栏已去掉 */
function BorderlessBody(props: { tag: string; lines: string[] }): React.ReactElement {
  const { token } = useToken();
  const rec = (): any => {
    const r = Application.findByTag(props.tag);
    return r ? r.host : null;
  };
  return (
    <Themed>
      <View style={{ flex: 1, backgroundColor: token.colorBgContainer }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: token.paddingSM, height: 36, backgroundColor: token.colorFillSecondary }}>
          <Text style={{ color: token.colorText, fontSize: token.fontSize, fontWeight: '600' }}>无标题窗 · 手画顶栏</Text>
          <View style={{ flexDirection: 'row', gap: token.marginXXS }}>
            <Button size="small" onClick={() => rec()?.minimize()}>—</Button>
            <Button size="small" onClick={() => { const h = rec(); if (h) h.setMaximized(!h.isMaximized()); }}>□</Button>
            <Button size="small" danger onClick={() => Application.closeTag(props.tag)}>✕</Button>
          </View>
        </View>
        <View style={{ flex: 1, padding: token.paddingLG }}>
          {props.lines.map((l, i) => (
            <Text key={i} style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize * 1.4, marginBottom: token.marginXXS }}>
              {l}
            </Text>
          ))}
        </View>
      </View>
    </Themed>
  );
}

/** 风格窗 demo：建窗时指定 最大化 / 无标题 / 无背景 */
function StyleDemo(): React.ReactElement {
  const { token } = useToken();
  const openMax = (): void => {
    const tag = 'sw-max';
    if (Application.findByTag(tag)) return;
    Application.open({
      content: React.createElement(ConstraintBody, { tag, heading: '初始最大化窗', lines: ['maximized=true：建窗即铺满工作区。可点任务栏/标题栏还原。'] }),
      title: '窗口 · 初始最大化',
      width: 640,
      height: 420,
      maximized: true,
      tag,
      parentId: Application.main()?.id,
    });
  };
  const openBorderless = (): void => {
    const tag = 'sw-borderless';
    if (Application.findByTag(tag)) return;
    Application.open({
      content: React.createElement(BorderlessBody, { tag, lines: ['decorations=false：系统标题栏/边框已去掉，上方顶栏与按钮全由组件自绘。', '注意：无系统拖动，本底座未接 drag_window，故不能拖边移动（仅演示去标题栏）。'] }),
      title: '窗口 · 无标题',
      width: 460,
      height: 300,
      x: 240,
      y: 180,
      decorations: false,
      tag,
      parentId: Application.main()?.id,
    });
  };
  const openTransparent = (): void => {
    const tag = 'sw-transparent';
    if (Application.findByTag(tag)) return;
    Application.open({
      content: React.createElement(ConstraintBody, { tag, heading: '透明能力窗', lines: ['transparent=true：建为无背景/透明能力窗。', '当前软栅格（softbuffer XRGB）上屏丢 alpha，未绘制区暂黑，真桌面穿透待 alpha present 路径。'] }),
      title: '窗口 · 无背景/透明',
      width: 420,
      height: 280,
      x: 260,
      y: 200,
      transparent: true,
      tag,
      parentId: Application.main()?.id,
    });
  };
  return (
    <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
      <Button onClick={openMax}>打开初始最大化窗</Button>
      <Button onClick={openBorderless}>打开无标题窗（无边框）</Button>
      <Button onClick={openTransparent}>打开无背景/透明窗</Button>
    </View>
  );
}

/** 位置 / 居中 demo：无 x/y 默认居中、center=false 退回 OS 摆放、读主显示器尺寸 */
function PositionDemo(): React.ReactElement {
  const { token } = useToken();
  const [note, setNote] = React.useState('主窗（本 Gallery）未传 x/y → 启动即居中。下面子窗演示同一默认策略。');
  const openCentered = (): void => {
    const tag = 'sw-center';
    if (Application.findByTag(tag)) return;
    Application.open({
      content: React.createElement(ConstraintBody, { tag, heading: '默认居中窗', lines: ['未传 x/y → 自动在主显示器居中（主窗 / 对话框的默认行为）。'] }),
      title: '窗口 · 默认居中',
      width: 380,
      height: 260,
      tag,
      parentId: Application.main()?.id,
    });
    setNote('已打开「默认居中窗」：无 x/y，落在屏幕正中。');
  };
  const openCascade = (): void => {
    const tag = 'sw-cascade';
    if (Application.findByTag(tag)) return;
    Application.open({
      content: React.createElement(ConstraintBody, { tag, heading: 'OS 层叠窗', lines: ['center=false 且无 x/y → 退回操作系统默认摆放（通常左上/层叠）。'] }),
      title: '窗口 · OS 默认摆放',
      width: 380,
      height: 260,
      center: false,
      tag,
      parentId: Application.main()?.id,
    });
    setNote('已打开「OS 层叠窗」：center=false，交系统摆放。');
  };
  const readMonitor = (): void => {
    const m = Application.main()?.host?.getMonitorSize?.();
    if (!m || (!m.w && !m.h)) {
      setNote('未能读取主显示器尺寸（native 未就绪）。');
      return;
    }
    setNote(`主显示器（逻辑像素）：${Math.round(m.w)} × ${Math.round(m.h)}，原点 (${Math.round(m.x)}, ${Math.round(m.y)})。`);
  };
  return (
    <View style={{ gap: token.marginXS }}>
      <View style={{ flexDirection: 'row', gap: token.marginXS, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={openCentered}>打开默认居中窗（无 x/y）</Button>
        <Button onClick={openCascade}>打开 OS 默认摆放窗（center=false）</Button>
        <Button onClick={readMonitor}>读取主显示器尺寸</Button>
      </View>
      <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM }}>{note}</Text>
    </View>
  );
}

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

const DEMOS: DemoItem[] = [
  {
    name: '生命周期回调',
    desc: 'onPreparing / onLoading / onReady / onClose：准备加载 → 加载中 → 加载完成 → 关闭，四阶段实时落到主窗时间线。',
    node: (
      <View>
        <LifecycleDemo />
        <Prose
          lines={[
            '· 准备加载：WindowHost 构造、尚未申请原生窗口句柄前触发（建窗开销前）。',
            '· 加载中：原生窗口已创建、内容首帧尚未上屏时触发。',
            '· 加载完成：首帧成功贴屏后触发一次（renderFrame 首次 present 后）。',
            '· 关闭：窗口销毁 / 用户点 X / Application.closeTag 时触发一次。',
          ]}
        />
      </View>
    ),
    code: [
      'import { Application } from "react-native-flux-desktop";',
      '',
      '// 四阶段生命周期回调随 Application.open 指定',
      'Application.open({',
      '  content: <MyWindowBody />,',
      '  tag: \'life-win\',',
      '  onPreparing: () => log(\'准备加载\'), // 建窗句柄前',
      '  onLoading: () => log(\'加载中\'),   // 窗口已建、首帧未上屏',
      '  onReady: () => log(\'加载完成\'),   // 首帧成功贴屏',
      '  onClose: () => log(\'关闭\'),       // 销毁 / 点 X',
      '});',
    ].join('\n'),
  },
  {
    name: '是否允许缩放（resizable）',
    desc: 'resizable=false 关闭用户拖拽缩放与最大化；建窗时设定，或运行时用 host.setResizable 即时切换。',
    node: (
      <View>
        <ConstraintDemo />
        <Prose lines={['· 「禁止缩放窗」边框拖不动、最大化按钮灰掉；「尺寸约束窗」可缩放但被 min/max 夹住。']} />
      </View>
    ),
    code: [
      '// 建窗时关闭缩放：边框拖不动、最大化按钮置灰',
      'Application.open({ content: <Body />, tag: \'fixed\', resizable: false });',
      '',
      '// 运行时即时切换',
      "const win = Application.findByTag('fixed');",
      'win?.host.setResizable(true);',
    ].join('\n'),
  },
  {
    name: '最大 / 最小尺寸（min / max）',
    desc: 'minWidth/minHeight、maxWidth/maxHeight（逻辑像素，任一维可单独给）。建窗时随 Application.open 透传。',
    node: (
      <Prose
        lines={[
          '· 约束经 WindowProps → WindowHost 构造 → WinitWindow → 原生 set_min_inner_size / set_max_inner_size 落地。',
          '· 传 null / 未给该维 = 不设；两维都空 = 清除限制（见下方运行时「清除约束」。',
        ]}
      />
    ),
    code: [
      '// 逻辑像素，任一维可单独给；建窗时随 Application.open 透传',
      'Application.open({',
      '  content: <Body />, tag: \'clamped\',',
      '  minWidth: 320, minHeight: 200,',
      '  maxWidth: 800, maxHeight: 600,',
      '});',
      '// 运行时 host.setMinMax(320, 200, 800, 600)；传 null 清除',
    ].join('\n'),
  },
  {
    name: '最大化 / 无标题 / 无背景（建窗风格）',
    desc: 'maximized 初始最大化、decorations=false 去标题栏边框、transparent 无背景能力窗。均可建窗时随 Application.open 指定。',
    node: (
      <View>
        <StyleDemo />
        <Prose
          lines={[
            '· 最大化/最小化：走底座 set_maximized / set_minimized；无标题走 with_decorations(false)。',
            '· 无背景：with_transparent 建透明能力窗，但当前 softbuffer XRGB 上屏丢 alpha，未绘制区暂黑（非桌面穿透）；真透明需 alpha present 路径，属后续里程碑。',
          ]}
        />
      </View>
    ),
    code: [
      '// 建窗风格三开关',
      "Application.open({ content: <Body />, tag: 'max', maximized: true });     // 初始最大化",
      "Application.open({ content: <Body />, tag: 'bl', decorations: false });   // 去标题栏/边框",
      "Application.open({ content: <Body />, tag: 'tp', transparent: true });    // 无背景能力窗",
    ].join('\n'),
  },
  {
    name: '窗口位置与居中',
    desc: '主窗/子窗未传 x/y 时默认在主显示器居中；center=false 退回 OS 摆放；运行时可 host.center() / setPosition(x,y)。',
    node: (
      <View>
        <PositionDemo />
        <Prose
          lines={[
            '· 默认策略：host 构造时若 x/y 均缺省则置 center=true，建窗后调原生 center_window 按主显示器尺寸与外框尺寸居中（底座暂无 with_center，只能建窗后 set_outer_position）。',
            '· 显式给 x/y = 用你传的坐标定位（子窗/级联窗错位），不再居中。center=false 强制交回 OS。',
            '· 居中基于主显示器工作区物理尺寸，高 DPI 下按 scale 换算，坐标兑底不为负。',
          ]}
        />
      </View>
    ),
    code: [
      '// 未传 x/y → 默认主显示器居中；center=false 退回 OS 摆放',
      "Application.open({ content: <Body />, tag: 'c' });                 // 居中",
      "Application.open({ content: <Body />, tag: 'os', center: false }); // 交回 OS",
      "Application.open({ content: <Body />, tag: 'p', x: 200, y: 120 }); // 显式坐标",
      '// 运行时：win.host.center() / win.host.setPosition(400, 300)',
    ].join('\n'),
  },
  {
    name: '运行时命令式控制',
    desc: '对已打开的窗口即时改缩放 / 尺寸 / min-max / 最大化 / 最小化 / 无边框，并读回窗口当前状态（Application.get(id).host.*）。',
    node: <RuntimeControlDemo />,
    code: [
      '// 拿到已开窗口的 host，命令式控制（Application.get(id) / findByTag）',
      "const win = Application.findByTag('target');",
      'const host = win?.host;',
      'host?.setResizable(false);        // 锁缩放',
      'host?.setSize(640, 480);          // 改尺寸',
      'host?.setMinMax(320, 200, 900, 700); // 改上下限',
      'host?.setMaximized(true);         // 最大化',
      'host?.setMinimized(true);         // 最小化',
      'host?.setDecorations(false);      // 无边框',
      'const st = host?.getWindowState(); // 读回当前状态',
    ].join('\n'),
  },
];

export function SysWindowDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
