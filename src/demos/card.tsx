// CARD：卡片。统一走 DemoPage 多段式，覆盖 基础 / 无边框与尺寸 / 封面 / 操作 / 悬停 / 加载 / 内部卡片。
import React from 'react';
import { Card, Button, Divider, Text, View, Avatar, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 封面占位（无真实图，用渐变块模拟） */
function Cover(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ height: 140, backgroundColor: token.colorPrimaryBg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: token.fontSizeLG, color: token.colorPrimary }}>封面图区域</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'title + extra + 正文，默认带边框',
    node: (
      <Card title="卡片标题" extra={<Button type="link" size="small">更多</Button>} style={{ maxWidth: 460 }}>
        <Text style={{ color: '#666' }}>Card 的 header / actions 分隔线走单边边框，逐条边填充才能画对。</Text>
      </Card>
    ),
    code: [
      'import { Card, Button, Text } from "react-native-flux-desktop";',
      '',
      '// title + extra + 正文，默认带边框',
      '<Card title="卡片标题" extra={<Button type="link" size="small">更多</Button>} style={{ maxWidth: 460 }}>',
      '  <Text>Card 正文内容</Text>',
      '</Card>',
    ].join('\n'),
  },
  {
    name: '无边框与尺寸',
    desc: 'bordered = false 去描边；size = small 收紧内边距',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <Card title="无边框" bordered={false} style={{ flex: 1, minWidth: 220 }}>
          <Text style={{ color: '#666' }}>无描边的卡片，靠留白区分层级。</Text>
        </Card>
        <Card title="小尺寸" size="small" style={{ flex: 1, minWidth: 220 }}>
          <Text style={{ color: '#666' }}>size=small 收紧 header 与 body 内边距。</Text>
        </Card>
      </View>
    ),
    code: [
      '// bordered=false 去描边；size=small 收紧内边距',
      '<Card title="无边框" bordered={false}>无描边卡片</Card>',
      '<Card title="小尺寸" size="small">收紧 header/body 内边距</Card>',
    ].join('\n'),
  },
  {
    name: '封面',
    desc: 'cover 满宽渲染于 header 之下、body 之上',
    node: (
      <Card title="含封面" cover={<Cover />} style={{ maxWidth: 460 }}>
        <Meta />
      </Card>
    ),
    code: [
      '// cover 满宽渲染于 header 之下、body 之上；可配 Card.Meta',
      '<Card title="含封面" cover={<View style={{ height: 140 }} />} style={{ maxWidth: 460 }}>',
      '  <Card.Meta avatar={<Avatar>F</Avatar>} title="Card.Meta" description="元信息块" />',
      '</Card>',
    ].join('\n'),
  },
  {
    name: '操作',
    desc: 'actions 底部分格操作区',
    node: (
      <Card
        title="带操作"
        actions={[<Text key="a">编辑</Text>, <Text key="b">复制</Text>, <Text key="c">删除</Text>]}
        style={{ maxWidth: 460 }}
      >
        <Text style={{ color: '#666' }}>底部三个等分操作，竖分隔线走单边边框。</Text>
      </Card>
    ),
    code: [
      '// actions 底部分格操作区',
      '<Card',
      '  title="带操作"',
      '  actions={[<Text key="a">编辑</Text>, <Text key="b">复制</Text>, <Text key="c">删除</Text>]}',
      '>',
      '  底部三个等分操作',
      '</Card>',
    ].join('\n'),
  },
  {
    name: '悬停',
    desc: 'hoverable 悬停描边转主色（本管线无阴影，降级为描边反馈）',
    node: (
      <Card hoverable title="悬停我" style={{ maxWidth: 360 }}>
        <Text style={{ color: '#666' }}>鼠标移入，卡片描边高亮为主色。</Text>
      </Card>
    ),
    code: [
      '// hoverable 悬停描边转主色（本管线无阴影，降级为描边反馈）',
      '<Card hoverable title="悬停我" style={{ maxWidth: 360 }}>',
      '  鼠标移入，卡片描边高亮为主色',
      '</Card>',
    ].join('\n'),
  },
  {
    name: '加载中',
    desc: 'loading 用骨架占位替换正文',
    node: (
      <Card title="加载中" loading style={{ maxWidth: 460 }}>
        <Text>这段内容在 loading 时不可见</Text>
      </Card>
    ),
    code: [
      '// loading 用骨架占位替换正文',
      '<Card title="加载中" loading style={{ maxWidth: 460 }}>',
      '  <Text>这段内容在 loading 时不可见</Text>',
      '</Card>',
    ].join('\n'),
  },
  {
    name: '内部卡片',
    desc: "type = 'inner' 浅底内嵌卡片",
    node: (
      <Card title="外层卡片" style={{ maxWidth: 460 }}>
        <Divider orientation="left">INNER</Divider>
        <Card type="inner" title="内部卡片" size="small">
          <Text style={{ color: '#666' }}>浅底、常用于分组信息。</Text>
        </Card>
      </Card>
    ),
    code: [
      "// type='inner' 浅底内嵌卡片，常用于分组信息",
      '<Card title="外层卡片" style={{ maxWidth: 460 }}>',
      '  <Divider orientation="left">INNER</Divider>',
      '  <Card type="inner" title="内部卡片" size="small">浅底、常用于分组信息。</Card>',
      '</Card>',
    ].join('\n'),
  },
];

function Meta(): React.ReactElement {
  return (
    <Card.Meta
      avatar={<Avatar size={44}>F</Avatar>}
      title="Card.Meta"
      description="头像 + 标题 / 描述的元信息块，常用于列表项。"
    />
  );
}

const API: ApiRow[] = [
  { name: 'title / extra', desc: '标题 / 右上角操作', type: 'ReactNode', default: '–' },
  { name: 'bordered', desc: '显示边框', type: 'boolean', default: 'true' },
  { name: 'size', desc: '尺寸', type: "'default' | 'small'", default: "'default'" },
  { name: 'type', desc: '内部卡片', type: "'inner'", default: '–' },
  { name: 'cover', desc: '封面（满宽）', type: 'ReactNode', default: '–' },
  { name: 'actions', desc: '底部分格操作', type: 'ReactNode[]', default: '–' },
  { name: 'loading', desc: '加载骨架', type: 'boolean', default: 'false' },
  { name: 'hoverable', desc: '可悬停反馈', type: 'boolean', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'paddingLG', desc: 'body 内边距（default）', default: '24' },
  { name: 'colorFillQuaternary', desc: '内部卡片底色', default: '极浅填充' },
  { name: 'colorBorderSecondary', desc: '卡片描边', default: '浅分隔色' },
];

export function CardDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
