// 思维导图 demo：6 种展示模式，复用 "Modeling Methods" 树数据（与缩进树同源，分支序调整为回归在前以匹配左右分布）。
import React from 'react';
import { MindMapChart, type TreeChartData } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

const TREE: TreeChartData = {
  id: 'root',
  label: 'Modeling Methods',
  children: [
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
  ],
};

const W = 900;
const H = 680;
// 900 宽画布容纳 24 个英文长标签：字号/层间距收一档（布局末尾还会按包围盒整体居中）
const TIGHT = { fontSize: 11, levelGap: 24 } as const;

const API: ApiRow[] = [
  { name: 'data', desc: '层级树根（TreeChartData：id/label/children）', type: 'TreeChartData', default: '—' },
  { name: 'width / height', desc: '画布尺寸', type: 'number', default: `${W} / ${H}` },
  { name: 'side', desc: "子节点分布：'both' 左右两侧 / 'right' / 'left' 全在一侧", type: "'both' | 'right' | 'left'", default: "'both'" },
  { name: 'nodeStyle', desc: "节点样式：filled 主色块 / line 纯文字+下划线 / box 描边盒", type: "'filled' | 'line' | 'box'", default: "'filled'" },
  { name: 'nodeH', desc: '节点高度', type: 'number', default: '24' },
  { name: 'levelGap', desc: '父子水平间距', type: 'number', default: '28' },
  { name: 'leafGap', desc: '相邻叶节点垂直间距', type: 'number', default: '10' },
  { name: 'collapsible', desc: '可折叠（点击带子节点的项切换子树显隐）', type: 'boolean', default: 'false' },
  { name: 'defaultCollapsed', desc: '初始折叠节点 id 列表', type: 'string[]', default: '[]' },
  { name: 'onToggle', desc: '折叠状态变化回调', type: '(id, expanded) => void', default: '—' },
];

function MindMapDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '思维导图',
      desc: '默认 filled 样式：根居中，一级分支左右分布（前 floor(n/2) 个在左）；主色圆角块 + S 形贝塞尔连线。',
      node: <MindMapChart data={TREE} width={W} height={H} {...TIGHT} />,
      code: 'import { MindMapChart } from "react-native-flux-desktop";\n\n<MindMapChart data={TREE} width={900} height={680}\n  fontSize={11} levelGap={24} />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function MindMapRightDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '思维导图-子节点右侧分布',
      desc: "side='right'：全部子节点在根右侧展开，根贴左缘，整体呈水平树形态。单侧 24 叶需更高画布（H=880）。",
      node: <MindMapChart data={TREE} width={840} height={880} side="right" leafGap={6} {...TIGHT} />,
      code: '<MindMapChart data={TREE} width={900} height={880} side="right" />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function MindMapLeftDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '思维导图-子节点左侧分布',
      desc: "side='left'：全部子节点在根左侧展开，根贴右缘，整体镜像。单侧 24 叶需更高画布（H=880）。",
      node: <MindMapChart data={TREE} width={840} height={880} side="left" leafGap={6} {...TIGHT} />,
      code: '<MindMapChart data={TREE} width={900} height={880} side="left" />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function MindMapLineDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '线条风格思维导图',
      desc: "nodeStyle='line'：纯文字节点按顶层分支取色板着色，叶节点带分支色下划线，根为灰底盒。",
      node: <MindMapChart data={TREE} width={W} height={H} nodeStyle="line" {...TIGHT} />,
      code: '<MindMapChart data={TREE} width={900} height={680}\n  nodeStyle="line" />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function MindMapBoxDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '方框风格思维导图',
      desc: "nodeStyle='box'：一级分支实色填充白字，更深层白底分支色描边盒，根灰底盒。",
      node: <MindMapChart data={TREE} width={W} height={H} nodeStyle="box" {...TIGHT} />,
      code: '<MindMapChart data={TREE} width={900} height={680}\n  nodeStyle="box" />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function MindMapCollapseDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '动态展开/收起子节点',
      desc: 'collapsible=true：点击带子节点的项折叠/展开其子树，布局实时重排。初始折叠 consensus。',
      node: <MindMapChart data={TREE} width={W} height={H} nodeStyle="box" collapsible defaultCollapsed={['consensus']} {...TIGHT} />,
      code: '<MindMapChart data={TREE} width={900} height={680}\n  nodeStyle="box" collapsible defaultCollapsed={[\'consensus\']} />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

export { MindMapDemo, MindMapRightDemo, MindMapLeftDemo, MindMapLineDemo, MindMapBoxDemo, MindMapCollapseDemo };
