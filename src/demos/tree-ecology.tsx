// 关系图 demo：生态树（Dendrogram）+ 紧凑树（DendrogrCompact），各 3 方向 = 6 样式。
// 数据模型对齐 AntV G6 官方示例（"Modeling Methods" 树），复用同一棵树以直观对比算法差异。
import React from 'react';
import { View, Button, DendrogramChart, DendrogrCompactChart, type TreeChartData } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

/** 重播容器：换 key 重挂载子图，触发一次入场动画。 */
function Replay(props: { children: (seed: number) => React.ReactElement }): React.ReactElement {
  const [seed, setSeed] = React.useState(0);
  return (
    <View style={{ gap: 10 }}>
      <View key={seed}>{props.children(seed)}</View>
      <Button size="small" style={{ alignSelf: 'flex-start' }} onClick={() => setSeed((s) => s + 1)}>
        重播入场动画
      </Button>
    </View>
  );
}

// 与 AntV 官方示例一致：Modelling Methods → Consensus/Classification/Regression → 各自叶
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
const H = 560;

function makeApi(direction: string, algo: string): ApiRow[] {
  return [
    { name: 'data', desc: '层级树根（TreeChartData：id/label/children）', type: 'TreeChartData', default: '—' },
    { name: 'width / height', desc: '画布尺寸', type: 'number', default: `${W} / ${H}` },
    { name: 'direction', desc: `${algo} 布局方向`, type: "'horizontal' | 'vertical' | 'radial'", default: `'${direction}'` },
    { name: 'nodeRadius', desc: '节点圆半径', type: 'number', default: '8' },
    { name: 'nodeColor', desc: '节点填充色', type: 'string', default: 'theme.primary' },
    { name: 'edgeColor', desc: '父子连线色', type: 'string', default: 'theme.axisLine' },
    { name: 'edgeWidth', desc: '父子连线宽', type: 'number', default: '1.2' },
    { name: 'paddingMain', desc: '主轴（depth 方向）两端留白', type: 'number', default: '40' },
    { name: 'paddingCross', desc: '副轴（cross 方向）两端留白', type: 'number', default: '20' },
    { name: 'innerRadius', desc: '径向内半径（direction=radial 生效）', type: 'number', default: '30' },
    { name: 'animation / animateDuration', desc: '入场逐层揭示', type: 'boolean / number', default: 'true / 900' },
  ];
}

function makeDemo(
  title: string,
  desc: string,
  direction: 'horizontal' | 'vertical' | 'radial',
  algo: 'Dendrogram' | 'DendrogrCompact',
): () => React.ReactElement {
  return function Demo(): React.ReactElement {
    const demos: DemoItem[] = [
      {
        name: title,
        desc,
        node: (
          <Replay>
            {() =>
              algo === 'Dendrogram' ? (
                <DendrogramChart data={TREE} width={W} height={H} direction={direction} />
              ) : (
                <DendrogrCompactChart data={TREE} width={W} height={H} direction={direction} />
              )
            }
          </Replay>
        ),
        code:
          algo === 'Dendrogram'
            ? `import { DendrogramChart } from "react-native-flux-desktop";\n\n<DendrogramChart data={TREE} width={${W}} height={${H}} direction="${direction}" />`
            : `import { DendrogrCompactChart } from "react-native-flux-desktop";\n\n<DendrogrCompactChart data={TREE} width={${W}} height={${H}} direction="${direction}" />`,
      },
    ];
    return <DemoPage demos={demos} api={makeApi(direction, algo)} />;
  };
}

export const DendrogramHDemo = makeDemo(
  '水平生态树',
  '所有叶在同一 depth（右侧一列对齐）；短枝被拉伸至最大层深；父子用横向 cubic bezier 连接，非叶标签在节点左、叶标签在节点右。',
  'horizontal',
  'Dendrogram',
);
export const DendrogramVDemo = makeDemo(
  '垂直生态树',
  '根在顶、叶在底；叶标签沿纵向旋转 -90° 竖排在节点下方，非叶标签横排在节点右侧。',
  'vertical',
  'Dendrogram',
);
export const DendrogramRDemo = makeDemo(
  '径向生态树',
  'depth → 半径、cross → 角度；叶在同一外圆周；标签沿切向排布，左半圆自动翻转 180° 保持可读。',
  'radial',
  'Dendrogram',
);
export const DendrogrCompactHDemo = makeDemo(
  '水平紧凑树',
  '叶可在不同 depth（子树少则占槽少），整体更紧凑；AdaBoost 等 Common 叶会出现在 Methods 叶的右侧。',
  'horizontal',
  'DendrogrCompact',
);
export const DendrogrCompactVDemo = makeDemo(
  '垂直紧凑树',
  '紧凑布局 + 纵向投影；叶按自然树深落位，短枝子树提前结束。',
  'vertical',
  'DendrogrCompact',
);
export const DendrogrCompactRDemo = makeDemo(
  '径向紧凑树',
  '紧凑 + 极坐标；叶分布在不同半径圆周上，比 Dendrogram·R 更省空间。',
  'radial',
  'DendrogrCompact',
);
