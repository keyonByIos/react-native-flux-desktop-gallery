// TREE demo：DemoPage 多段式（基础 / 默认展开全部 / 父子联动勾选 / 严格勾选 / 多选 / 整树禁用）。
import React from 'react';
import { Tree, Space, Text, useToken, type TreeNode } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const DATA: TreeNode[] = [
  {
    key: '0-0',
    title: '研发部门',
    icon: 'folder',
    children: [
      {
        key: '0-0-0',
        title: '前端组',
        icon: 'code',
        children: [
          { key: '0-0-0-0', title: 'React 工程师' },
          { key: '0-0-0-1', title: '可视化工程师' },
        ],
      },
      { key: '0-0-1', title: '后端组', icon: 'server' },
      { key: '0-0-2', title: '禁用节点', disabled: true },
    ],
  },
  {
    key: '0-1',
    title: '设计部门',
    icon: 'penTool',
    children: [
      { key: '0-1-0', title: 'UI 设计' },
      { key: '0-1-1', title: '交互设计' },
    ],
  },
];

function Basic(): React.ReactElement {
  const { token } = useToken();
  const [sel, setSel] = React.useState<string[]>(['0-0-0']);
  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>选中：{sel.join('、') || '（空）'}</Text>
      <Tree treeData={DATA} defaultExpandedKeys={['0-0']} selectedKeys={sel} onSelect={setSel} />
    </Space>
  );
}

function LinkedCheck(): React.ReactElement {
  const { token } = useToken();
  const [keys, setKeys] = React.useState<string[]>(['0-0-0-0']);
  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>勾选：{keys.join('、') || '（空）'}</Text>
      <Tree treeData={DATA} checkable defaultExpandedKeys={['0-0']} checkedKeys={keys} onCheck={setKeys} />
    </Space>
  );
}

function StrictCheck(): React.ReactElement {
  const { token } = useToken();
  const [keys, setKeys] = React.useState<string[]>(['0-0-0-0']);
  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>勾选（互不影响）：{keys.join('、') || '（空）'}</Text>
      <Tree treeData={DATA} checkable checkStrict defaultExpandedKeys={['0-0']} checkedKeys={keys} onCheck={setKeys} />
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '展开/收起 + 单选高亮，箭头旋转动画',
    node: <Basic />,
    code: [
      'import { Tree, type TreeNode } from "react-native-flux-desktop";',
      '',
      'const treeData: TreeNode[] = [',
      '  { key: \'0-0\', title: \'研发部门\', icon: \'folder\', children: [',
      '    { key: \'0-0-0\', title: \'前端组\', icon: \'code\' },',
      '    { key: \'0-0-2\', title: \'禁用节点\', disabled: true },',
      '  ] },',
      '];',
      '',
      '// 展开/收起 + 单选高亮',
      '<Tree treeData={treeData} defaultExpandedKeys={[\'0-0\']} selectedKeys={sel} onSelect={setSel} />',
    ].join('\n'),
  },
  {
    name: '默认展开全部',
    desc: 'defaultExpandAll 初始展开所有父节点',
    node: <Tree treeData={DATA} defaultExpandAll />,
    code: [
      'import { Tree } from "react-native-flux-desktop";',
      '',
      '// defaultExpandAll 初始展开所有父节点',
      '<Tree treeData={treeData} defaultExpandAll />',
    ].join('\n'),
  },
  {
    name: '父子联动勾选',
    desc: 'checkable 默认联动：勾父带子，半选横杠派生',
    node: <LinkedCheck />,
    code: [
      'import { Tree } from "react-native-flux-desktop";',
      '',
      '// checkable 默认联动：勾父带子，半选横杠派生',
      '<Tree treeData={treeData} checkable checkedKeys={keys} onCheck={setKeys} />',
    ].join('\n'),
  },
  {
    name: '严格勾选',
    desc: 'checkStrict 父子勾选互不影响',
    node: <StrictCheck />,
    code: [
      'import { Tree } from "react-native-flux-desktop";',
      '',
      '// checkStrict 父子勾选互不影响',
      '<Tree treeData={treeData} checkable checkStrict checkedKeys={keys} onCheck={setKeys} />',
    ].join('\n'),
  },
  {
    name: '多选',
    desc: 'multiple 允许同时选中多个节点',
    node: <Tree treeData={DATA} multiple defaultExpandedKeys={['0-0', '0-1']} defaultSelectedKeys={['0-0-0', '0-1-0']} />,
    code: [
      'import { Tree } from "react-native-flux-desktop";',
      '',
      '// multiple 允许同时选中多个节点',
      '<Tree',
      '  treeData={treeData}',
      '  multiple',
      '  defaultExpandedKeys={[\'0-0\', \'0-1\']}',
      '  defaultSelectedKeys={[\'0-0-0\', \'0-1-0\']}',
      '/>',
    ].join('\n'),
  },
  {
    name: '整树禁用',
    desc: 'disabled 使全树不可交互、置灰',
    node: <Tree treeData={DATA} checkable disabled defaultExpandedKeys={['0-0']} defaultCheckedKeys={['0-0-0-0']} />,
    code: [
      'import { Tree } from "react-native-flux-desktop";',
      '',
      '// disabled 使全树不可交互、置灰',
      '<Tree treeData={treeData} checkable disabled defaultExpandedKeys={[\'0-0\']} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'treeData', desc: '树节点数据', type: 'TreeNode[]', default: '–' },
  { name: 'checkable', desc: '显示复选框', type: 'boolean', default: 'false' },
  { name: 'checkStrict', desc: '父子勾选互不影响', type: 'boolean', default: 'false' },
  { name: 'multiple', desc: '多选', type: 'boolean', default: 'false' },
  { name: 'defaultExpandAll', desc: '默认展开全部', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '整树禁用', type: 'boolean', default: 'false' },
  { name: 'selectable', desc: '整树不可选中', type: 'boolean', default: 'true' },
  { name: 'onExpand/onSelect/onCheck', desc: '展开/选中/勾选回调', type: '(keys) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary', desc: '选中文字 / 勾选框', default: '主色' },
  { name: 'colorFillQuaternary', desc: '悬停底色', default: '浅填充' },
  { name: 'controlHeightSM', desc: '每层缩进', default: '24' },
];

export function TreeDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
