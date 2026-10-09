// MARKDOWN：轻量 Markdown 渲染器。DemoPage 多段式，覆盖 标题/段落 / 列表 / 代码块 / 引用/分割线 / 表格 / 混合文档。
import React from 'react';
import { View, Text, useToken } from 'react-native-flux-desktop';
import { Markdown } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const MD_HEADINGS = `# 一级标题
## 二级标题
### 三级标题

这是一段普通文本，包含 **粗体**、*斜体*、\`行内代码\` 和 [链接](https://example.com)。`;

const MD_LISTS = `## 无序列表
- 第一项
- 第二项含 **粗体**
- 第三项

## 有序列表
1. 步骤一
2. 步骤二
3. 步骤三`;

const MD_CODE = '## 代码块\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\n\n```python\nprint("hello world")\n```';

const MD_QUOTE = `## 引用与分割线

> 这是一段引用文字
> 支持多行

---

分割线下方是普通段落。`;

const MD_TABLE = `## 表格（GFM）

| 组件 | 批次 | 状态 |
|------|:----:|-----:|
| Form | 三 | 已完成 |
| **TagInput** | 五 | 已完成 |
| Search | 六 | \`本批\` |

列对齐：表头分隔行的 \`:\` 位置决定左/中/右对齐。`;

const MD_FULL = `# React Native Flux

> 一套 **token 驱动** 的自绘桌面组件库

## 特性

- 零依赖原生渲染（Skia + Yoga）
- 支持 \`dark\` / \`light\` / \`compact\` 主题切换
- 60+ 组件开箱即用

## 快速开始

\`\`\`bash
npm install react-native-flux-desktop
\`\`\`

1. 引入 FluxProvider
2. 使用组件
3. 自定义主题

---

详细文档请访问 [GitHub](https://github.com)。`;

const DEMOS: DemoItem[] = [
  {
    name: '标题与行内',
    desc: 'h1-h3 + 粗体/斜体/行内代码/链接',
    node: <Markdown content={MD_HEADINGS} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// # / ## / ### 标题 + **粗体** *斜体* `行内代码` [链接](url)',
      "const md = '# 一级标题\\n\\n含 **粗体**、*斜体*、`code` 和 [链接](https://example.com)。';",
      '<Markdown content={md} />',
    ].join('\n'),
  },
  {
    name: '列表',
    desc: '无序列表(-) + 有序列表(1.)',
    node: <Markdown content={MD_LISTS} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// 无序 - / 有序 1. 列表',
      "const md = '- 第一项\\n- 第二项含 **粗体**\\n\\n1. 步骤一\\n2. 步骤二';",
      '<Markdown content={md} />',
    ].join('\n'),
  },
  {
    name: '代码块',
    desc: 'fenced code with language tag，复用 CodeBlock 高亮',
    node: <Markdown content={MD_CODE} style={{ maxWidth: 500 }} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// fenced ```lang 代码块，复用 CodeBlock 语法高亮',
      '<Markdown content={MD_CODE} style={{ maxWidth: 500 }} />',
    ].join('\n'),
  },
  {
    name: '引用与分割线',
    desc: 'blockquote + hr',
    node: <Markdown content={MD_QUOTE} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// > 引用（可多行） + --- 分割线',
      "const md = '> 一段引用\\n\\n---\\n\\n分割线下方是普通段落。';",
      '<Markdown content={md} />',
    ].join('\n'),
  },
  {
    name: '表格',
    desc: 'GFM 管道语法 + : 对齐标记 + 单元格内行内语法',
    node: <Markdown content={MD_TABLE} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// GFM 管道表格；表头分隔行的 : 位置决定左/中/右对齐',
      "const md = '| 组件 | 状态 |\\n|------|:----:|\\n| Form | 已完成 |';",
      '<Markdown content={md} />',
    ].join('\n'),
  },
  {
    name: '混合文档',
    desc: '完整 README 风格渲染',
    node: <Markdown content={MD_FULL} />,
    code: [
      'import { Markdown } from "react-native-flux-desktop";',
      '',
      '// 标题/列表/代码块/引用/表格 混排，整篇 README 一次渲染',
      '<Markdown content={README_MD} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'content', desc: 'Markdown 源文本', type: 'string', default: '–' },
  { name: 'defaultCodeLang', desc: '代码块默认语言', type: 'string', default: "'js'" },
];

const TOKENS: TokenRow[] = [
  { name: 'colorText', desc: '正文颜色', default: '–' },
  { name: 'colorPrimary', desc: '链接/列表标记色', default: '#3b82f6' },
  { name: 'fontSizeXL', desc: '大标题基准', default: '24' },
];

export function MarkdownDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
