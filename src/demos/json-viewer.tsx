// 开发 / JSON 树查看器：可折叠节点 + 类型着色 + 数组长度标 + 复制。面向接口响应 / 配置预览。
// 颜色全部走语义 token → 明暗主题自适应；字符串值含 CJK 时回退无衬线避免豆腐块。
import React from 'react';
import { View, Text, Segmented, useToken } from 'react-native-flux-desktop';
import { JsonViewer } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const RESPONSE: Record<string, unknown> = {
  code: 0,
  message: 'success',
  data: {
    user: { id: 10086, name: '张三', active: true, score: 98.5, tags: ['admin', 'vip', '内测'] },
    permissions: ['read', 'write', 'delete'],
    meta: { page: 1, size: 20, total: 0, hasNext: false },
    error: null,
  },
};

const CONFIG: Record<string, unknown> = {
  name: 'react-native-flux-desktop',
  version: '0.1.0',
  private: true,
  engines: { node: '>=18' },
  scripts: { start: 'tsc && node dist/example/Gallery.js', build: 'tsc' },
  dependencies: { react: '18.3.1', 'react-reconciler': '0.29.2' },
};

const MATRIX: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

/** 展开深度可切换，直观演示 defaultExpandedDepth。 */
function DepthDemo(): React.ReactElement {
  const [depth, setDepth] = React.useState(2);
  return (
    <View style={{ width: '100%', gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 13, color: '#999' }}>初始展开深度</Text>
        <Segmented options={['0', '1', '2', '3']} value={String(depth)} onChange={(v): void => setDepth(Number(v))} />
      </View>
      <JsonViewer data={RESPONSE} title="GET /api/user" defaultExpandedDepth={depth} />
    </View>
  );
}

/** 包一层保证 demo 宽度铺满 */
function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%' }}>{props.node}</View>;
}

const DEMOS: DemoItem[] = [
  {
    name: '接口响应',
    desc: '对象/数组嵌套，点 +/− 折叠展开；字符串绿 / 数字黄 / 布尔红 / null 灰 / key 主色',
    node: <Block node={<JsonViewer data={RESPONSE} title="GET /api/user" />} />,
    code: [
      'import { JsonViewer } from "react-native-flux-desktop";',
      '',
      '// 对象/数组嵌套，点 +/− 折叠；类型语义着色（明暗自适应）',
      'const data = { code: 0, message: \'success\', data: { user: { id: 10086, active: true } } };',
      '<JsonViewer data={data} title="GET /api/user" />',
    ].join('\n'),
  },
  {
    name: '展开深度',
    desc: 'defaultExpandedDepth 控制初始展开到第几层（含中文值自动回退字体）',
    node: <DepthDemo />,
    code: [
      'import { JsonViewer } from "react-native-flux-desktop";',
      '',
      '// defaultExpandedDepth 控制初始展开到第几层',
      '<JsonViewer data={data} defaultExpandedDepth={1} />',
    ].join('\n'),
  },
  {
    name: 'package.json',
    desc: '配置类数据；折叠节点显示 N keys 计数',
    node: <Block node={<JsonViewer data={CONFIG} title="package.json" defaultExpandedDepth={1} />} />,
    code: [
      'import { JsonViewer } from "react-native-flux-desktop";',
      '',
      '// 折叠节点显示 N keys 计数；copyable 右上角复制整份',
      '<JsonViewer data={CONFIG} title="package.json" defaultExpandedDepth={1} />',
    ].join('\n'),
  },
  {
    name: '数组',
    desc: '纯数组根：每项按索引、折叠显示 N items',
    node: <Block node={<JsonViewer data={MATRIX} title="matrix" />} />,
    code: [
      'import { JsonViewer } from "react-native-flux-desktop";',
      '',
      '// 纯数组根：每项按索引，折叠显示 N items',
      'const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];',
      '<JsonViewer data={matrix} title="matrix" />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'data', desc: '待展示数据（对象 / 数组 / 基本类型）', type: 'unknown', default: '–' },
  { name: 'title', desc: '头部左侧标题', type: 'string', default: '–' },
  { name: 'defaultExpandedDepth', desc: '初始展开到第几层（更深的折叠）', type: 'number', default: '2' },
  { name: 'copyable', desc: '右上角复制整份 JSON（格式化后）', type: 'boolean', default: 'true' },
  { name: 'fontSize', desc: '正文字号（行高 = fontSize × 1.7）', type: 'number', default: '13' },
];

const TOKENS: TokenRow[] = [
  { name: 'key', desc: '属性名取 colorPrimary（主题色）', default: '–' },
  { name: 'string', desc: '字符串值取 colorSuccess', default: '–' },
  { name: 'number', desc: '数字取 colorWarning', default: '–' },
  { name: 'boolean', desc: 'true / false 取 colorError', default: '–' },
  { name: 'null', desc: 'null / undefined 取 colorTextQuaternary', default: '–' },
  { name: 'punct', desc: '括号 / 冒号 / 逗号取 colorTextSecondary', default: '–' },
  { name: 'background', desc: '头部 colorFillTertiary、正文 colorFillQuaternary', default: '–' },
];

export function JsonViewerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
