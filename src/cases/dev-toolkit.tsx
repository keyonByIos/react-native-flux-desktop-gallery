// cases/dev-toolkit.tsx —— 「开发者工具箱 Dev Toolkit」整合案例。
// 左=工具导航列表，右=当前工具主体；一次性秀出库自绘的整族「开发」组件（src/dev）。
// 覆盖组件：CodeBlock（多语言语法高亮 + 行号 + 复制）、Markdown（GFM 渲染）、JsonViewer（可折叠树）、
//   DiffViewer（unified/split 双栏对比）、RegexTester（实时匹配 + 替换预览）、CronParser（表达式解析 + 未来触发预览）、
//   TimeConverter（时间戳⇄日期 + 实时时钟）、LogViewer（6 级日志 + 级别过滤 + 搜索）、CommandPalette（模糊命令面板）。
// 与终端案例不同：工具箱是通用 App，故走 token 明暗自适应（代码类组件内部恒深色配色，属其自身主题）。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Icon,
  useToken,
  CodeBlock,
  Markdown,
  JsonViewer,
  DiffViewer,
  RegexTester,
  CronParser,
  TimeConverter,
  LogViewer,
  CommandPalette,
  type LogEntry,
  type CommandItem,
} from 'react-native-flux-desktop';

type FluxToken = ReturnType<typeof useToken>['token'];

const SIDEBAR_W = 248;

interface Tool {
  key: string;
  label: string;
  hint: string;
  icon: string;
}

const TOOLS: Tool[] = [
  { key: 'code', label: '代码高亮', hint: 'CodeBlock', icon: 'code' },
  { key: 'markdown', label: 'Markdown 渲染', hint: 'Markdown', icon: 'fileText' },
  { key: 'json', label: 'JSON 浏览器', hint: 'JsonViewer', icon: 'database' },
  { key: 'diff', label: 'Diff 对比', hint: 'DiffViewer', icon: 'layers' },
  { key: 'regex', label: '正则测试', hint: 'RegexTester', icon: 'search' },
  { key: 'cron', label: 'Cron 表达式', hint: 'CronParser', icon: 'clock' },
  { key: 'time', label: '时间戳转换', hint: 'TimeConverter', icon: 'timer' },
  { key: 'log', label: '日志查看器', hint: 'LogViewer', icon: 'alignLeft' },
  { key: 'cmd', label: '命令面板', hint: 'CommandPalette', icon: 'command' },
];

// —— 示例数据 ——
const CODE_SAMPLE = `// flux/ui/virtual-list.ts
import { useMemo, useRef } from 'react';

export function useVirtual<T>(items: T[], rowHeight: number, viewport: number) {
  const startRef = useRef(0);
  const count = Math.ceil(viewport / rowHeight) + 2;

  return useMemo(() => {
    const start = Math.max(0, startRef.current - 1);
    const end = Math.min(items.length, start + count);
    return {
      slice: items.slice(start, end),
      offsetY: start * rowHeight,
      totalHeight: items.length * rowHeight,
    };
  }, [items, count]);
}

// 万行列表仅渲染视口内 ~30 行，滚动零卡顿
`;

const MD_SAMPLE = `# Flux 桌面组件库

纯 **自绘** 的 React 桌面渲染栈，不依赖 WebView / DOM。

## 核心特性

- 自研 reconciler + Skia 光栅管线
- 一整套 \`ui\` / \`pro\` / \`chart\` / \`dev\` 组件族
- 多窗口 · 托盘 · 无边框自绘标题栏

## 快速开始

\`\`\`tsx
import { Window, Button } from 'react-native-flux-desktop';

export default () => (
  <Window title="Hello">
    <Button type="primary">点我</Button>
  </Window>
);
\`\`\`

> 提示：所有尺寸走 design token，明暗主题自适应。

| 能力 | 组件族 | 状态 |
| --- | --- | --- |
| 表格虚拟化 | VirtualList | 已就绪 |
| 终端仿真 | Terminal | 已就绪 |
`;

const JSON_SAMPLE = {
  app: 'react-native-flux-desktop',
  version: '1.4.0',
  windows: [
    { id: 'main', size: [1280, 640], resizable: true, frameless: false },
    { id: 'tray-widget', size: [280, 160], resizable: false, frameless: true },
  ],
  features: { gpu: true, kv: { engine: 'redb', ttl: 3600 }, charts: 30 },
  deps: ['react-reconciler', 'skia-canvas', 'node-pty'],
};

const DIFF_OLD = `function greet(name) {
  const msg = "Hello, " + name;
  console.log(msg);
  return msg;
}`;

const DIFF_NEW = `function greet(name: string): string {
  // 模板字符串更清晰
  const msg = \`Hello, \${name}!\`;
  logger.info(msg);
  return msg;
}`;

const REGEX_PATTERN = `(\\d{4})-(\\d{2})-(\\d{2})`;
const REGEX_TEXT = `发布记录：
2026-09-28 gallery v1.4 上线
2026-10-03 终端组件族合入
无效日期 2026-9-3 与 26/10/01 不应命中`;

const LOGS: LogEntry[] = [
  { time: '10:02:11', level: 'info', source: 'boot', message: 'Application started, 3 windows registered' },
  { time: '10:02:11', level: 'debug', source: 'kv', message: 'redb engine opened, table=cache' },
  { time: '10:02:13', level: 'info', source: 'net', message: 'Binance WS connected, latency=42ms' },
  { time: '10:02:20', level: 'warn', source: 'render', message: 'frame dropped, budget exceeded (18.2ms)' },
  { time: '10:02:21', level: 'debug', source: 'net', message: 're-subscribing 12 streams' },
  { time: '10:02:25', level: 'error', source: 'io', message: 'failed to write snapshot: EBUSY, retrying' },
  { time: '10:02:26', level: 'info', source: 'io', message: 'snapshot written on retry #2' },
  { time: '10:02:31', level: 'fatal', source: 'gpu', message: 'device lost, falling back to software raster' },
  { time: '10:02:32', level: 'info', source: 'gpu', message: 'software rasterizer active' },
  { time: '10:02:40', level: 'trace', source: 'render', message: 'paint 214 nodes in 6.1ms' },
];

const COMMANDS: CommandItem[] = [
  { id: 'new-win', label: '新建窗口', hint: 'Ctrl+N', group: '窗口', keywords: 'window create' },
  { id: 'close-win', label: '关闭当前窗口', hint: 'Ctrl+W', group: '窗口' },
  { id: 'toggle-theme', label: '切换明暗主题', hint: 'Ctrl+Shift+D', group: '外观', keywords: 'dark light theme' },
  { id: 'color', label: '打开主题色设置', group: '外观' },
  { id: 'reload', label: '重新加载内容', hint: 'F5', group: '开发', keywords: 'refresh reload' },
  { id: 'devtools', label: '切换调试面板', hint: 'F12', group: '开发', keywords: 'console devtool' },
  { id: 'quit', label: '退出应用', hint: 'Alt+F4', group: '系统' },
];

function ToolRow(props: { t: Tool; on: boolean; token: FluxToken; onPress: () => void }): React.ReactElement {
  const { t, on, token } = props;
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: token.borderRadiusLG ?? 8,
        backgroundColor: on ? (token.colorPrimaryBg ?? '#e6f4ff') : 'transparent',
        cursor: 'pointer',
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: on ? token.colorPrimary : token.colorBgLayout,
        }}
      >
        <Icon name={t.icon} size={15} color={on ? '#fff' : token.colorTextSecondary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13, fontWeight: on ? '600' : '500', color: token.colorText }} numberOfLines={1}>
          {t.label}
        </Text>
        <Text style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 1 }} numberOfLines={1}>
          {t.hint}
        </Text>
      </View>
    </Pressable>
  );
}

function ToolBody(props: { active: string; token: FluxToken }): React.ReactElement {
  const { active, token } = props;
  const wrap = { gap: token.marginLG ?? 16 };
  switch (active) {
    case 'code':
      return (
        <View style={wrap}>
          <CodeBlock code={CODE_SAMPLE} language="ts" title="useVirtual.ts" showLineNumbers highlightLines={[4, 12]} />
          <CodeBlock code={'npm install react-native-flux-desktop\nnpx flux dev --gpu'} language="bash" title="install.sh" showLineNumbers={false} />
        </View>
      );
    case 'markdown':
      return <Markdown content={MD_SAMPLE} />;
    case 'json':
      return <JsonViewer data={JSON_SAMPLE} title="package.json + 运行时快照" defaultExpandedDepth={2} />;
    case 'diff':
      return (
        <View style={wrap}>
          <DiffViewer oldText={DIFF_OLD} newText={DIFF_NEW} title="greet.ts (unified)" variant="unified" />
          <DiffViewer oldText={DIFF_OLD} newText={DIFF_NEW} title="greet.ts (split)" variant="split" />
        </View>
      );
    case 'regex':
      return <RegexTester defaultPattern={REGEX_PATTERN} defaultText={REGEX_TEXT} defaultFlags="g" defaultReplacement="$3/$2/$1" />;
    case 'cron':
      return <CronParser defaultValue="0 30 9 * * 1-5" previewCount={6} />;
    case 'time':
      return <TimeConverter liveClock defaultStamp="1759478400" />;
    case 'log':
      return <LogViewer logs={LOGS} height={420} defaultMinLevel="trace" />;
    case 'cmd':
      return <CommandPalette items={COMMANDS} placeholder="搜索命令…" maxResults={8} />;
    default:
      return <Text style={{ color: token.colorTextSecondary }}>未知工具</Text>;
  }
}

export function DevToolkitDemo(): React.ReactElement {
  const { token } = useToken();
  const [active, setActive] = React.useState<string>('code');
  const cur = TOOLS.find((t) => t.key === active) ?? TOOLS[0];

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: token.colorBgLayout }}>
      {/* 左：工具导航 */}
      <View
        style={{
          width: SIDEBAR_W,
          backgroundColor: token.colorBgContainer,
          borderRightWidth: 1,
          borderRightColor: token.colorBorderSecondary,
          paddingTop: 14,
          paddingBottom: 10,
          paddingHorizontal: 10,
          gap: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6, paddingBottom: 10 }}>
          <Icon name="tool" size={15} color={token.colorPrimary} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: token.colorText, letterSpacing: 0.6 }}>开发组件族 DEV</Text>
        </View>
        <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 2 }}>
            {TOOLS.map((t) => (
              <ToolRow key={t.key} t={t} on={t.key === active} token={token} onPress={() => setActive(t.key)} />
            ))}
          </View>
        </ScrollView>
        <Text style={{ fontSize: 11, color: token.colorTextSecondary, paddingHorizontal: 6, paddingTop: 8 }}>
          九件工具全部来自库自绘 dev 组件族
        </Text>
      </View>

      {/* 右：当前工具主体 */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: token.colorBorderSecondary,
            backgroundColor: token.colorBgContainer,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: token.colorText }}>{cur.label}</Text>
          <Text style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}>
            组件 <Text style={{ fontFamily: 'consolas', color: token.colorPrimary }}>{cur.hint}</Text> · 纯自绘渲染，明暗主题自适应
          </Text>
        </View>
        <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ padding: 20 }}>
          <ToolBody active={active} token={token} />
        </ScrollView>
      </View>
    </View>
  );
}
