// 系统 / 字体：讲解本自绘栈的字体体系——app.json 声明字体资源、全局正文字体档（写偏好 + 重启）、
// 局部字体覆盖（style.fontFamily 即时生效），并内嵌两组可交互控件（局部选择器实时预览 / 全局选择器触发重启）。
// 豆腐兜底链是本框架选字体安全的关键，见正文第三节。
import React from 'react';
import { View, Text, Select, Input, useToken, Application, listFontFamilies, SANS_FAMILY, MONO_FAMILY } from 'react-native-flux-desktop';
import { Markdown } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem } from '../DemoPage';

/** 字体体系总述（Markdown）——反引号一律转义 */
const FONT_DOC = `
本框架的文字**度量与绘制同源**：布局（Yoga）与 \`fillText\` 都走 \`fontShorthand\`，故换字体后宽度、光标、选区会一起跟着变，不会错位。字体只能**按文件注册**（\`GlobalFonts.registerFromPath(路径, 别名)\`），没注册过的字体名直接写进 \`fontFamily\` 会在 Skia 里缺字变**豆腐块**。

## 一、app.json 声明字体资源

字体作为**应用资源**在 \`app.json\` 的 \`fonts\` 数组里声明，启动时注册成别名供全局/局部引用：

- \`file\` 可为**相对路径**（约定放 \`assets/fonts/\`，会被打包器自动内嵌进安装包）或**绝对路径**（如本页引用的 \`C:/Windows/Fonts/*.ttf\`，直接借用系统字体、零打包膨胀）。
- \`family\` 即注册后的**别名**，全局默认与局部 \`fontFamily\` 都用它引用。
- 可选 \`bold\` 指定粗体变体文件；缺省则粗体回落同族。

## 二、全局字体档 ↔ 局部字体覆盖（两条正交的路）

| | 载体 | 生效方式 | 作用面 |
|---|---|---|---|
| **全局** | app.json \`defaultFont\` / 偏好 \`App.prefs.font\` | 启动注入 → **改档需重启** | 全 App 所有**不写 fontFamily** 的正文（含 Input/TextArea） |
| **局部** | 节点 \`style.fontFamily\` | **即时生效**（React 重渲染该子树并重测） | 仅该节点及其文本 |

- **全局**改的是 painter 的「回落族」，不是给每个组件塞裸系统字体名——所以 \`Input\`、\`TextArea\` 这些**故意不写 fontFamily**（走已注册默认，防豆腐）的组件会自动跟随全局，且安全。
- **局部**给某个 \`Text\` 显式传 \`style={{ fontFamily: '黑体' }}\` 即覆盖，只影响它自己；code-block 等锁 \`Flux Mono\` 的组件不受全局正文档影响。

## 三、豆腐兜底链（选任意字体都安全的关键）

\`fontShorthand\` 组出的族链是：**主字体 → 内置含 CJK 的锚点（雅黑 Flux Sans）→ 彩色 emoji**。Skia 逐字形回退：

- 即便主字体**不含中文**（如本页的 \`Arial\` / \`Consolas\`），中文也自动落到雅黑，**不会变豆腐**；\`measureText\` 与 \`fillText\` 同链，宽度/光标仍一致。
- 这条链同时兜住了 Input 的豆腐隐患：你可以放心把全局默认选成 \`Arial\`，重启后中文照样显示。

## 四、对外接口

\`\`\`ts
// 全局正文字体：写偏好 App.prefs.font + 重启进程生效（字体在首帧前一次性注册）
// family 传内置别名（Flux Sans）即等效恢复默认
Application.setFont(family: string): void;

// 读当前全局字体（App.prefs.font，缺省 undefined=内置）
Application.config.getPrefs().font;

// 本次运行可用的字体族别名（内置 + app.json 注册成功的用户族）：喂给字体选择器
listFontFamilies(): string[];

// 局部覆盖：即时生效，不经任何接口
<Text style={{ fontFamily: "黑体" }}>…</Text>
\`\`\`
`;

/** 局部覆盖控件：选族即时套用 style.fontFamily 到预览区（只影响本区，热生效） */
function LocalCtl(): React.ReactElement {
  const { token } = useToken();
  const fams = React.useMemo(() => listFontFamilies(), []);
  const opts = fams.map((f: string) => ({ value: f, label: f === SANS_FAMILY ? `${f}（内置·雅黑）` : f === MONO_FAMILY ? `${f}（内置·等宽）` : f }));
  const [fam, setFam] = React.useState<string>(fams[0] ?? SANS_FAMILY);
  const box = { padding: token.padding, borderRadius: token.borderRadius, backgroundColor: token.colorFillQuaternary, gap: token.marginXS } as const;
  return (
    <View style={{ gap: token.margin }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.margin, flexWrap: 'wrap' }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>选择局部字体（即时生效，只改下方预览）</Text>
        <Select value={fam} onChange={(v) => setFam(String(v))} options={opts} style={{ width: 220 }} />
      </View>
      <View style={box}>
        <Text style={{ fontFamily: fam, fontSize: 22, fontWeight: '700', color: token.colorText }}>大标题 · The quick brown 0123 · 中文示例</Text>
        <Text style={{ fontFamily: fam, fontSize: token.fontSize, color: token.colorText }}>正文：君不见黄河之水天上来，奔流到海不复回。当前局部字体 = {fam}。</Text>
        <Text style={{ fontFamily: fam, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>副文本（小字号）1234567890 abcdefg · 表情 😀 混排 · <Text style={{ fontFamily: fam, fontStyle: 'italic' }}>italic</Text></Text>
        <Text style={{ fontFamily: fam, fontSize: token.fontSize, fontWeight: '700', color: token.colorText }}>粗体测试 Bold 中文加粗 —— 若该族注册了 Bold 变体则取之，否则回落同族。</Text>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        ↑ 这里的 {`<Input>`} 不在局部预览样式内：Input 内部固定走全局默认（无逐实例字体 API），故不受本选择器影响——正体现「局部只作用于显式传 fontFamily 的节点」。
      </Text>
      <Input defaultValue="我的字随「全局档」变、不随上面的局部选择器变" style={{ width: 360 }} />
    </View>
  );
}

/** 全局档控件：写偏好 + 重启；旁边放 Input 佐证全局会波及 Input */
function GlobalCtl(): React.ReactElement {
  const { token } = useToken();
  const [, bump] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => Application.config.subscribe(() => bump()), []);
  const fams = React.useMemo(() => listFontFamilies(), []);
  const cur = Application.config.getPrefs().font || SANS_FAMILY;
  const opts = fams.map((f: string) => ({ value: f, label: f === SANS_FAMILY ? `${f}（内置·雅黑）` : f === MONO_FAMILY ? `${f}（内置·等宽）` : f }));
  return (
    <View style={{ gap: token.margin }}>
      <Text style={{ fontSize: token.fontSize, color: token.colorText }}>当前全局字体：<Text style={{ fontWeight: '700', color: token.colorPrimary }}>{cur}</Text></Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.margin, flexWrap: 'wrap' }}>
        <Select value={cur} onChange={(v) => Application.setFont(String(v))} options={opts} style={{ width: 220 }} />
        <Input defaultValue="换全局档并重启后，我这行字会跟着变" style={{ width: 320 }} />
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        ⚠ 全局档改的是 painter 回落族，影响全 App 正文（含上面的 Input）。选择后写持久偏好并<b>自动重启应用</b>落地；想验证「不豆腐」，可选纯拉丁的 Arial / Consolas——中文照样走兜底链显示。
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '字体体系总述',
    desc: 'app.json 字体资源 + 全局/局部两条正交路 + 豆腐兜底链：讲清机制与接口',
    node: <Markdown content={FONT_DOC} />,
    code: [
      '// app.json：声明字体资源 + 全局默认',
      '{',
      '  "defaultFont": "黑体",',
      '  "fonts": [',
      '    { "family": "黑体", "file": "C:/Windows/Fonts/simhei.ttf" },',
      '    { "family": "MyBrand", "file": "assets/fonts/brand.ttf", "bold": "assets/fonts/brand-bold.ttf" }',
      '  ]',
      '}',
      '',
      '// 全局档：写偏好 + 重启（影响全 App 正文含 Input）',
      'Application.setFont("黑体");',
      '',
      '// 局部覆盖：即时生效',
      '<Text style={{ fontFamily: "MyBrand" }}>…</Text>',
    ].join('\n'),
  },
  {
    name: '局部字体（即时生效）',
    desc: '选族后 style.fontFamily 立刻套用到预览区，只影响该区；Input 不随局部选择器变（体现局部作用面）',
    node: <LocalCtl />,
    code: [
      'import { Text, Select, listFontFamilies } from "react-native-flux-desktop";',
      '',
      'const fams = listFontFamilies();',
      'const [fam, setFam] = React.useState(fams[0]);',
      '<Select value={fam} onChange={setFam} options={fams.map((f) => ({ value: f, label: f }))} />',
      '',
      '// 只作用于显式传 fontFamily 的节点，热生效',
      '<Text style={{ fontFamily: fam }}>正文…</Text>',
    ].join('\n'),
  },
  {
    name: '全局字体（改档重启）',
    desc: '写偏好 App.prefs.font + 重启，影响全 App 所有不写 fontFamily 的正文（含 Input/TextArea）。选 Arial 试豆腐兜底：中文仍显示。',
    node: <GlobalCtl />,
    code: [
      'import { Application, Select, listFontFamilies, SANS_FAMILY } from "react-native-flux-desktop";',
      '',
      'const cur = Application.config.getPrefs().font || SANS_FAMILY;',
      '<Select value={cur}',
      '  onChange={(v) => Application.setFont(String(v))} // 写偏好 + relaunch',
      '  options={listFontFamilies().map((f) => ({ value: f, label: f }))} />',
    ].join('\n'),
  },
];

export function SysFontDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} />;
}
