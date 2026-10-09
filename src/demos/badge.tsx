// BADGE：徽标。统一走 DemoPage 多段式，覆盖 基础 / 溢出 / 独立使用 / 状态点 / 绶带。
import React from 'react';
import { Badge, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 宿主方块（角标锚定其右上角） */
function Box({ size = 44 }: { size?: number }): React.ReactElement {
  const { token } = useToken();
  return <View style={{ width: size, height: size, borderRadius: 6, backgroundColor: token.colorFillSecondary }} />;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '数字 / 小红点 dot / showZero / 自定义文本，压在宿主右上角',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
        <Badge count={5}><Box /></Badge>
        <Badge dot><Box /></Badge>
        <Badge count={0} showZero><Box /></Badge>
        <Badge count="新" color="success"><Box /></Badge>
      </View>
    ),
    code: [
      'import { Badge } from "react-native-flux-desktop";',
      '',
      '// 数字 / 小红点 dot / showZero / 自定义文本，压在宿主右上角',
      '<Badge count={5}><Box /></Badge>',
      '<Badge dot><Box /></Badge>',
      '<Badge count={0} showZero><Box /></Badge>',
      '<Badge count="新" color="success"><Box /></Badge>',
    ].join('\n'),
  },
  {
    name: '溢出',
    desc: 'count 超过 overflowCount（默认 99）显示为 99+；可自定义',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
        <Badge count={120}><Box /></Badge>
        <Badge count={120} overflowCount={999}><Box /></Badge>
        <Badge count={25} overflowCount={10}><Box /></Badge>
      </View>
    ),
    code: [
      '// count 超 overflowCount（默认 99）显为 99+',
      '<Badge count={120}><Box /></Badge>',
      '<Badge count={120} overflowCount={999}><Box /></Badge>',
      '<Badge count={25} overflowCount={10}><Box /></Badge>',
    ].join('\n'),
  },
  {
    name: '独立使用',
    desc: '无 children 时徽标内联渲染（状态标签）',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Badge count={5} />
        <Badge count={66} color="processing" />
        <Badge dot color="error" />
        <Badge count="NEW" color="#faad14" />
      </View>
    ),
    code: [
      '// 无 children 时徽标内联渲染（状态标签）',
      '<Badge count={5} />',
      '<Badge count={66} color="processing" />',
      '<Badge dot color="error" />',
      '<Badge count="NEW" color="#faad14" />',
    ].join('\n'),
  },
  {
    name: '状态点',
    desc: 'Badge.Status 状态点 + 文字，processing 带呼吸光晕',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <Badge.Status status="processing" text="进行中" />
        <Badge.Status status="success" text="成功" />
        <Badge.Status status="error" text="错误" />
        <Badge.Status status="warning" text="警告" />
        <Badge.Status status="default" text="默认" />
      </View>
    ),
    code: [
      '// Badge.Status 状态点 + 文字，processing 带呼吸光晕',
      '<Badge.Status status="processing" text="进行中" />',
      '<Badge.Status status="success" text="成功" />',
      '<Badge.Status status="error" text="错误" />',
      '<Badge.Status status="default" text="默认" />',
    ].join('\n'),
  },
  {
    name: '绶带',
    desc: 'Badge.Ribbon 角标绶带，placement = end（右上）/ start（左上）',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <Badge.Ribbon text="HOT">
          <Box size={160} />
        </Badge.Ribbon>
        <Badge.Ribbon text="PRO" color="success">
          <Box size={160} />
        </Badge.Ribbon>
        <Badge.Ribbon text="NEW" color="warning" placement="start">
          <Box size={160} />
        </Badge.Ribbon>
      </View>
    ),
    code: [
      '// Badge.Ribbon 绶带，placement = end（右上）/ start（左上）',
      '<Badge.Ribbon text="HOT">',
      '  <Card>内容</Card>',
      '</Badge.Ribbon>',
      '<Badge.Ribbon text="NEW" color="warning" placement="start">',
      '  <Card>内容</Card>',
      '</Badge.Ribbon>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'count', desc: '徽标内容（数字 / 文本）', type: 'number | string', default: '–' },
  { name: 'dot', desc: '小圆点模式，不显示 count', type: 'boolean', default: 'false' },
  { name: 'color', desc: '语义色或色值', type: "'error'|'processing'|'success'|'warning'|'default'|string", default: "'error'" },
  { name: 'overflowCount', desc: '溢出上限，超出显示 N+', type: 'number', default: '99' },
  { name: 'showZero', desc: 'count 为 0 时仍显示', type: 'boolean', default: 'false' },
  { name: 'offset', desc: '[x, y] 角标微调', type: '[number, number]', default: '[0, 0]' },
  { name: 'Ribbon.placement', desc: '绶带位置', type: "'start' | 'end'", default: "'end'" },
  { name: 'Status.status', desc: '状态点类型', type: "'default'|'error'|'processing'|'success'|'warning'", default: "'default'" },
];

const TOKENS: TokenRow[] = [
  { name: 'indicatorHeight', desc: '数字徽标高度', default: '20' },
  { name: 'dotSize', desc: '小圆点直径', default: '6' },
  { name: 'colorError', desc: '默认徽标底色', default: '错误色' },
];

export function BadgeDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
