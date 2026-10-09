// TREESELECT：树选择。统一走 DemoPage 多段式，覆盖 基础 / 尺寸 / 校验状态 / 多选 / 禁用 / 受控。
// 面板绝对定位覆盖，不占文档流；常驻展开段用固定高度容器预留空间。
import React from 'react';
import { TreeSelect, type TreeNode, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const TREE: TreeNode[] = [
  {
    key: 'zhejiang',
    title: '浙江',
    children: [
      { key: 'hangzhou', title: '杭州', children: [{ key: 'xihu', title: '西湖区' }, { key: 'binjiang', title: '滨江区' }] },
      { key: 'ningbo', title: '宁波' },
    ],
  },
  {
    key: 'jiangsu',
    title: '江苏',
    children: [
      { key: 'nanjing', title: '南京' },
      { key: 'suzhou', title: '苏州', disabled: true },
    ],
  },
];

const W = 260;
const MW = 300;

/** 基础：常驻展开，展示下拉树面板 */
function BasicDemo(): React.ReactElement {
  return (
    <View style={{}}>
      <TreeSelect treeData={TREE} defaultValue="hangzhou" allowClear placeholder="请选择地区" style={{ width: W }} />
    </View>
  );
}

/** 多选：checkable 树 + 标签，常驻展开 */
function MultipleDemo(): React.ReactElement {
  return (
    <View style={{ height: 320, width: MW }}>
      <TreeSelect treeData={TREE} multiple defaultValue={['hangzhou', 'nanjing']} allowClear open placeholder="多选地区" style={{ width: MW }} />
    </View>
  );
}

/** 受控：value + onChange 回显 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState<string | undefined>('suzhou');
  return (
    <View style={{ width: W, gap: token.marginSM }}>
      <TreeSelect treeData={TREE} value={v} onChange={(x) => setV(typeof x === 'string' ? x : undefined)} allowClear style={{ width: W }} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>当前：{v ?? '未选'}</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点触发器弹下拉树，点节点选中并收起；allowClear 可清除（此段常驻展开）',
    node: <BasicDemo />,
    code: [
      'import { TreeSelect } from "react-native-flux-desktop";',
      '',
      '// treeData 树形数据；点节点选中并收起',
      'const TREE = [',
      '  { key: \'zhejiang\', title: \'浙江\', children: [',
      '    { key: \'hangzhou\', title: \'杭州\' },',
      '  ] },',
      '];',
      '<TreeSelect treeData={TREE} defaultValue="hangzhou" allowClear placeholder="请选择地区" style={{ width: 260 }} />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = large / middle / small',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <TreeSelect treeData={TREE} defaultValue="hangzhou" size="large" style={{ width: 200 }} />
        <TreeSelect treeData={TREE} defaultValue="hangzhou" size="middle" style={{ width: 200 }} />
        <TreeSelect treeData={TREE} defaultValue="hangzhou" size="small" style={{ width: 200 }} />
      </View>
    ),
    code: [
      'import { TreeSelect } from "react-native-flux-desktop";',
      '',
      '// size = large / middle / small',
      '<TreeSelect treeData={TREE} defaultValue="hangzhou" size="large" style={{ width: 200 }} />',
      '<TreeSelect treeData={TREE} defaultValue="hangzhou" size="small" style={{ width: 200 }} />',
    ].join('\n'),
  },
  {
    name: '校验状态',
    desc: 'status = error / warning，描红 / 黄边',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <TreeSelect treeData={TREE} defaultValue="hangzhou" status="error" style={{ width: 240 }} />
        <TreeSelect treeData={TREE} defaultValue="nanjing" status="warning" style={{ width: 240 }} />
      </View>
    ),
    code: [
      'import { TreeSelect } from "react-native-flux-desktop";',
      '',
      '// status = error / warning 描红 / 黄边',
      '<TreeSelect treeData={TREE} defaultValue="hangzhou" status="error" style={{ width: 240 }} />',
      '<TreeSelect treeData={TREE} defaultValue="nanjing" status="warning" style={{ width: 240 }} />',
    ].join('\n'),
  },
  {
    name: '多选',
    desc: 'multiple 树切换为 checkable，触发器以标签展示（此段常驻展开）',
    node: <MultipleDemo />,
    code: [
      'import { TreeSelect } from "react-native-flux-desktop";',
      '',
      '// multiple 树切换为 checkable，触发器以标签展示',
      '<TreeSelect treeData={TREE} multiple defaultValue={[\'hangzhou\', \'nanjing\']} allowClear />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 整体灰显不可点；节点 disabled 单独禁用',
    node: <TreeSelect treeData={TREE} defaultValue="hangzhou" disabled style={{ width: W }} />,
    code: [
      'import { TreeSelect } from "react-native-flux-desktop";',
      '',
      '// disabled 整体灰显；节点 disabled 单独禁用',
      '<TreeSelect treeData={TREE} defaultValue="hangzhou" disabled style={{ width: 260 }} />',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange，选中项回显外部',
    node: <ControlledDemo />,
    code: [
      'import { TreeSelect } from "react-native-flux-desktop";',
      '',
      '// 受控：value + onChange',
      "const [v, setV] = React.useState<string>();",
      '<TreeSelect treeData={TREE} value={v} onChange={setV} allowClear style={{ width: 260 }} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'treeData', desc: '树形数据源', type: 'TreeNode[]', default: '–' },
  { name: 'value / defaultValue', desc: '受控 / 非受控选中（多选为数组）', type: "string | string[]", default: '–' },
  { name: 'multiple', desc: '多选（checkable 树 + 标签）', type: 'boolean', default: 'false' },
  { name: 'placeholder', desc: '未选占位符', type: 'string', default: "'请选择'" },
  { name: 'size', desc: '高度三档', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'status', desc: '校验状态', type: "'error' | 'warning'", default: '–' },
  { name: 'placement', desc: '弹出方向', type: "'bottomLeft'|'bottomRight'|'topLeft'|'topRight'", default: "'bottomLeft'" },
  { name: 'allowClear', desc: '允许清除', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '选中 / 清除回调', type: '(value) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '触发器高度（middle）', default: '32' },
  { name: 'colorBgElevated', desc: '下拉面板背景', default: '浮层底色' },
  { name: 'colorFillSecondary', desc: '多选标签底色', default: '浅填充' },
];

export function TreeSelectDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
