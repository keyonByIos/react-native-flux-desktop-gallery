// 系统 / 托盘：详解「自研托盘 + 自定义主题菜单弹窗」的显示逻辑、定位逻辑、跨平台差异，
// 并把「未实现 / 有问题」的条目全部列出。以文档为主，末尾给一个「弹一帧看看」的交互。
import React from 'react';
import { View, Text, Button, useToken } from 'react-native-flux-desktop';
import { Markdown } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem } from '../DemoPage';
import { StepFlow, type StepFlowItem } from './sys-steps';
import { openTrayMenu } from '../components/TrayMenu';

// ———————————————————————————————————————————— 文档正文 ————————————————————————————————————————————

/** 一、架构总览 */
const OVERVIEW_DOC = `
系统托盘 = 操作系统**通知区**里的一枚图标。本自绘栈没有原生控件树，托盘直接由 napi 插件里的原生 crate \`tray-icon\` 落地。

我们**刻意不挂原生右键菜单**（\`muda\` 的 PopupMenu）：它是系统级浮层，只跟随**操作系统**明暗，无法适配**应用内** dark/light 主题。于是所有交互（左/右/双击）都回抛给 JS，菜单 UI 改由**自有 token 组件自绘一扇无边框置顶小窗**承载。

## 分层职责

- **Rust \`tray.rs\`**：\`create_tray\`（RGBA 图标 + tooltip）建托盘；点击落进 tray-icon 的 crossbeam receiver；\`pump()\` 末尾 \`drain_tray_events()\` 只在**抬起(Up)**时映射为 \`{type:'tray',action,button,rect}\` JSON，经**专用 threadsafe function** 回抛 JS（与窗口事件共用同一条 16ms 泵）。
- **Rust \`menu_watch.rs\`**：与 OS 焦点无关的「点外面即关」监听（Windows 轮询 \`GetCursorPos\` + \`GetAsyncKeyState\`）。
- **TS \`app/tray.ts\`**：薄门面（EventEmitter）——\`create / onLeftClick / onDoubleClick / onRightClick / armDismiss / disarmDismiss\`；PNG→RGBA 用 \`@napi-rs/canvas\` 解码。**应用级行为不在此层**。
- **Shell（\`App.tsx\`）**：订阅 左/双击 → 唤主窗；右键 → \`openTrayMenu(rect)\`；并把菜单发来的意图（show/theme/quit）单点路由。
- **\`TrayMenu.tsx\`（gallery）**：那扇弹窗本身。

> 一句话：原生只负责「图标 + 发生了什么」，「长什么样 + 点了怎么办」全交给上层自绘与路由。
`;

/** 二、事件与显示流（右键到菜单出现） */
const PIPELINE: StepFlowItem[] = [
  { title: '右键托盘图标', desc: 'tray-icon 隐藏消息窗收到 WM_' },
  { title: 'drain_tray_events()', desc: '仅在 Up 映射 right-click，附 rect(物理像素)', important: true },
  { title: '专用 tsfn 回抛 JSON', desc: '与窗口事件共用同一条 16ms 泵' },
  { title: 'tray.ts 门面分发', desc: "ee.emit('right-click', ev)" },
  { title: 'Shell → openTrayMenu(rect)', desc: '先 closeMenu() 关旧窗 + 解除旧监听' },
  { title: '算坐标并 Application.open', desc: '物理÷scale→逻辑，右缘对齐，钳位', important: true },
  { title: 'TrayMenuWindow 渲染', desc: '自带 FluxProvider 订阅全局主题，明暗即时' },
  { title: 'armDismiss + onFocused', desc: '点外面即关 + 失焦即关双保险', important: true },
  { title: '点项 → trayBus 意图', desc: '回 Shell 路由 wake / 切主题 / 退出确认' },
];

/** 三、显示逻辑（弹窗渲染 / 几何对账 / 圆角 / 关闭） */
const RENDER_DOC = `
## 为什么几何必须「严丝合缝」

本栈上屏走 **softbuffer 的 XRGB8888**：**present 丢弃 alpha**，任何「没画到的像素」都是**纯黑**（\`with_transparent\` 能建出透明能力窗，但没有 \`UpdateLayeredWindow\` 的逐像素 alpha 通道，桌面穿透做不到）。

所以托盘菜单这扇小窗：**窗口高度必须精确等于内容高度**，否则底部/边角露黑。为此：

1. **全部几何尺寸用文件内固定常量**（\`ITEM_H / PAD_V / PAD_H / DIV_H / DIV_M / ITEM_PAD_H / ITEM_R / MENU_R / FONT / ICON_SIZE / ICON_GAP\`），**绝不取 token**——一旦取 token，切「紧凑密度」换肤会改变实际布局，与事先算死的窗口高脱节 → 重新露黑。
2. \`menuHeight() = 行数×ITEM_H + 分隔线×(DIV_H + 2×DIV_M) + 2×PAD_V\`，直接当作窗口高度传给 \`Application.open\`。
3. 内容 **铺满整窗**（外层 View 的 width/height 就是窗口尺寸），不留空隙。

## 圆角怎么处理（无 alpha 下的折中）

圆角外那圈像素无处可透，只能让它露**窗口自己的底色**而非黑。做法是两层：

- 外层 View 铺满整窗，涂 \`colorBgContainer\`（暗 #141414 / 亮 #ffffff）；
- 内层 View \`flex:1\`，涂 \`colorBgElevated\`（暗 #1f1f1f / 亮 #ffffff）+ \`borderRadius = MENU_R\`。

于是圆角外是 container 底色：亮色下两色皆白（圆角几乎不可见但干净），暗色下呈 \`#141414\` vs \`#1f1f1f\` 的**极淡**轮廓，**不再是黑**。⚠️这是「伪造」圆角，真透明要等 alpha present 路径。

## 行内容与图标

\`MenuItem\` = 左图标 + 右文字（\`flexDirection:'row' + alignItems:'center'\`）：图标边长 \`ICON_SIZE = FONT\`（与文字同高），图标→文字间距 \`ICON_GAP\`，均常量；图标名取 \`paths.ts\` **已注册集**（\`monitor/sun/moon/power\`，缺名渲染空白）。**token 只用于颜色**（\`colorText/colorError/colorPrimaryBg/colorBgElevated/colorBgContainer/colorBorderSecondary\`）。

## 关闭的三条路（都走 closeMenu() = disarmDismiss + closeTag）

- 选中一项（\`pick\`）；
- 失焦（\`onFocused(false)\`，切到本进程其它窗 / alt-tab）；
- 点外面（\`armDismiss\` 命中原生轮询回调）。

> 单靠失焦**不够**：置顶无边框窗在 Windows 上点桌面/任务栏空白处常常**不会失焦**，故必须补一条与焦点无关的「点外面即关」轮询监听。
`;

/** 三附：几何常量代码（折叠） */
const GEOM_CODE = [
  '// TrayMenu.tsx —— 几何全常量，与 menuHeight() 严格对账（不取 token）',
  "const MENU_W = 220;   // 窗口宽（逻辑像素）",
  "const ITEM_H  = 34;   // 每行高",
  "const PAD_V   = 4;    // 容器上下内边距",
  "const PAD_H   = 8;    // 容器左右内边距",
  "const DIV_H   = 1;    // 分隔线粗",
  "const DIV_M   = 5;    // 分隔线上/下 margin",
  "const ITEM_PAD_H = 12; const ITEM_R = 6; const MENU_R = 8;",
  "const FONT = 14; const ICON_SIZE = FONT; const ICON_GAP = 8;",
  "",
  "// 3 行 1 分隔线 → 3*34 + (1+2*5) + 2*4 = 102 + 11 + 8 = 121（即窗口高）",
  "function menuHeight(): number {",
  "  const dividers = ROWS.filter(r => r.dividerBefore).length;",
  "  return ROWS.length * ITEM_H + dividers * (DIV_H + 2 * DIV_M) + PAD_V * 2;",
  "}",
].join('\n');

/** 四、定位逻辑（当前 Windows 实现） */
const POSITION_DOC = `
tray-icon 在 Click/DoubleClick 事件里带一个 \`rect\`：图标在**虚拟桌面**上的 \`Rect{ position: PhysicalPosition<f64>(x,y), size: PhysicalSize<u32>(w,h) }\`——**物理像素**。而 \`Window\` 的 x/y 是该显示器的**逻辑像素**。故定位 = **物理→逻辑换算 + 选展开方向 + 夹回工作区**。

## 现状（只覆盖 Windows 底部任务栏）

\`\`\`text
scale = getMainWindowScale()          // 主窗 dpr（假设托盘与主窗同屏）
H     = menuHeight()
// 右缘对齐图标右缘：
x = (rect.x + rect.w) / scale - MENU_W
// 底边贴图标上方（菜单向上开）：
y = rect.y / scale - H - 2
// 夹回屏内（mon = 主窗 getMonitorSize()，是整块屏幕、未扣任务栏）：
x = clamp(x, mon.x, mon.x + mon.w - MENU_W)
y = min(y, mon.y + mon.h - H - 44)    // 底部硬留 44px 当任务栏
if (y < mon.y) y = mon.y + 4
\`\`\`

- **无 rect 时**（如 Linux KSNI）回退：屏幕右下角 heuristic 摆放。
- 菜单是短生命窗，每次右键先 \`closeMenu()\` 关旧再按最新坐标开新。

## 这套公式的隐含假设（= 已知问题的根源）

1. **同屏**：用主窗的 \`scale\` 与主窗所在显示器的 \`getMonitorSize()\`；托盘在**另一台显示器**（尤其不同 DPI / 负坐标）时会算错。
2. **底栏**：\`-44\` 与「向上开」都写死了「任务栏在底部」；栏在顶/左/右、或高度不同/自动隐藏，就盖栏或留空。
3. **全屏≠工作区**：\`getMonitorSize()\` 返回整块屏幕，**不含工作区扣减**，才需要手动 \`-44\` 兜底；正解应取**工作区**（monitor 减去预留栏）。
`;

/** 五、任务栏/Dock 不在底部怎么算（通用算法） */
const DOCK_DOC = `
要让菜单在任何平台、栏在任意一边都摆对，把上面三条假设换成**通用算法**：

## 第 1 步：确定「图标所在显示器 + 该屏 scale + 该屏工作区」

- **Windows**：\`MonitorFromPoint(rect 中心物理点)\` 取显示器；该屏 \`GetDpiForMonitor\` 得 scale；\`GetMonitorInfo\` 的 **rcWork**（已扣任务栏）即工作区。
- **macOS**：遍历 \`NSScreen\`，用 \`visibleFrame\`（已扣菜单栏 + Dock）；status item 恒在**顶部菜单栏右侧**。
- **Linux**：KDE/KSNI 走 \`StatusNotifierItem\` 几何或 \`xrandr\` 屏几何；工作区靠桌面环境的 struts / \`_NET_WORKAREA\`。

## 第 2 步：判断栏在哪条边 → 决定展开方向

用「图标贴近哪条屏幕边」判定（比较图标中心到四边距离），菜单**朝屏幕内侧展开**：

\`\`\`text
下边栏(Windows 默认) → 向上开：y = iconTop/scale - H - gap;  右缘对齐 x=(iconRight)/scale - MENU_W
上边栏(macOS 菜单栏)  → 向下开：y = iconBottom/scale + gap;   右缘对齐 x=(iconRight)/scale - MENU_W
左边栏(左侧 Dock)     → 向右开：x = iconRight/scale + gap;    顶对齐   y = iconTop/scale
右边栏(右侧 Dock)     → 向左开：x = iconLeft/scale - MENU_W - gap; 顶对齐 y = iconTop/scale
\`\`\`

要点：
- **主轴**（栏所在边垂直方向）留 \`gap\`（常量，如 2~4px），菜单整体落在**工作区**那一侧。
- **副轴**（沿栏方向）把菜单近端对齐图标；靠近屏幕角时用**右缘/下缘对齐**避免甩出对侧，再夹到工作区。
- macOS 的 status item 在右上，**向下 + 右缘对齐**；Linux 面板可在四边，按第 2 步分支。

## 第 3 步：夹回「工作区」而非整屏

\`\`\`text
x = clamp(x, wa.x, wa.x + wa.w - MENU_W)
y = clamp(y, wa.y, wa.y + wa.h - H)      // wa = 工作区，无需再硬 -44
\`\`\`

## 第 4 步：坐标域一致（易错点）

- 事件 \`rect\`、\`GetCursorPos\`（点外面监听）都是**物理像素**，跨屏时含**负原点**；窗口 x/y 是**逻辑像素**。
- 「点外面即关」装的矩形也要用**物理**（逻辑 × 该屏 scale）传入，才和 \`GetCursorPos\` 同域比较。
- 换算用**图标所在屏的 scale**，不是主窗 scale。
`;

// ———————————————————————————————————————————— 跨平台矩阵 & 问题清单 ————————————————————————————————————————————

type Row = { cells: string[]; tone?: 'ok' | 'warn' | 'bad' };

/** 通用小表：列宽（flex）+ 行；tone 给状态列着色（本自绘栈无 md table，手写） */
function MiniTable(props: { cols: { label: string; flex: number }[]; rows: Row[][] }): React.ReactElement {
  const { token } = useToken();
  const { cols, rows } = props;
  const toneColor = (t?: Row['tone']): string =>
    t === 'ok' ? token.colorSuccess : t === 'warn' ? token.colorWarning : t === 'bad' ? token.colorError : token.colorTextSecondary;
  return (
    <View style={{ borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', paddingVertical: token.paddingXS, paddingHorizontal: token.paddingSM, backgroundColor: token.colorFillQuaternary }}>
        {cols.map((c, i) => (
          <View key={i} style={{ flex: c.flex, paddingRight: token.paddingXS }}>
            <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorText }}>{c.label}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', paddingVertical: token.paddingXS, paddingHorizontal: token.paddingSM, borderTopWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: ri % 2 === 1 ? token.colorFillQuaternary : 'transparent' }}>
          {row.map((cellObj, ci) => (
            <View key={ci} style={{ flex: cols[ci].flex, paddingRight: token.paddingXS }}>
              <Text style={{ fontSize: token.fontSizeSM, fontWeight: ci === 0 ? '600' : '400', color: ci === 0 ? token.colorText : toneColor(cellObj.tone) }}>
                {cellObj.cells[0]}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** 平台矩阵数据：各后端对 事件 / rect / 双击 / 托盘边 的真实支持（依据 tray-icon 文档） */
function PlatformMatrix(): React.ReactElement {
  const cols = [
    { label: '后端', flex: 1.5 },
    { label: '左键', flex: 0.8 },
    { label: '右键', flex: 0.8 },
    { label: '双击', flex: 1.0 },
    { label: 'rect 矩形', flex: 1.1 },
    { label: '托盘所在边', flex: 1.3 },
    { label: '菜单应朝', flex: 1.1 },
  ];
  const cell = (s: string, tone?: Row['tone']): Row => ({ cells: [s], tone });
  const rows: Row[][] = [
    [cell('Windows 通知区'), cell('支持', 'ok'), cell('支持', 'ok'), cell('仅此平台', 'ok'), cell('提供', 'ok'), cell('通常底部', 'warn'), cell('上开', 'ok')],
    [cell('macOS 菜单栏'), cell('支持', 'ok'), cell('支持', 'ok'), cell('无', 'bad'), cell('提供', 'ok'), cell('顶部右侧', 'warn'), cell('应下开(未做)', 'bad')],
    [cell('Linux KSNI'), cell('左/中', 'warn'), cell('宿主吞掉', 'bad'), cell('无', 'bad'), cell('空', 'bad'), cell('面板四边可', 'warn'), cell('未适配', 'bad')],
    [cell('Linux AppIndicator'), cell('不发事件', 'bad'), cell('仅弹原生菜单', 'bad'), cell('无', 'bad'), cell('空', 'bad'), cell('—', 'warn'), cell('未适配', 'bad')],
  ];
  return <MiniTable cols={cols} rows={rows} />;
}

/** 问题清单：类别 chip + 标题 + 说明 */
function IssueRow(props: { kind: string; kindTone: 'bad' | 'warn'; title: string; body: string }): React.ReactElement {
  const { token } = useToken();
  const { kind, kindTone, title, body } = props;
  const bg = kindTone === 'bad' ? token.colorError : token.colorWarning;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: token.paddingXS, borderTopWidth: token.lineWidth, borderColor: token.colorBorderSecondary }}>
      <View style={{ minWidth: 62, marginRight: token.marginSM, marginTop: 2 }}>
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: token.paddingXXS, paddingVertical: 1, borderRadius: token.borderRadiusSM, backgroundColor: bg + '22', borderWidth: token.lineWidth, borderColor: bg }}>
          <Text style={{ fontSize: token.fontSizeSM, color: bg, fontWeight: '600' }}>{kind}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{title}</Text>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginTop: 2, lineHeight: token.lineHeight * token.fontSizeSM }}>{body}</Text>
      </View>
    </View>
  );
}

const ISSUES: { kind: string; tone: 'bad' | 'warn'; title: string; body: string }[] = [
  { kind: '未实现', tone: 'bad', title: 'Linux KSNI 右键不投递', body: 'StatusNotifier 宿主自行处理右键、不给应用；且协议不提供 rect。结果：右键根本不弹我们的菜单，且只能靠无 rect 回退角落。' },
  { kind: '未实现', tone: 'bad', title: 'Linux AppIndicator 无事件', body: '该后端不 emit 任何点击事件（右键只会弹系统原生菜单）。托盘在这些桌面近乎「只显示图标」，需改走 AppIndicator 注册才有右键。' },
  { kind: '未适配', tone: 'bad', title: 'macOS 向上开=顶出屏', body: '现公式 y=iconTop/scale-H 对顶部菜单栏会把菜单顶到屏幕外、被钳到 mon.y+4 压住菜单栏。macOS 应「向下 + 右缘对齐」（见定位文档第 2 步），尚未实现。' },
  { kind: '有问题', tone: 'bad', title: '只用主窗 scale / 主屏', body: '取主窗 getMainWindowScale() 与主窗 getMonitorSize()，假设托盘与主窗同屏。托盘在另一显示器（不同 DPI 或负原点）时坐标与尺寸都算错。应按图标点选所在屏 + 该屏 scale。' },
  { kind: '有问题', tone: 'bad', title: '底部 44px 硬编码', body: '「向上开 + 底边留 44px」写死为 Windows 底部任务栏。栏在顶/左/右、更高、或自动隐藏时会盖栏或留大片空。正解：取该屏工作区(rcWork/visibleFrame)夹取，而非整屏 -44。' },
  { kind: '限制', tone: 'warn', title: '双击仅 Windows', body: 'DoubleClick 变体只 Windows 发；macOS/Linux 双击退化成两次 Click。当前左键单击与双击都映射「唤主窗」，重叠无害，但语义上无法在 mac/Linux 区分双击。' },
  { kind: '限制', tone: 'warn', title: '圆角是伪造、无真透明', body: 'softbuffer XRGB present 丢 alpha，圆角外只能露容器底色、透不出桌面。真·穿透圆角需实现 UpdateLayeredWindow 逐像素 alpha present（未做）。' },
  { kind: '边缘', tone: 'warn', title: '点外面靠 16ms 轮询', body: 'menu_watch 每 16ms 采样 GetCursorPos+GetAsyncKeyState；理论上「外点按下又在 <16ms 内松开」会漏采（人手点击一般 50–100ms，实测难触发）。且中/右键外点同样触发关闭（右键关后又会被新的右键重开）。' },
  { kind: '边缘', tone: 'warn', title: 'scale 首弹竞态', body: '主窗尚未 ready 时 getMainWindowScale() 回落 1，HiDPI 上第一次弹出位置可能偏；后续右键（先关后开）会纠正。' },
  { kind: '未实现', tone: 'bad', title: '无键盘可达性', body: '不支持 Esc 关闭、↑↓/Enter 选择、无焦点陷阱。原生托盘菜单通常具备。' },
  { kind: '未实现', tone: 'bad', title: '图标尺寸固定', body: '托盘图标恒 24 逻辑像素，未按各屏 DPI / 平台托盘规格缩放；macOS 模板图(单色 template)语义、Linux AppIndicator svg 主题化均未接。' },
  { kind: '限制', tone: 'warn', title: '只用 rect 未用 position', body: 'Click/DoubleClick 还带 position(物理点)，当前只用 rect；对 rect 为空的后端 position 同样缺，故无法用它兜底锚点。' },
];

function IssueList(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, borderRadius: token.borderRadiusLG, paddingHorizontal: token.paddingSM, paddingVertical: 2 }}>
      {ISSUES.map((it, i) => (
        <IssueRow key={i} kind={it.kind} kindTone={it.tone} title={it.title} body={it.body} />
      ))}
    </View>
  );
}

/** 实时：手动弹一帧（无 rect → 右下角回退定位，演示定位公式） */
function LivePopup(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexWrap: 'wrap' }}>
      <Button type="primary" onClick={() => openTrayMenu()}>弹出主题菜单（回退定位）</Button>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        不传 rect → 走「屏幕右下角」回退分支；真实右键会用图标 rect 精确锚定。失焦 / 点外面 / 选中项均可关闭。
      </Text>
    </View>
  );
}

// ———————————————————————————————————————————— 组装 ————————————————————————————————————————————

const DEMOS: DemoItem[] = [
  { name: '一、架构总览', desc: '为什么不用原生菜单；Rust/TS/Shell/弹窗 四层各管什么', node: <Markdown content={OVERVIEW_DOC} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// 不用原生菜单：自绘托盘菜单弹窗，四层协作',
      '// Rust（tray-icon 事件）/ TS（托盘总线）/ Shell（弹窗窗）/ 菜单组件',
      '<Markdown content={OVERVIEW_DOC} />',
    ].join('\n'),
  },
  { name: '二、事件与显示流', desc: '从「右键图标」到「菜单出现」的完整链路（含三处关闭）', node: <StepFlow steps={PIPELINE} />,
    code: [
      'import { StepFlow } from "./sys-steps";',
      '',
      '// 右键图标 → Rust 回抛 → 定位 rect → 开置顶无边框弹窗 → 菜单出现',
      '<StepFlow steps={PIPELINE} />',
    ].join('\n'),
  },
  { name: '三、显示逻辑（渲染与几何）', desc: '无 alpha 露黑 → 窗口高=内容高、几何全常量、圆角靠垫色、关闭三径', node: <Markdown content={RENDER_DOC} />, code: GEOM_CODE },
  { name: '四、定位逻辑（现状 Windows）', desc: '物理 rect ÷ scale → 逻辑，右缘对齐 + 向上开 + 夹屏内，及其三条隐含假设', node: <Markdown content={POSITION_DOC} />,
    code: [
      '// 物理 rect ÷ scale → 逻辑像素；右缘对齐 + 向上开 + 夹入屏内',
      'const x = rect.x / scale + rect.w / scale - menuW; // 右缘对齐',
      'const y = rect.y / scale - menuH;                 // 向上开',
      '// 隐含假设：主屏 / 任务栏在底 / scale 均匀，均待后续里程碑',
    ].join('\n'),
  },
  { name: '五、跨平台支持矩阵', desc: '各后端对 左/右/双击、rect、托盘边 的真实支持（依 tray-icon 文档）', node: <PlatformMatrix />,
    code: [
      '// 依 tray-icon 文档：各后端能力不一',
      '// Windows/macOS：左/右/双击齐；Linux(AppIndicator) 能力参差',
      '// rect（图标几何）仅部分平台回传；无 rect 时走右下角回退定位',
    ].join('\n'),
  },
  { name: '六、Dock/任务栏不在底部怎么算', desc: '通用四步：选屏+scale+工作区 → 判边定方向 → 夹工作区 → 坐标域一致（含四边公式）', node: <Markdown content={DOCK_DOC} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// 四步：选屏+scale+工作区 → 判边定方向 → 夹工作区 → 坐标域一致',
      '<Markdown content={DOCK_DOC} />',
    ].join('\n'),
  },
  { name: '七、未实现 / 已知问题清单', desc: '把所有踩坑与缺口摊开：未实现 / 有问题 / 限制 / 边缘', node: <IssueList />,
    code: [
      '// 当前已知缺口（供选型权衡）：',
      '// • 真透明/桌面穿透需 alpha present 路径（未接）',
      '// • 多屏 / 任务栏四边 / 非均匀 scale 的定位假设未全解',
      '// • Linux AppIndicator 右键 rect 回传能力参差',
    ].join('\n'),
  },
  { name: '八、实时弹一帧看看', desc: '手动触发（回退定位），观察置顶无边框菜单与关闭', node: <LivePopup />,
    code: [
      'import { openTrayMenu } from "../components/TrayMenu";',
      '',
      '// 不传 rect → 走「屏幕右下角」回退分支；真实右键会用图标 rect 锁定',
      'openTrayMenu();                 // 回退定位',
      '// openTrayMenu({ x, y, width, height }); // 锁定到图标 rect',
      '// 失焦 / 点外面 / 选中项 均可关闭',
    ].join('\n'),
  },
];

export function SysTrayDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
