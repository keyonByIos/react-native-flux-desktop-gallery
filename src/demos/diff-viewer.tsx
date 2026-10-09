// 开发 / 差异对比：行级 LCS diff，unified 单栏 + split 双栏，增删语义底色、行号对齐、折叠未变区。
// 颜色全走语义 token → 明暗主题自适应；行文本含 CJK 自动回退字体。
import React from 'react';
import { View, Text, Segmented } from 'react-native-flux-desktop';
import { DiffViewer } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const OLD_CODE = [
  'export function greet(name) {',
  '  const msg = "hello " + name;',
  '  console.log(msg);',
  '  return msg;',
  '}',
].join('\n');

const NEW_CODE = [
  'export function greet(name: string): string {',
  '  const msg = `hi, ${name}!`;',
  '',
  '  console.log(msg);',
  '  return msg;',
  '}',
].join('\n');

const OLD_DOC = [
  '# 变更日志',
  '',
  '## v1.0',
  '- 初版发布',
  '- 支持明暗主题',
  '- 图表组件 10 种',
  '- 终端组件',
  '- JSON 查看器',
  '- 代码块',
  '',
  '## 计划',
  '- 更多高阶组件',
].join('\n');

const NEW_DOC = [
  '# 变更日志',
  '',
  '## v1.1',
  '- 初版发布',
  '- 支持明暗主题',
  '- 图表组件 14 种',
  '- 终端组件',
  '- JSON 查看器',
  '- 代码块',
  '- 差异对比 DiffViewer',
  '',
  '## 计划',
  '- 命令面板',
].join('\n');

/** 布局切换。 */
function VariantDemo(): React.ReactElement {
  const [v, setV] = React.useState('unified');
  return (
    <View style={{ width: '100%', gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 13, color: '#999' }}>布局</Text>
        <Segmented options={['unified', 'split']} value={v} onChange={(val): void => setV(String(val))} />
      </View>
      <DiffViewer oldText={OLD_CODE} newText={NEW_CODE} title="greet.ts" variant={v as 'unified' | 'split'} />
    </View>
  );
}

/** 包一层保证 demo 宽度铺满 */
function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%' }}>{props.node}</View>;
}

const DEMOS: DemoItem[] = [
  {
    name: '单栏对比',
    desc: 'unified：[旧号][新号] + 前缀，增绿底 / 删红底；头部右侧 +N −M 统计',
    node: <Block node={<DiffViewer oldText={OLD_CODE} newText={NEW_CODE} title="greet.ts" />} />,
    code: [
      'import { DiffViewer } from "react-native-flux-desktop";',
      '',
      '// 行级 LCS diff；unified 单栏，增绿底 / 删红底',
      '<DiffViewer oldText={OLD_CODE} newText={NEW_CODE} title="greet.ts" />',
    ].join('\n'),
  },
  {
    name: '双栏对比',
    desc: 'split：左旧右新逐行对齐，一侧无内容补空白',
    node: <Block node={<DiffViewer oldText={OLD_CODE} newText={NEW_CODE} title="greet.ts" variant="split" />} />,
    code: [
      'import { DiffViewer } from "react-native-flux-desktop";',
      '',
      '// variant=split 左旧右新逐行对齐，一侧无内容补空白',
      '<DiffViewer oldText={OLD_CODE} newText={NEW_CODE} title="greet.ts" variant="split" />',
    ].join('\n'),
  },
  {
    name: '布局切换',
    desc: 'variant 实时切换 unified / split',
    node: <VariantDemo />,
    code: [
      'import { DiffViewer } from "react-native-flux-desktop";',
      '',
      '// variant 受控切换：unified / split',
      "const [v, setV] = React.useState('unified');",
      '<DiffViewer oldText={OLD_CODE} newText={NEW_CODE} variant={v} />',
    ].join('\n'),
  },
  {
    name: '折叠未变区',
    desc: 'context=3：长段未变折叠为「N 行未改动」（含中文行自动回退字体）',
    node: <Block node={<DiffViewer oldText={OLD_DOC} newText={NEW_DOC} title="CHANGELOG.md" context={1} />} />,
    code: [
      'import { DiffViewer } from "react-native-flux-desktop";',
      '',
      '// context 控制未变区折叠保留的上下行数（0 关闭折叠）',
      '<DiffViewer oldText={OLD_DOC} newText={NEW_DOC} title="CHANGELOG.md" context={1} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'oldText / newText', desc: '旧 / 新文本（\\n 分行，CRLF 归一）', type: 'string', default: '–' },
  { name: 'variant', desc: '布局：单栏 / 双栏', type: "'unified' | 'split'", default: "'unified'" },
  { name: 'title', desc: '头部左侧文件名', type: 'string', default: '–' },
  { name: 'context', desc: '未变区折叠上下文行数（0 关闭折叠）', type: 'number', default: '3' },
  { name: 'showLineNumbers', desc: '行号栏', type: 'boolean', default: 'true' },
  { name: 'fontSize', desc: '正文字号（行高 = fontSize × 1.6）', type: 'number', default: '13' },
];

const TOKENS: TokenRow[] = [
  { name: 'add', desc: '新增行底色取 colorSuccessBg、前缀 + 取 colorSuccess', default: '–' },
  { name: 'del', desc: '删除行底色取 colorErrorBg、前缀 − 取 colorError', default: '–' },
  { name: 'gutter', desc: '行号槽 colorFillQuaternary + colorTextQuaternary', default: '–' },
  { name: 'skip', desc: '折叠分隔条居中灰字', default: '–' },
  { name: 'background', desc: '头部 colorFillTertiary、正文 colorFillQuaternary', default: '–' },
];

export function DiffViewerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
