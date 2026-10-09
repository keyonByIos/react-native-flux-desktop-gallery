// EMPTY：空状态。统一走 DemoPage 多段式，覆盖 基础 / 自定义描述 / 仅图 / 自定义插画 / 带操作 / 尺寸。
import React from 'react';
import { Empty, Button, Icon, View } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '默认 inbox 矢量插画 + 「暂无数据」',
    node: <Empty />,
    code: [
      'import { Empty } from "react-native-flux-desktop";',
      '',
      '// 默认 inbox 矢量插画 + 「暂无数据」',
      '<Empty />',
    ].join('\n'),
  },
  {
    name: '自定义描述',
    desc: 'description 传入任意文案或节点',
    node: <Empty description="这里还没有内容，稍后再来看看" />,
    code: [
      'import { Empty } from "react-native-flux-desktop";',
      '',
      '// description 传入任意文案或节点',
      '<Empty description="这里还没有内容，稍后再来看看" />',
    ].join('\n'),
  },
  {
    name: '仅插画',
    desc: 'description=null 只保留插画',
    node: <Empty description={null} />,
    code: [
      'import { Empty } from "react-native-flux-desktop";',
      '',
      '// description=null 只保留插画',
      '<Empty description={null} />',
    ].join('\n'),
  },
  {
    name: '自定义插画',
    desc: 'image 传入任意节点替换默认插画',
    node: (
      <View style={{ alignItems: 'center' }}>
        <Empty image={<Icon name="database" size={72} color="#bfbfbf" strokeWidth={1.5} />} description="数据库暂无记录" />
      </View>
    ),
    code: [
      'import { Empty, Icon } from "react-native-flux-desktop";',
      '',
      '// image 传入任意节点替换默认插画',
      '<Empty',
      '  image={<Icon name="database" size={72} color="#bfbfbf" strokeWidth={1.5} />}',
      '  description="数据库暂无记录"',
      '/>',
    ].join('\n'),
  },
  {
    name: '带操作',
    desc: 'children 作为底部操作区',
    node: (
      <Empty description="还没有创建任何项目">
        <Button type="primary">新建项目</Button>
      </Empty>
    ),
    code: [
      'import { Empty, Button } from "react-native-flux-desktop";',
      '',
      '// children 作为底部操作区',
      '<Empty description="还没有创建任何项目">',
      '  <Button type="primary">新建项目</Button>',
      '</Empty>',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'imageSize 缩放默认插画',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <Empty imageSize={40} description="小" />
        <Empty imageSize={64} description="中" />
        <Empty imageSize={96} description="大" />
      </View>
    ),
    code: [
      'import { Empty, View } from "react-native-flux-desktop";',
      '',
      '// imageSize 缩放默认插画',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <Empty imageSize={40} description="小" />',
      '  <Empty imageSize={64} description="中" />',
      '  <Empty imageSize={96} description="大" />',
      '</View>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'description', desc: '描述文字（null 隐藏）', type: 'ReactNode', default: "'暂无数据'" },
  { name: 'image', desc: '自定义插画', type: 'ReactNode', default: 'inbox 矢量图' },
  { name: 'imageStyle', desc: '插画容器样式', type: 'ViewStyle', default: '–' },
  { name: 'imageSize', desc: '默认插画尺寸', type: 'number', default: '64' },
  { name: 'children', desc: '底部操作区', type: 'ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'color (Empty)', desc: '描述与插画颜色', default: 'colorTextQuaternary' },
  { name: 'fontSize', desc: '描述字号', default: 'fontSize' },
  { name: 'paddingLG', desc: '上下留白', default: '24' },
];

export function EmptyDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
