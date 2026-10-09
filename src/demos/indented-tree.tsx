// 缩进树 demo：5 种展示模式，复用同一份 "Modeling Methods" 树数据。
import React from 'react';
import { IndentedTree, type TreeChartData } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

const TREE: TreeChartData = {
  id: 'root',
  label: 'Modeling Methods',
  children: [
    {
      id: 'consensus',
      label: 'Consensus',
      children: [
        {
          id: 'diversity',
          label: 'Models diversity',
          children: [
            { id: 'd1', label: 'Different initializations' },
            { id: 'd2', label: 'Different parameter choices' },
            { id: 'd3', label: 'Different architectures' },
            { id: 'd4', label: 'Different modeling methods' },
            { id: 'd5', label: 'Different training sets' },
            { id: 'd6', label: 'Different feature sets' },
          ],
        },
        {
          id: 'methods',
          label: 'Methods',
          children: [
            { id: 'm1', label: 'Classifier selection' },
            { id: 'm2', label: 'Classifier fusion' },
          ],
        },
        {
          id: 'common',
          label: 'Common',
          children: [
            { id: 'c1', label: 'Bagging' },
            { id: 'c2', label: 'Boosting' },
            { id: 'c3', label: 'AdaBoost' },
          ],
        },
      ],
    },
    {
      id: 'classification',
      label: 'Classification',
      children: [
        { id: 'cl1', label: 'Logistic regression' },
        { id: 'cl2', label: 'Linear discriminant analysis' },
        { id: 'cl3', label: 'Rules' },
        { id: 'cl4', label: 'Decision trees' },
        { id: 'cl5', label: 'Naive Bayes' },
        { id: 'cl6', label: 'K nearest neighbor' },
        { id: 'cl7', label: 'Probabilistic neural network' },
        { id: 'cl8', label: 'Support vector machine' },
      ],
    },
    {
      id: 'regression',
      label: 'Regression',
      children: [
        { id: 'r1', label: 'Multiple linear regression' },
        { id: 'r2', label: 'Partial least squares' },
        { id: 'r3', label: 'Multi-layer feedforward neural network' },
        { id: 'r4', label: 'General regression neural network' },
        { id: 'r5', label: 'Support vector regression' },
      ],
    },
  ],
};

const W = 760;
const H = 960;

const API: ApiRow[] = [
  { name: 'data', desc: '层级树根（TreeChartData：id/label/children）', type: 'TreeChartData', default: '—' },
  { name: 'width / height', desc: '画布尺寸', type: 'number', default: `${W} / ${H}` },
  { name: 'side', desc: "子节点方向：'right' 父左子右 / 'left' 镜像", type: "'right' | 'left'", default: "'right'" },
  { name: 'nodeStyle', desc: "节点样式：filled 蓝底圆角 / line 纯文字 / box 描边框", type: "'filled' | 'line' | 'box'", default: "'filled'" },
  { name: 'indent', desc: '每层缩进像素', type: 'number', default: '48' },
  { name: 'rowHeight', desc: '行高（含间距）', type: 'number', default: '36' },
  { name: 'nodeHeight', desc: '节点高度', type: 'number', default: '24' },
  { name: 'colorByBranch', desc: '按顶层分支着色（line/box 常用）', type: 'boolean', default: 'false' },
  { name: 'collapsible', desc: '可折叠（点击切换子树显隐）', type: 'boolean', default: 'false' },
  { name: 'defaultCollapsed', desc: '初始折叠节点 id 列表', type: 'string[]', default: '[]' },
  { name: 'onToggle', desc: '折叠状态变化回调', type: '(id, expanded) => void', default: '—' },
];

function IndentedTreeDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '缩进树',
      desc: '默认 filled 样式：蓝底圆角节点 + L 形连线，子节点在右。DFS 前序逐行排列。',
      node: <IndentedTree data={TREE} width={W} height={H} />,
      code: 'import { IndentedTree } from "react-native-flux-desktop";\n\n<IndentedTree data={TREE} width={760} height={660} />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function IndentedTreeLeftDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '缩进树-子节点左侧分布',
      desc: "side='left' 镜像：根在右、子节点向左缩进展开。",
      node: <IndentedTree data={TREE} width={W} height={H} side="left" />,
      code: '<IndentedTree data={TREE} width={760} height={660} side="left" />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function IndentedTreeLineDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '线条风格缩进树',
      desc: "nodeStyle='line' + colorByBranch：无底框纯文字，连线按顶层分支取色板着色。",
      node: <IndentedTree data={TREE} width={W} height={H} nodeStyle="line" colorByBranch />,
      code: '<IndentedTree data={TREE} width={760} height={660}\n  nodeStyle="line" colorByBranch />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function IndentedTreeBoxDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '方框风格缩进树',
      desc: "nodeStyle='box' + colorByBranch：描边圆角框 + 按分支着色；根节点实色填充。",
      node: <IndentedTree data={TREE} width={W} height={H} nodeStyle="box" colorByBranch />,
      code: '<IndentedTree data={TREE} width={760} height={660}\n  nodeStyle="box" colorByBranch />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function IndentedTreeCollapseDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '动态展开/收起子节点',
      desc: "collapsible=true：点击带子节点的项可折叠/展开其子树。初始折叠 'consensus'。",
      node: <IndentedTree data={TREE} width={W} height={H} nodeStyle="box" colorByBranch collapsible defaultCollapsed={['consensus']} />,
      code: '<IndentedTree data={TREE} width={760} height={660}\n  nodeStyle="box" colorByBranch collapsible\n  defaultCollapsed={[\'consensus\']} />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

export { IndentedTreeDemo, IndentedTreeLeftDemo, IndentedTreeLineDemo, IndentedTreeBoxDemo, IndentedTreeCollapseDemo };
