// 系统 / 多窗口：解释 Application 单例 + 每窗一 React 根 + 全局事件泵 + 纯 JS 模态事件门的架构，
// 并提供真实可用的命令式弹窗 / 模态锁 / 跨窗主题同步交互（复用 Application.open 开窗工厂）。
import React from 'react';
import { View, Text, Button, Tag, useToken, Application, FluxProvider, type AppThemeConfig } from 'react-native-flux-desktop';
import type { ThemeAlgorithm } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem } from '../DemoPage';

/** 一段说明文字 */
function Prose(props: { lines: string[] }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ marginTop: token.margin }}>
      {props.lines.map((l, i) => (
        <Text
          key={i}
          style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize * 1.4, marginBottom: token.marginXXS }}
        >
          {l}
        </Text>
      ))}
    </View>
  );
}

/** 订阅全局主题（每窗各自 React 根都会独立订阅同一份 Application.config） */
function useAppTheme(): AppThemeConfig {
  const [t, setT] = React.useState<AppThemeConfig>(Application.config.getTheme());
  React.useEffect(() => Application.config.subscribe((c) => setT(c.App.theme)), []);
  return t;
}

/** 给独立窗口的内容自带 FluxProvider（否则新根无主题、会是白底） */
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

/** 窗口注册表快照：读 Application.windows()，带刷新按钮（列表变化无常驻事件，手动刷新即可演示） */
function WindowList(): React.ReactElement {
  const { token } = useToken();
  const [recs, setRecs] = React.useState(() => Application.windows());
  const refresh = (): void => setRecs(Application.windows());
  return (
    <View>
      <Button size="small" onClick={refresh}>刷新窗口列表</Button>
      <View style={{ marginTop: token.marginSM }}>
        {recs.map((r) => (
          <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, marginTop: token.marginXS }}>
            <Tag >#{r.id}</Tag>
            <Text style={{ color: token.colorText, fontSize: token.fontSize, flex: 1 }}>{r.title}</Text>
            {r.tag ? <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}>tag: {r.tag}</Text> : null}
            {r.modal ? <Tag color="warning">模态</Tag> : null}
          </View>
        ))}
        {recs.length === 0 ? <Text style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}>（无登记窗口）</Text> : null}
      </View>
    </View>
  );
}

/** 弹出窗的内容（作为 Application.open 工厂包裹的 <Window> 子节点） */
function WindowBody(props: { heading: string; tag: string; modal: boolean }): React.ReactElement {
  const { token } = useToken();
  return (
    <Themed>
      <View style={{ flex: 1, padding: token.paddingLG, backgroundColor: token.colorBgContainer }}>
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorText, marginBottom: token.marginXS }}>
          {props.heading}
        </Text>
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize * 1.4, marginBottom: token.margin }}>
          由 Application.open 命令式弹出的独立窗口，自带 FluxProvider —— 随全局主题同步换肤。
          {props.modal ? '本窗为模态：未关闭前，主窗口的点击会被模态事件门吞掉。' : '本窗为普通子窗：主窗口仍可正常交互。'}
        </Text>
        <WindowList />
        <View style={{ flex: 1 }} />
        <Button danger onClick={() => Application.closeTag(props.tag)}>关闭本窗口</Button>
      </View>
    </Themed>
  );
}

/** 打开一扇子窗（modal 决定是否锁定其它窗） */
function openInfo(modal: boolean): void {
  const tag = modal ? 'mw-info-modal' : 'mw-info';
  if (Application.findByTag(tag)) return;
  Application.open({
    content: React.createElement(WindowBody, { heading: modal ? '模态子窗' : '普通子窗', tag, modal }),
    title: modal ? '多窗口 · 模态子窗' : '多窗口 · 普通子窗',
    width: 440,
    height: 380,
    x: 220,
    y: 160,
    modal,
    tag,
    parentId: Application.main()?.id,
  });
}

/** 跨窗主色同步：任一按钮改 Application.config.theme.primary → 所有窗口一起换肤 */
function ThemeSyncDemo(): React.ReactElement {
  const { token } = useToken();
  const colors = ['#3b82f6', '#22c55e', '#f97316', '#e11d48'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
      {colors.map((c) => (
        <Button key={c} type="primary" color={c} onClick={() => Application.config.setTheme({ primary: c })}>
          主色 {c}
        </Button>
      ))}
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '实时窗口注册表',
    desc: '每扇 WindowHost 建窗时自登记进 Application（含 id / 标题 / tag / modal），Application 统一增删查。(下方创建新的窗口，然后刷新查看 window list)',
    node: <WindowList />,
    code: [
      'import { Application } from "react-native-flux-desktop";',
      '',
      '// 任何地方 import 同一个 Application 单例（注册表 + 配置总线 + 模态栈）',
      'const wins = Application.list();            // 当前所有窗口',
      "const w = Application.findByTag('mw-info'); // 按 tag 查",
      'const main = Application.main();            // 主窗',
    ].join('\n'),
  },
  {
    name: '命令式弹出子窗（普通 / 模态）',
    desc: '点按钮真的开一扇新窗。模态窗打开期间，主窗输入被纯 JS 事件门拦截；关闭即恢复。',
    node: (
      <View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={() => openInfo(false)}>打开普通子窗</Button>
          <Button type="primary" onClick={() => openInfo(true)}>打开模态子窗（锁定主窗）</Button>
        </View>
        <Prose
          lines={[
            '· 试试：开「模态子窗」后去点主窗口的菜单/按钮 —— 没反应（被吞），关掉子窗后恢复。',
            '· 模态靠 App 模态栈 + host 各输入入口的 shouldBlockInput(id) 判定，不依赖 OS 原生模态 API，跨平台一致。',
          ]}
        />
      </View>
    ),
    code: [
      '// 开一扇子窗；modal=true 则锁住其它窗输入',
      "if (Application.findByTag(tag)) return;       // 幂等：已开则不重开",
      'Application.open({',
      '  content: <WindowBody modal={modal} />,',
      "  title: '子窗', tag, modal,",
      '});',
      '// 关窗：Application.closeTag(tag) / win.host.close()',
    ].join('\n'),
  },
  {
    name: '跨窗配置同步',
    desc: '每窗一个独立 React 根，但都订阅同一份 Application.config：改主色，所有窗口一起换肤。',
    node: (
      <View>
        <ThemeSyncDemo />
        <Prose lines={['· 先开着上面的子窗，再点这里换主色 —— 子窗与主窗会同步变色（同一份全局主题）。']} />
      </View>
    ),
    code: [
      '// 全局配置总线：一处 set 全窗刷新',
      'Application.config.set({ App: { theme: { token: { colorPrimary } } } });',
      '',
      '// 每窗订阅同一份 config',
      'Application.config.subscribe((c) => setTheme(c.App.theme));',
    ].join('\n'),
  },
  {
    name: '架构关键点',
    desc: '从单窗到多窗，改造只在 Rust 层，React/reconciler 早已支持多根。',
    node: (
      <Prose
        lines={[
          '· 全局 Application 单例：Application（注册表 + 配置总线 + 模态栈），任何地方 import { Application } 皆可用；它是叶子模块，不 import renderer/host 以防循环。',
          '· 每窗一 React 根：Application.open 走 renderer 注入的开窗工厂，各挂 createContainer + 独立 Set 容器；一个 <Window> 根对应一个 host。',
          '· Rust：App 由单 window 改 HashMap<u32,Entry>，每 Entry 含专属 Surface + 专属回调句柄 + size/mods；全局唯一 EventLoop 懒建复用。',
          '· 事件路由：pump() 一次泵全部窗事件，按 window_id 反查自增 id、用该窗 tsfn 回抛，每条 JSON 携 "win":id。',
          '· 配置总线：模块级 EventEmitter，get/set/subscribe 浅比较去抖；一处 set 全窗刷新。',
        ]}
      />
    ),
    code: [
      '// 多窗架构：只有 Rust 层改了单 window → HashMap<u32,Entry>',
      '// React/reconciler 早已支持多根：一个 <Window> = 一个 createContainer = 一个 host',
      '// Application 为叶子模块，不 import renderer/host 以防循环',
      '// 事件泵 pump() 按 window_id 反查，每条 JSON 携 "win":id 路由回对应窗',
    ].join('\n'),
  },
  {
    name: '原生层叠的取舍',
    desc: '里程碑以「新窗默认置顶 + JS 模态门」实现层叠，未强制原生父窗绑定。',
    node: (
      <Prose
        lines={[
          '· 自研底座暂未提供原生父窗绑定 API（OS 级 parent 窗口句柄等），故未强制原生父窗绑定。',
          '· 层叠靠：模态/子窗设 OS 级 AlwaysOnTop（不被普通主窗遮挡）+ 新窗默认置前 + 纯 JS 输入门锁主窗。',
          '· per-window 输入态（活动控制器 / 右键菜单 / 文本选区）目前仍是进程级单例，多窗并发交互为后续里程碑。',
        ]}
      />
    ),
    code: [
      '// 当前层叠策略（无原生父窗绑定）：',
      '// 1. 模态/子窗 → OS 级 AlwaysOnTop；2. 新窗默认置前；3. 纯 JS 输入门锁主窗',
      '// 局限：活动控制器/右键菜单/文本选区仍为进程级单例，多窗并发待后续里程碑',
    ].join('\n'),
  },
];

export function SysMultiwinDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
