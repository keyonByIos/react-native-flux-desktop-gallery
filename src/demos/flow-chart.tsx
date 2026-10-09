// 流程图 demo：基础流程图 / 任务调度流程图（状态色卡）/ 高亮元素及其所在链路（点击交互）。
// 数据取自 AntV G6 官方示例（任务调度 / 简单 DAG / 链路高亮）。
import React from 'react';
import { FlowChart, type FlowGraphData } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

// ── 简单 DAG（-1/-2/-3 → 0 → 1..5，2→6、3→7、4→8）──
const BASIC: FlowGraphData = {
  nodes: [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
    id: String(i),
    label: String(i),
  })),
  edges: [
    { source: '-3', target: '0' },
    { source: '-2', target: '0' },
    { source: '-1', target: '0' },
    { source: '0', target: '1' },
    { source: '0', target: '2' },
    { source: '0', target: '3' },
    { source: '0', target: '4' },
    { source: '0', target: '5' },
    { source: '2', target: '6' },
    { source: '3', target: '7' },
    { source: '4', target: '8' },
  ],
};

// ── 任务调度：集群 OB → 4×Store → 4×Writer（1 红=失败）→ 结束 ──
const SCHEDULE: FlowGraphData = {
  nodes: [
    { id: 'ob', label: '集群 OB' },
    { id: 's1', label: 'Store-11.124.115.16-9000:mysql2', sub: 'delay: 4min', color: '#1677ff' },
    { id: 's2', label: 'Store-11.124.115.16-9000:mysql2', sub: 'delay: 4min', color: '#1677ff' },
    { id: 's3', label: 'Store-11.124.115.16-9000:mysql2', sub: 'delay: 4min', color: '#1677ff' },
    { id: 's4', label: 'Store-11.124.115.16-9000:mysql2', sub: 'delay: 4min', color: '#1677ff' },
    { id: 'w1', label: 'Writer-11.124.115.16-9000:mysql', sub: 'delay: 4min', color: '#52c41a' },
    { id: 'w2', label: 'Writer-11.124.115.16-9000:mysql', sub: 'delay: 4min', color: '#52c41a' },
    { id: 'w3', label: 'Writer-11.124.115.16-9000:mysql', sub: 'delay: 11min', color: '#ff4d4f' },
    { id: 'w4', label: 'Writer-11.124.115.16-9000:mysql', sub: 'delay: 4min', color: '#52c41a' },
    { id: 'end', label: '结束' },
  ],
  edges: [
    { source: 'ob', target: 's1' },
    { source: 'ob', target: 's2' },
    { source: 'ob', target: 's3' },
    { source: 'ob', target: 's4' },
    { source: 's1', target: 'w1' },
    { source: 's2', target: 'w2' },
    { source: 's3', target: 'w3' },
    { source: 's4', target: 'w4' },
    { source: 'w1', target: 'end' },
    { source: 'w2', target: 'end' },
    { source: 'w3', target: 'end' },
    { source: 'w4', target: 'end' },
  ],
};

const W = 760;
const H = 520;

const API: ApiRow[] = [
  { name: 'graph', desc: '图数据（nodes: id/label/sub/color；edges: source/target）', type: 'FlowGraphData', default: '—' },
  { name: 'width / height', desc: '画布尺寸', type: 'number', default: `${W} / ${H}` },
  { name: 'highlightOnClick', desc: '点击节点 → 高亮其上游+下游整条链路，再点取消', type: 'boolean', default: 'false' },
  { name: 'selectedId', desc: '受控选中节点（非受控用 defaultSelectedId）', type: 'string | null', default: '—' },
  { name: 'defaultSelectedId', desc: '初始选中节点', type: 'string | null', default: 'null' },
  { name: 'onSelectChange', desc: '选中变化回调', type: '(id | null) => void', default: '—' },
  { name: 'nodeW / nodeH / nodeH2', desc: '节点宽 / 单行高 / 两段卡高', type: 'number', default: '170 / 44 / 62' },
  { name: 'gapX / gapY / padding', desc: '层间距 / 层内间距 / 四周留白', type: 'number', default: '90 / 28 / 40' },
];

function FlowChartDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '流程图',
      desc: '基础 DAG：分层布局（最长路径定层 + 重心排序减交叉），纯色圆角节点 + 正交圆角折线 + 箭头。',
      node: <FlowChart graph={BASIC} width={W} height={H} nodeW={120} />,
      code: 'import { FlowChart } from "react-native-flux-desktop";\n\n<FlowChart graph={GRAPH} width={760} height={520} nodeW={120} />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function FlowScheduleDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '任务调度流程图',
      desc: '带状态的两段卡节点：彩色头（截断标题）+ 白底体（delay 行）；蓝=正常、绿=成功、红=失败。',
      node: <FlowChart graph={SCHEDULE} width={W} height={H} nodeW={124} nodeH={40} nodeH2={56} gapX={40} />,
      code: '<FlowChart graph={SCHEDULE} width={760} height={520}\n  nodeW={124} nodeH={40} nodeH2={56} />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function FlowHighlightDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '高亮元素及其所在链路',
      desc: 'highlightOnClick：点击任一节点，其全部上游祖先 + 下游后代（经过该节点的整条群流程）以深蓝描边着色，链路外淡出；再点同一节点取消。',
      node: (
        <FlowChart
          graph={BASIC}
          width={W}
          height={H}
          nodeW={120}
          highlightOnClick
          defaultSelectedId="-2"
        />
      ),
      code: '<FlowChart graph={GRAPH} width={760} height={520}\n  nodeW={120} highlightOnClick defaultSelectedId="-2" />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

export { FlowChartDemo, FlowScheduleDemo, FlowHighlightDemo };
