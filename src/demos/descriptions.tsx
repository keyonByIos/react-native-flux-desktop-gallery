// DESCRIPTIONS：描述列表。统一走 DemoPage 多段式，覆盖 基础 / 带边框 / 垂直布局 / 尺寸 / 去冒号 / 额外内容。
import React from 'react';
import { Descriptions, Button, View } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const ITEMS = [
  { key: 'name', label: '姓名', children: '王大锤' },
  { key: 'tel', label: '电话', children: '138 **** 8888' },
  { key: 'role', label: '角色', children: '管理员' },
  { key: 'addr', label: '地址', children: '浙江省杭州市西湖区', span: 2 },
  { key: 'remark', label: '备注', children: '无', span: 2 },
];

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'plain 态，label 与内容同行，按 column 分栏、span 跨列',
    node: <Descriptions title="用户信息" column={3} items={ITEMS} />,
    code: [
      'import { Descriptions } from "react-native-flux-desktop";',
      '',
      'const ITEMS = [',
      '  { key: \'name\', label: \'姓名\', children: \'王大锤\' },',
      '  { key: \'addr\', label: \'地址\', children: \'浙江省杭州市西湖区\', span: 2 },',
      '];',
      '',
      '// plain 态，label 与内容同行，按 column 分栏、span 跨列',
      '<Descriptions title="用户信息" column={3} items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '带边框',
    desc: 'bordered 表格态，label 格浅底、单元格描边',
    node: <Descriptions title="用户信息" column={3} bordered items={ITEMS} />,
    code: [
      'import { Descriptions } from "react-native-flux-desktop";',
      '',
      '// bordered 表格态，label 格浅底、单元格描边',
      '<Descriptions title="用户信息" column={3} bordered items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '垂直布局',
    desc: "layout='vertical' 标题在上、内容在下",
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <View style={{ flex: 1, minWidth: 280 }}>
          <Descriptions title="plain 垂直" column={3} layout="vertical" items={ITEMS} />
        </View>
        <View style={{ flex: 1, minWidth: 280 }}>
          <Descriptions title="bordered 垂直" column={2} bordered layout="vertical" items={ITEMS} />
        </View>
      </View>
    ),
    code: [
      'import { Descriptions, View } from "react-native-flux-desktop";',
      '',
      '// layout=vertical 标题在上、内容在下',
      '<Descriptions title="plain 垂直" column={3} layout="vertical" items={ITEMS} />',
      '<Descriptions title="bordered 垂直" column={2} bordered layout="vertical" items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: "size='middle' / 'small' 收紧带边框单元格内边距",
    node: (
      <View style={{ gap: 16 }}>
        <Descriptions title="middle" column={2} bordered size="middle" items={ITEMS.slice(0, 2)} />
        <Descriptions title="small" column={2} bordered size="small" items={ITEMS.slice(0, 2)} />
      </View>
    ),
    code: [
      'import { Descriptions } from "react-native-flux-desktop";',
      '',
      '// size=middle / small 收紧带边框单元格内边距',
      '<Descriptions title="middle" column={2} bordered size="middle" items={ITEMS} />',
      '<Descriptions title="small" column={2} bordered size="small" items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '去冒号',
    desc: 'colon=false 隐藏 plain 态 label 后的冒号',
    node: <Descriptions title="无冒号" column={2} colon={false} items={ITEMS} />,
    code: [
      'import { Descriptions } from "react-native-flux-desktop";',
      '',
      '// colon=false 隐藏 plain 态 label 后的冒号',
      '<Descriptions title="无冒号" column={2} colon={false} items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '额外内容',
    desc: 'extra 渲染于标题行右侧',
    node: <Descriptions title="用户信息" column={3} bordered extra={<Button size="small" type="link">编辑</Button>} items={ITEMS} />,
    code: [
      'import { Descriptions, Button } from "react-native-flux-desktop";',
      '',
      '// extra 渲染于标题行右侧',
      '<Descriptions',
      '  title="用户信息"',
      '  column={3}',
      '  bordered',
      '  extra={<Button size="small" type="link">编辑</Button>}',
      '  items={ITEMS}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title / extra', desc: '标题 / 右侧额外内容', type: 'ReactNode', default: '–' },
  { name: 'items', desc: '描述项数组', type: 'DescriptionsItem[]', default: '–' },
  { name: 'column', desc: '每行列数', type: 'number', default: '2' },
  { name: 'bordered', desc: '带边框表格态', type: 'boolean', default: 'false' },
  { name: 'layout', desc: '布局方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
  { name: 'size', desc: '尺寸（bordered）', type: "'default' | 'middle' | 'small'", default: "'default'" },
  { name: 'colon', desc: 'label 后冒号', type: 'boolean', default: 'true' },
  { name: 'item.span', desc: '项跨列数', type: 'number', default: '1' },
];

const TOKENS: TokenRow[] = [
  { name: 'labelColor', desc: 'label 文字色', default: 'colorTextTertiary' },
  { name: 'labelBg', desc: 'bordered label 格底色', default: 'colorFillQuaternary' },
  { name: 'itemPaddingBottom', desc: 'plain 项下间距', default: 'paddingSM' },
];

export function DescriptionsDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
