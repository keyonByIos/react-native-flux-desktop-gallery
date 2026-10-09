// PAGINATION：分页。统一走 DemoPage 多段式，覆盖 antd v5 基础 / 受控 / 显示总数 / 迷你 / 禁用 / 简洁 / 省略号 / itemRender。
import React from 'react';
import { Pagination, View, Text, useToken, type PaginationItemType } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 受控：current 由外部 state 驱动 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [p, setP] = React.useState(3);
  return (
    <View>
      <Pagination current={p} total={100} pageSize={10} onChange={setP} />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: token.marginXS }}>
        当前第 {p} 页（onChange 写回）
      </Text>
    </View>
  );
}

/** 自定义 itemRender：前后箭头换成文字按钮，页码换成主色实心圆角块 */
function ItemRenderDemo(): React.ReactElement {
  const { token } = useToken();
  const [p, setP] = React.useState(3);
  const itemRender = (
    page: number,
    type: PaginationItemType,
    element: React.ReactNode
  ): React.ReactNode => {
    if (type === 'prev' || type === 'next') {
      return (
        <View
          style={{
            paddingHorizontal: token.paddingXS,
            height: token.controlHeight,
            borderRadius: token.borderRadius,
            borderWidth: token.lineWidth,
            borderColor: token.colorBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{type === 'prev' ? '上一页' : '下一页'}</Text>
        </View>
      );
    }
    if (type === 'page') {
      const on = page === p;
      return (
        <View
          style={{
            minWidth: token.controlHeight,
            height: token.controlHeight,
            borderRadius: token.borderRadiusLG,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: on ? token.colorPrimary : 'transparent',
          }}
        >
          <Text style={{ fontSize: token.fontSize, color: on ? token.colorTextLightSolid : token.colorText }}>{page}</Text>
        </View>
      );
    }
    return element;
  };
  return <Pagination current={p} total={100} pageSize={10} onChange={setP} itemRender={itemRender} />;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'total=50，页数少不出现省略号',
    node: <Pagination defaultCurrent={1} total={50} />,
    code: [
      'import { Pagination } from "react-native-flux-desktop";',
      '',
      '// 非受控：defaultCurrent；total 总条数，pageSize 每页条数',
      '<Pagination defaultCurrent={1} total={50} />',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'current + onChange 外部驱动',
    node: <ControlledDemo />,
    code: [
      '// 受控：current + onChange 外部驱动',
      "const [p, setP] = React.useState(3);",
      '<Pagination current={p} total={100} pageSize={10} onChange={setP} />',
    ].join('\n'),
  },
  {
    name: '显示总数',
    desc: 'showTotal 渲染总条数与当前范围',
    node: <Pagination defaultCurrent={3} total={85} showTotal={(t, r) => `第 ${r[0]}-${r[1]} 条 / 共 ${t} 条`} />,
    code: [
      "// showTotal 渲染总条数与当前范围",
      '<Pagination',
      '  defaultCurrent={3}',
      '  total={85}',
      '  showTotal={(t, r) => `第 ${r[0]}-${r[1]} 条 / 共 ${t} 条`}',
      '/>',
    ].join('\n'),
  },
  {
    name: '迷你',
    desc: 'size=small，紧凑单元',
    node: <Pagination size="small" defaultCurrent={4} total={100} pageSize={10} />,
    code: ['// size=small 紧凑单元', '<Pagination size="small" defaultCurrent={4} total={100} pageSize={10} />'].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 整条置灰不可点',
    node: <Pagination disabled current={4} total={100} pageSize={10} />,
    code: ['// disabled 整条置灰不可点', '<Pagination disabled current={4} total={100} pageSize={10} />'].join('\n'),
  },
  {
    name: '简洁',
    desc: 'simple 仅前后箭头 + 页码',
    node: <Pagination simple defaultCurrent={2} total={100} pageSize={10} />,
    code: ['// simple 仅前后箭头 + 页码', '<Pagination simple defaultCurrent={2} total={100} pageSize={10} />'].join('\n'),
  },
  {
    name: '省略号',
    desc: 'total=500，当前页居中、两端固定、中间折叠',
    node: <Pagination defaultCurrent={5} total={500} pageSize={10} />,
    code: ['// 页数多时自动折叠：当前页居中、两端固定、中间省略号', '<Pagination defaultCurrent={5} total={500} pageSize={10} />'].join('\n'),
  },
  {
    name: '自定义渲染',
    desc: 'itemRender 替换箭头为文字按钮、页码为主色实心块',
    node: <ItemRenderDemo />,
    code: [
      '// itemRender 替换箭头为文字按钮、页码为主色实心块',
      '<Pagination',
      '  current={p}',
      '  total={100}',
      '  pageSize={10}',
      '  onChange={setP}',
      '  itemRender={(page, type, el) =>',
      "    type === 'page' && page === p ? <View style={{ backgroundColor: token.colorPrimary }}>{page}</View> : el",
      '  }',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'current / defaultCurrent', desc: '受控 / 非受控当前页', type: 'number', default: '1' },
  { name: 'total', desc: '总条数', type: 'number', default: '0' },
  { name: 'pageSize / defaultPageSize', desc: '每页条数', type: 'number', default: '10' },
  { name: 'onChange', desc: '页码变化回调', type: '(page, pageSize) => void', default: '–' },
  { name: 'showTotal', desc: '展示总量与范围（返回 ReactNode）', type: '(total, range) => ReactNode', default: '–' },
  { name: 'itemRender', desc: '自定义页码 / 前后箭头 / 省略号节点', type: '(page, type, el) => ReactNode', default: '–' },
  { name: 'simple', desc: '简洁模式', type: 'boolean', default: 'false' },
  { name: 'size', desc: '尺寸', type: "'default' | 'small'", default: "'default'" },
  { name: 'disabled', desc: '禁用整条', type: 'boolean', default: 'false' },
  { name: 'hideOnSinglePage', desc: '仅一页时隐藏', type: 'boolean', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '单元高度（默认）', default: '–' },
  { name: 'controlHeightSM', desc: '单元高度（迷你）', default: '–' },
  { name: 'colorPrimary', desc: '当前页描边与文字', default: '#1677ff' },
  { name: 'colorBorderSecondary', desc: '普通单元描边', default: '–' },
  { name: 'colorBgContainer', desc: '单元底色', default: '–' },
  { name: 'borderRadius', desc: '单元圆角', default: '–' },
];

export function PaginationDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
