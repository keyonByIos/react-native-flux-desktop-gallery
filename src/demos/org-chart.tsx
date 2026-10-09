// 组织架构图 demo：3 种展示模式（基础竖版 / 复杂卡片节点 / 至左向右），数据对齐 AntV 官方示例。
import React from 'react';
import { OrgChart, type OrgChartData } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

// 参考图 1 的数字树（0~19，无 3）
const BASIC: OrgChartData = {
  id: '0', label: '0',
  children: [
    { id: '1', label: '1', children: [{ id: '2', label: '2' }] },
    {
      id: '17', label: '17',
      children: [
        { id: '6', label: '6', children: [{ id: '11', label: '11' }] },
        { id: '16', label: '16' },
      ],
    },
    {
      id: '18', label: '18',
      children: [
        {
          id: '4', label: '4',
          children: [
            { id: '5', label: '5', children: [{ id: '8', label: '8' }] },
            { id: '10', label: '10' },
          ],
        },
        { id: '12', label: '12' },
      ],
    },
    {
      id: '19', label: '19',
      children: [
        { id: '9', label: '9', children: [{ id: '7', label: '7' }] },
        { id: '15', label: '15', children: [{ id: '13', label: '13' }, { id: '14', label: '14' }] },
      ],
    },
  ],
};

// 参考图 2/3 的高管树（蓝/青/橙三色卡片）
const C: Record<string, string> = { blue: '#1677ff', teal: '#13c2c2', orange: '#fa8c16' };
const ORG: OrgChartData = {
  id: 'eric', label: 'Eric Joplin', sub: 'Chief Executive Officer', color: C.blue,
  children: [
    {
      id: 'gary', label: 'Gary Roberts', sub: 'Chief Executive Assistant', color: C.teal,
      children: [{ id: 'alex', label: 'Alex Burns', sub: 'Senior Executive Assistant', color: C.orange }],
    },
    {
      id: 'juan', label: 'Juan Sanchez', sub: 'Chief Technology Officer', color: C.teal,
      children: [
        {
          id: 'john', label: 'John Jones', sub: 'IT Manager', color: C.orange,
          children: [{ id: 'will', label: 'Will Brown', sub: 'Customer Support Manager', color: C.teal }],
        },
        { id: 'yvonne', label: 'Yvonne Wang', sub: 'Research and Development Manager', color: C.blue },
      ],
    },
    {
      id: 'molly', label: 'Molly Jones', sub: 'Chief Financial Officer', color: C.orange,
      children: [
        {
          id: 'mary', label: 'Mary Smith', sub: 'Finance Manager', color: C.teal,
          children: [
            {
              id: 'bob', label: 'Bob White', sub: 'HR Manager', color: C.blue,
              children: [{ id: 'david', label: 'David Miller', sub: 'Sales Manager', color: C.teal }],
            },
            { id: 'tom', label: 'Tom Adams', sub: 'Product Manager', color: C.blue },
          ],
        },
        { id: 'diana', label: 'Diana Martin', sub: 'Compliance Officer', color: C.orange },
      ],
    },
    {
      id: 'richard', label: 'Richard King', sub: 'Chief Operating Officer', color: C.blue,
      children: [
        {
          id: 'rachel', label: 'Rachel Joe', sub: 'Operations Manager', color: C.orange,
          children: [{ id: 'karen', label: 'Karen Lee', sub: 'Marketing Manager', color: C.blue }],
        },
        {
          id: 'evan', label: 'Evan Black', sub: 'Logistics Manager', color: C.orange,
          children: [
            { id: 'jim', label: 'Jim Wilson', sub: 'Legal Counsel', color: C.blue },
            { id: 'cathy', label: 'Cathy Harris', sub: 'Procurement Manager', color: C.teal },
          ],
        },
      ],
    },
  ],
};

const W = 840;

const API: ApiRow[] = [
  { name: 'data', desc: '层级树根（OrgChartData：id/label/sub/color/children）', type: 'OrgChartData', default: '—' },
  { name: 'width / height', desc: '画布尺寸', type: 'number', default: `${W} / 560` },
  { name: 'direction', desc: "排布方向：'vertical' 根在顶 / 'horizontal' 根在左", type: "'vertical' | 'horizontal'", default: "'vertical'" },
  { name: 'nodeStyle', desc: "节点样式：simple 主色圆角块 / card 人员卡（顶条+头像+姓名+职务）", type: "'simple' | 'card'", default: "'simple'" },
  { name: 'nodeW / nodeH', desc: '盒尺寸（card 建议 150×46）', type: 'number', default: '70 / 36' },
  { name: 'gapX', desc: '兄弟间距（交叉轴）', type: 'number', default: '24' },
  { name: 'gapY', desc: '层间距（深度轴）', type: 'number', default: '64' },
  { name: 'nameFont / subFont', desc: '卡片姓名/职务字号', type: 'number', default: '11 / 9.5' },
];

function OrgBasicDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '组织架构图',
      desc: '默认 simple 样式：主色圆角块 + 灰蓝正交折线（父底 → 汇流横线 → 子顶），根在顶逐层展开。',
      node: <OrgChart data={BASIC} width={W} height={560} nodeW={68} nodeH={34} gapX={18} gapY={64} />,
      code: 'import { OrgChart } from "react-native-flux-desktop";\n\n<OrgChart data={BASIC} width={840} height={560} />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function OrgCardDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '复杂节点组织架构图',
      desc: "nodeStyle='card'：白底人员卡（彩色顶条 + 头像首字母 + 姓名 + 职务截断），有子卡者出口画锚点小圆，子卡入口带箭头。9 叶超可用宽时布局自动压缩槽位。",
      node: <OrgChart data={ORG} width={W} height={640} nodeStyle="card" nodeW={88} nodeH={40} gapX={6} gapY={58} nameFont={10} subFont={9} />,
      code: '<OrgChart data={ORG} width={840} height={640}\n  nodeStyle="card" nodeW={88} nodeH={40} gapX={6} />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

function OrgHorizontalDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '至左向右的组织架构图',
      desc: "direction='horizontal'：根在左逐层向右展开，交叉轴变为纵向兄弟堆叠；卡片节点同款，折线带横向汇流与右指向箭头。",
      node: <OrgChart data={ORG} width={W} height={680} direction="horizontal" nodeStyle="card" nodeW={132} nodeH={44} gapX={18} gapY={30} nameFont={10} subFont={9} />,
      code: '<OrgChart data={ORG} width={840} height={680}\n  direction="horizontal" nodeStyle="card" />',
    },
  ];
  return <DemoPage demos={demos} api={API} />;
}

export { OrgBasicDemo, OrgCardDemo, OrgHorizontalDemo };
