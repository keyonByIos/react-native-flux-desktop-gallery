// 系统 / 事件：先讲清「无 DOM 的事件从哪来、怎么派发」的原理与两条循环，再逐个事件讲解，
// 最后用一个可交互的「命中→向上归一」演示把所谓「冒泡」讲透（本栈没有 DOM 的捕获/冒泡广播）。
import React from 'react';
import { View, Text, useToken, Pressable } from 'react-native-flux-desktop';
import { Markdown } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem } from '../DemoPage';
import { StepFlow, type StepFlowItem } from './sys-steps';

// ———————————————————————————————————————————— 文档正文 ————————————————————————————————————————————

/** 一、原理总览 */
const PRINCIPLE_DOC = `
本栈**没有 DOM、没有原生控件树**：一扇窗只是一块软栅格画布。这里的"事件"不是浏览器的 \`addEventListener\`，而是两条链路接起来的：

1. **底座回抛原始信号**：原生层（Napi addon）把操作系统的鼠标 / 键盘 / 滚轮 / 输入法 / 文件拖放 / 焦点等，归一成 JSON，经**一条每 16ms 的事件泵**批量回抛给 JS。原始类型只有十来个：\`resize / mousemove / mouse / wheel / key / ime / drop / focus / mouseleave / closed\`。
2. **host 自研命中派发**：JS 拿到一个 \`(x, y)\` 后，由我们自己的 \`hitTest\` 在**场景树**上算出命中的最上层节点，再决定回调谁。

> 一句话：\`原始信号 → 命中测试(hitTest) → 沿 parent 链向上归一到"最近有能力的所有者"(find\*) → 调用它的回调\`。**不存在**浏览器那种「事件对象在整条 DOM 路径上两阶段传播」。

## 为什么必须自己派发

底座只给到「窗口级的原始输入」（哪个键、在窗口内的坐标），**它不知道也不关心你的界面结构**。哪块像素属于哪个组件、按钮点没点中、滚轮该滚哪个容器——全是 host 拿着布局结果（Yoga 算好的每个节点绝对盒）自己判定的。这也是为什么"点击命中"要处理 \`zIndex\` 浮层、滚动裁剪、\`pointerEvents:'none'\` 穿透这些 DOM 白送的语义。
`;

/** 二、两条循环（事件泵 + 帧渲染） */
const LOOP_STEPS: StepFlowItem[] = [
  { title: 'OS 原始输入进入窗口消息队列', desc: '鼠标/键盘/滚轮…（底座线程，非 JS）' },
  { title: 'JS 定时器每 16ms 调 pump()', desc: '底座抽取一批消息并派发（进程内共享唯一一条泵）', important: true },
  { title: '按 window_id 用该窗 tsfn 回抛 JSON', desc: '多窗共用一条泵，各窗只认自己那条流' },
  { title: 'winit-window._normalize 归一', desc: "raw → resize / mouse / wheel / key / ime / drop / focus …", important: true },
  { title: 'host.on(...) 处理', desc: 'onPress / onMouseMove / onWheel / onKey …' },
  { title: 'hitTest + find* 归一 → 组件回调', desc: '回调里 setState，触发一次重绘请求 scheduleFrame()' },
  { title: '帧循环：layout → paint → dispatch → present', desc: '多次 scheduleFrame 本帧只画一次；Yoga 布局 + Skia 光栅 + onLayout 派发 + softbuffer 上屏', important: true },
];

const LOOP_DOC = `
## 两环解耦

- **事件泵环（每 16ms）**：只负责「把 OS 输入收进来」。它由\`PumpCoordinator\` 维持的**进程内唯一一条定时器**驱动——多窗口绝不能各起一条（那会变成 N 倍重复泵 + 事件洪）。输入是**按帧批量到达**的，不是一个 OS 事件同步回调一次。
- **渲染环（scheduleFrame）**：事件处理里改状态后调 \`scheduleFrame()\` 请求重绘；同一帧内多次请求会被**合并成一次**。一次帧流水线是 \`布局(Yoga) → 光栅(Skia) → 派发 onLayout → 贴屏(softbuffer)\`。

> 关键点：**布局坐标是命中测试的前提**。 \`hitTest\` 用的 \`ax/ay/w/h\` 是上一帧布局的结果；所以「刚 resize 完立刻点」这类时序，靠的是每帧布局后回写绝对盒，再在下一拍泵里被读到。
`;

/** 三、命中 → 向上归一（派发模型） */
const DISPATCH_DOC = `
## 第 1 步：命中测试 hitTest(root, x, y)

深度遍历场景树，返回**包含该点的最上层可见节点**。规则：

- 不可见 / \`display:none\` / \`pointerEvents:'none'\` 的子树 → **跳过**（后者让点击**穿透**回正文，专供盖在文字上的高亮/浮层用）。
- 命中用节点的**绝对布局盒**（\`ax/ay/w/h\`，Yoga 的结果），不是浏览器的 \`clientRect\`。
- **裁剪链**：滚动容器与 \`overflow:hidden\` 祖先会把子孙"剪掉"，被剪掉的部分**不再命中**——否则滚出视口的内容会偷偷抢走顶部栏的点击。
- **层级**：\`zIndex>0\` 的浮层及其子树豁免裁剪、并优先于低层命中；同层按文档序靠后者覆盖靠前者。

## 第 2 步：沿 parent 链"向上归一"

命中的往往是一段文字、一枚图标这样的**叶子**，真正要响应的是**包着它的容器**。于是每种交互各有一条"向上找最近有能力祖先"的爬链函数（详见第五段的属性表）：\`findPressable / findScrollParent / findCursor / findEditable / findDraggable / findDroppable\`。

它们都从命中节点出发 \`while (cur) { …; cur = cur.parent }\`，**命中第一个满足条件的祖先就停**。

> 这就是本栈语义上的"冒泡"：点文字，响应的是外层 \`Pressable\`。但机制是**归一到唯一 owner**，不是「把事件广播给路径上每个祖先」。
`;

const DISPATCH_CODE = [
  '// host.ts —— 一次左键手势的完整派发（已略去拖拽/长按/选中分支）',
  'function onPress(x, y) {',
  '  if (inputBlocked()) return;            // 模态门：本窗被上层模态窗锁定 → 吞掉',
  '  const hit = hitTest(root, x, y);         // ① 命中最上层可见叶子',
  '  const ed  = findEditable(hit);           // ② 向上归一：可编辑字段？→ 落光标焦点',
  '  setActiveEditable(ed || null);',
  '  const target = findPressable(hit);       // ③ 向上归一：最近可按压祖先',
  '  pressed = target;                        // 记为按下者',
  '  if (target) target.props.onPressIn && target.props.onPressIn();',
  '}',
  '',
  'function onRelease(x, y) {',
  '  const up   = findPressable(hitTest(root, x, y));',
  '  const down = pressed; pressed = null;',
  '  if (down) {',
  "    down.props.onPressOut && down.props.onPressOut();       // 抬起无条件",
  '    if (up === down && down.props.onPress) down.props.onPress(); // RN 语义：按下=抬起同一元素才算一次点击',
  '  }',
  '}',
].join('\n');

/** 四、捕获 vs 冒泡（本栈真相） */
const BUBBLE_DOC = `
## 和浏览器 DOM 的根本差异

浏览器一次点击会走**捕获 → 目标 → 冒泡**：事件对象先由根向下传到叶（捕获），再由叶向上传回根（冒泡），路径上**每一个**监听器都会收到，任一环能 \`stopPropagation()\` 截断、\`preventDefault()\` 取消默认动作。

本栈**不是**这套：

- **没有独立的捕获阶段**，也**没有冒泡阶段的逐层广播**。
- **没有事件对象在链上传递**，也**没有 \`stopPropagation\` / \`preventDefault\`** 可用——因为每次手势在派发**之前**就已被 \`hitTest + find*\` **归一到了一个唯一 owner**，根本不存在「多个祖先都会收到同一个事件」的情形，自然无从截断。

## 那"冒泡"在本栈到底体现在哪？

只体现在**解析 owner 的那一次向上爬链**：命中子节点、能力挂在外层容器，靠 \`findPressable\` 从叶子往上走到**第一个**满足条件的祖先即停，把控制权交给它。观感上"像子事件冒泡到了父"，机制上是"归一"。

**嵌套两层都有 onPress 时**：外层和内层各是可按压祖先，命中内层区域时 \`findPressable\` 会先撞上**最近的**内层并停止 → 只触发内层，外层**收不到**。这与 DOM 冒泡（内→外都会触发）不同，第七段有可交互演示验证这点。

## 点击判定走 RN 语义（press & release 同元素）

- 按下 \`findPressable\` 命中即 \`onPressIn()\`，记为 \`pressed\`。
- 抬起再 \`findPressable\`；**先无条件** \`onPressOut()\`，**仅当抬起落在同一个 pressable**（\`up === down\`）才 \`onPress()\`。
- 所以"按在按钮上、拖到别处松手"**不会**触发 \`onPress\`——同 RN \`Pressable\`，与 DOM \`click\` 略不同。

## hover 的"独占"

\`onMouseEnter/onMouseLeave\` 挂在你爬到的那个 pressable 上；\`mousemove\` 里比较 \`hovered\` 与新目标，**只在跨边界时各触发一次**，同样不会逐层多播。
`;

/** 六、逐个事件讲解 */
const EVENTS_DOC = `
以下按「底座原始信号 → host 归一派发 → 组件回调」的口径，逐个讲。命中/爬链见第三段，本段只讲每个事件**何时发、发给谁、有什么坑**。

## 左键：onPressIn / onPressOut / onPress
按下时对命中叶子 \`findPressable\` 归一到最近可按压祖先 → \`onPressIn\`；抬起时 \`onPressOut\` 无条件、\`onPress\` 仅在**按下与抬起同一元素**时。整链只在**一个** owner 上发生。

## 悬停：onMouseEnter / onMouseLeave
\`mousemove\` → \`hitTest → findPressable\` 得新目标，与上一 \`hovered\` 比较，跨边界才触发一次 leave/enter。同时 \`findCursor\` 顺路设光标（见下）。拖出窗口时 \`mouseleave\` 兜底清 \`hovered\`，否则悬停态残留。

## 光标形状：findCursor
\`mousemove\` 里 \`setCursor(findCursor(hit))\`：优先最近显式 \`style.cursor\`，否则**第一个交互祖先**给 \`pointer\`、禁用给 \`not-allowed\`，都没有则 \`default\`。与 \`findPressable\` 一致在"第一个交互祖先"处止步，故禁用按钮悬停即 \`not-allowed\`。

## 滚轮：onScroll（滚动）
\`wheel\` → \`findScrollParent(hitTest)\` 归一到最近滚动祖先；按 \`mode\`（pixel/line，line 每行折 \`WHEEL_LINE_PX\`）换算增量，钳到内容范围改 \`scrollX/Y\`，再回调 \`onScroll({ nativeEvent: { contentOffset, contentSize } })\`。\`horizontal\` 决定滚哪轴。命中不到滚动容器则**整条滚轮被丢弃**。

## 键盘：key
\`key\` 事件**不分发给焦点组件树**，而是送给 host 维护的**唯一活动可编辑字段**（\`setActiveEditable\`）的控制器（\`events/textinput\`）：可打印字符插入、\`Backspace/Enter/Tab/Escape\` 等特殊键按名识别。⚠️ 原生把部分命名键 \`to_text\` 成裸控制字符塞进 JSON 会解析失败→事件被静默丢，解析前已预转义（backspace 假死的真凶）。

## 输入法：ime
中文/日文等组合输入走 \`ime\`（\`start / composition / commit\` 等 action + 文本 + caret），同样只喂活动可编辑字段，绘制下划线合成态与候选光标。

## 文本选中：selectable（长按 / 右键 → 复制）
静态 \`Text\` 默认**不可选**，需 \`selectable\`。按下时若命中开了 \`selectable\` 的文本 → 埋 **500ms 长按**定时器（移动超阈取消）；或右键命中 → 立刻。到点后按行排矩形高亮 + 弹「复制」菜单（\`showTextSelection + showContextMenu\`）。

## 右键：上下文菜单
\`mouse(button:'right', action:'down')\` → \`onContextMenu\`：命中可编辑字段→聚焦并弹该字段的菜单（复制/粘贴等）；命中 \`selectable\` 文本→选中 + 复制菜单；否则收起已有菜单。**没有**给组件开放的 \`onContextMenu\` prop（当前是 host 内置语义）。

## 应用内拖拽：useDrag / useDrop
按下命中 \`__drag\` 源 → 埋候选；\`mousemove\` 越阈（5px）才 \`beginDrag\`（短按仍是普通点击），随后 \`moveDrag\` 跟随并 \`findDroppable\` 命中放置目标（\`y<中线?before:after\`），抬起 \`dropDrag\`。目标侧得到 enter/over/leave/drop。与 OS 文件拖入是**两条独立总线**。

## 操作系统文件拖入：drop
底座 \`DroppedFile/HoveredFile\` **只带路径、不带屏幕坐标**（底座版本限制）→ 无法多目标精确命中，故 \`events/drop\` 总线按「最后激活的单个目标」路由 \`onEnter/onLeave/onDrop\`，多文件在一个宏任务内聚合后一次回调。

## 窗口级：resize / focus / mouseleave / close
- \`resize\`：更新逻辑尺寸与 dpr、收右键菜单、清文本选中，再 \`scheduleFrame\`。
- \`focus\`：**先透传** \`onFocused(focused)\`（无框弹窗靠它"失焦即关"，如托盘菜单）；失焦还顺带终止拖拽/按压会话，防残影。
- \`mouseleave\`：拖出窗外释放收不到，会话就地终止。
- \`closed\`：窗销毁 → \`onClose\`；末窗关闭由 \`liveWindows\` 计数触发进程退出。

## 布局回调：onLayout / onLayoutAbs
非输入事件，但同属"派发"：host **每帧布局后比对**，仅当节点尺寸变化才回调 \`{ nativeEvent: { layout } }\`（\`onLayoutAbs\` 给窗口绝对坐标，供浮层协调器做命中判定）。不逐帧发，避免抖动。
`;

// ———————————————————————————————————————————— 表格 ————————————————————————————————————————————

type Row = { cells: string[]; tone?: 'ok' | 'warn' | 'bad' };

/** 通用小表：列宽(flex) + 行；本自绘栈无 md table，手写 View/Text */
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

const cell = (s: string, tone?: Row['tone']): Row => ({ cells: [s], tone });

/** 五、原始事件源：底座 raw → 归一事件 → host 处理 → 派发要点 */
function RawEventMatrix(): React.ReactElement {
  const cols = [
    { label: '底座原始', flex: 1.0 },
    { label: '归一事件', flex: 1.0 },
    { label: 'host 处理', flex: 1.1 },
    { label: '派发要点', flex: 2.3 },
  ];
  const rows: Row[][] = [
    [cell('mouse down(left)'), cell('mouse:down'), cell('onPress'), cell('hitTest → findEditable / findDraggable / findPressable 归一', 'ok')],
    [cell('mouse up(left)'), cell('mouse:up'), cell('onRelease'), cell('down&up 同元素才 onPress；否则只 onPressOut', 'warn')],
    [cell('mouse down(right)'), cell('—'), cell('onContextMenu'), cell('editable→复制菜单 / selectable→选中复制；无对外 prop', 'warn')],
    [cell('mousemove'), cell('mousemove'), cell('onMouseMove'), cell('setCursor(findCursor) + hover enter/leave + 拖拽跟随', 'ok')],
    [cell('wheel'), cell('wheel'), cell('onWheel'), cell('findScrollParent→改偏移+onScroll；无滚动祖先则丢弃', 'ok')],
    [cell('key'), cell('key'), cell('onKey'), cell('送唯一活动 editable 的控制器（非焦点组件树）', 'ok')],
    [cell('ime'), cell('ime'), cell('onIme'), cell('组合串写活动 editable', 'ok')],
    [cell('drop'), cell('drop'), cell('feedDrop'), cell('OS 文件→拖放总线；无坐标，按最后激活目标路由', 'warn')],
    [cell('resize'), cell('resize'), cell('host resize'), cell('更新尺寸+dpr，收菜单、清选中，scheduleFrame', 'ok')],
    [cell('focus'), cell('focus'), cell('onFocused'), cell('先透传（失焦即关）；失焦终止拖拽/按压会话', 'ok')],
    [cell('mouseleave'), cell('mouseleave'), cell('onMouseLeaveWindow'), cell('拖出窗外释放收不到→会话就地终止', 'warn')],
    [cell('closed'), cell('closed'), cell('onClose'), cell('窗销毁；末窗关闭触发进程退出', 'ok')],
  ];
  return <MiniTable cols={cols} rows={rows} />;
}

/** 七、组件事件属性一览 */
function PropMatrix(): React.ReactElement {
  const cols = [
    { label: '组件', flex: 1.0 },
    { label: '事件 prop', flex: 1.5 },
    { label: '触发时机', flex: 2.4 },
    { label: '解析依据', flex: 1.4 },
  ];
  const rows: Row[][] = [
    [cell('Pressable'), cell('onPress'), cell('按下与抬起落在同一可按压元素（RN 语义）'), cell('findPressable')],
    [cell('Pressable'), cell('onPressIn · onPressOut'), cell('按下即 In / 抬起即 Out（Out 无条件）'), cell('findPressable')],
    [cell('Pressable'), cell('onMouseEnter · Leave'), cell('跨入 / 离开 hover 边界，各一次'), cell('findPressable+hovered')],
    [cell('Pressable'), cell('disabled'), cell('禁用→不响应按下，光标 not-allowed'), cell('findPressable 跳过')],
    [cell('Text'), cell('onPress'), cell('点该文字或其容器'), cell('findPressable')],
    [cell('Text'), cell('selectable'), cell('长按 500ms 或右键 → 选中 + 复制菜单'), cell('findSelectable')],
    [cell('View'), cell("pointerEvents:'none'"), cell('本节点及子树不参与命中（点击穿透）'), cell('hitTest')],
    [cell('View'), cell('__drag · __drop'), cell('应用内拖拽源 / 放置目标（useDrag/useDrop 注入）'), cell('findDraggable/Droppable')],
    [cell('ScrollView'), cell('onScroll'), cell('滚轮改偏移后上报 contentOffset/Size'), cell('findScrollParent')],
    [cell('Window'), cell('onFocused'), cell('获/失焦（供无框弹窗"失焦即关"）'), cell('focus 透传')],
    [cell('Window'), cell('onPreparing/Loading/Ready/Close'), cell('四阶段生命周期各一次'), cell('host 直派')],
    [cell('Base'), cell('onLayout · onLayoutAbs'), cell('布局完成且尺寸变化时（非逐帧）'), cell('每帧 layout 后比对')],
  ];
  return <MiniTable cols={cols} rows={rows} />;
}

// ———————————————————————————————————————————— 可交互：命中→向上归一 ————————————————————————————————————————————

/** 第八段：把"归一不是广播"跑给你看 —— 点内层，只触发最近的 owner，外层收不到 */
function LiveBubbling(): React.ReactElement {
  const { token } = useToken();
  const [log, setLog] = React.useState<string[]>([]);
  const push = (label: string): void => setLog((prev) => [label, ...prev].slice(0, 9));

  const box = (bg: string): Record<string, unknown> => ({
    padding: token.paddingSM,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorder,
    backgroundColor: bg,
  });

  return (
    <View style={{ gap: token.marginSM }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        下例是**嵌套的两层 Pressable**，各自都挂 \`onPress\`。点内层：\`findPressable\` 从命中的叶子往上**先撞上最近的内层就停** → 只触发内层，外层收不到。
        这正是与 DOM 冒泡（内→外都会触发）的**关键区别**——本栈是"归一到唯一 owner"，没有逐层广播。
      </Text>

      <Pressable
        onPress={() => push('外层 onPress')}
        onPressIn={() => push('外层 onPressIn')}
        style={({ pressed }): any => [box(pressed ? token.colorFillTertiary : token.colorBgContainer), { gap: token.marginXS }]}
      >
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>外层 Pressable（空白处也算外层）</Text>

        <Pressable
          onPress={() => push('内层 onPress（外层不会触发！）')}
          onMouseEnter={() => push('内层 onMouseEnter')}
          onMouseLeave={() => push('内层 onMouseLeave')}
          style={({ pressed }): any => [box(pressed ? token.colorPrimaryBg : token.colorFillQuaternary)]}
        >
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>我是内层 Pressable 里的文字</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
            点这块文字/区域：命中叶子 → 归一到内层 → 只内层响应（悬停进出同样只挂内层）
          </Text>
        </Pressable>
      </Pressable>

      <View style={{ ...box(token.colorBgContainer), minHeight: 150 }}>
        <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorText, marginBottom: token.marginXXS }}>事件日志（最近触发者）</Text>
        {log.length === 0 ? (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>（还没有事件）</Text>
        ) : (
          log.map((l, i) => (
            <Text key={i} style={{ fontSize: token.fontSizeSM, color: i === 0 ? token.colorPrimary : token.colorTextSecondary }}>
              {l}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

// ———————————————————————————————————————————— 组装 ————————————————————————————————————————————

const DEMOS: DemoItem[] = [
  { name: '一、原理：事件从哪来、怎么派发', desc: '无 DOM/无原生控件树；底座回抛原始信号 → host 自研命中派发', node: <Markdown content={PRINCIPLE_DOC} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// 无 DOM：原生层把 OS 输入归一成 JSON，经 16ms 事件泵回抛',
      '// JS 拿 (x,y) 后由 hitTest 在场景树上算命中节点',
      '<Markdown content={PRINCIPLE_DOC} />',
    ].join('\n'),
  },
  { name: '二、两条循环（事件泵 + 帧渲染）', desc: '16ms 事件泵收输入、scheduleFrame 合并重绘；两环解耦', node: <><StepFlow steps={LOOP_STEPS} /><Markdown content={LOOP_DOC} /></>,
    code: [
      'import { StepFlow } from "./sys-steps";',
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// 事件泵：每 16ms 批量收输入；scheduleFrame：合并多次 setState 只排一帧',
      '<StepFlow steps={LOOP_STEPS} />',
      '<Markdown content={LOOP_DOC} />',
    ].join('\n'),
  },
  { name: '三、命中 → 向上归一（派发模型）', desc: 'hitTest 定位最上层叶子，find* 沿 parent 链归一到最近有能力祖先', node: <Markdown content={DISPATCH_DOC} />, code: DISPATCH_CODE },
  { name: '四、捕获 vs 冒泡（本栈真相）', desc: '没有两阶段、没有逐层广播、无 stopPropagation；RN press&release 语义', node: <Markdown content={BUBBLE_DOC} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// 本栈无 DOM 捕获/冒泡两阶段，也无 stopPropagation',
      '// onPress 只在 down&up 落在同一元素时触发（RN press&release 语义）',
      '<Markdown content={BUBBLE_DOC} />',
    ].join('\n'),
  },
  { name: '五、原始事件源', desc: '底座 raw → 归一事件 → host 处理 → 派发要点（十余种一览）', node: <RawEventMatrix />,
    code: [
      '// 底座原始类型仅十来个：resize/mousemove/mouse/wheel/key/ime/drop/focus/mouseleave/closed',
      '// 滚动：findScrollParent 向上找可滚祖先，改偏移后上报 onScroll',
      '<ScrollView onScroll={(e) => console.log(e.contentOffset)}>…</ScrollView>',
    ].join('\n'),
  },
  { name: '六、逐个事件讲解', desc: '指针/hover/光标/滚轮/键盘/IME/文本选中/右键/拖拽/OS 拖入/窗口级/布局回调', node: <Markdown content={EVENTS_DOC} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '<Markdown content={EVENTS_DOC} />',
    ].join('\n'),
  },
  { name: '七、组件事件属性一览', desc: '组件 × 事件 prop × 触发时机 × 解析依据（对外 API 速查）', node: <PropMatrix />,
    code: [
      '// Pressable：按下与抬起落在同一元素才 onPress（RN 语义，非 DOM 冒泡）',
      '<Pressable onPress={fn} onPressIn={fn} onPressOut={fn}',
      '  onMouseEnter={fn} onMouseLeave={fn} disabled={false} />',
      '// Text：selectable 长按/右键选中复制',
      '<Text selectable>可选文本</Text>',
      '// View：pointerEvents 控制命中穿透',
      "<View pointerEvents='none'>不参与命中</View>",
    ].join('\n'),
  },
  { name: '八、实时体验：归一不是广播', desc: '点嵌套两层 Pressable 的内层，验证外层收不到（与 DOM 冒泡的根本差异）', node: <LiveBubbling />,
    code: [
      'import { Pressable } from "react-native-flux-desktop";',
      '',
      '// 嵌套两层 Pressable：点内层，外层收不到 onPress',
      '// 命中后 findPressable 沿 parent 链归一到「最近一个」可按压祖先就停',
      '<Pressable onPress={() => log(\'outer\')}>',
      '  <Pressable onPress={() => log(\'inner\')}>',
      '    <Text>点我（只有 inner 触发）</Text>',
      '  </Pressable>',
      '</Pressable>',
    ].join('\n'),
  },
];

export function SysEventDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
