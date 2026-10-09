// LAYOUT：Flex 弹性布局 + Grid 24 栏栅格。统一走 DemoPage 三段式（demo 列表 → API 表 → Token 表）。
import React from 'react';
import { Row, Col, Flex, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';
import type { ViewStyle } from 'react-native-flux-desktop';

/** 栅格色块：撑满所在 Col，便于观察占比与间距 */
function Block(props: { label: string; tall?: boolean }): React.ReactElement {
  const { token } = useToken();
  const st: ViewStyle = {
    backgroundColor: token.colorPrimaryBg,
    borderColor: token.colorPrimaryBorder,
    borderWidth: token.lineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: token.paddingSM,
    minHeight: props.tall ? 56 : undefined,
  };
  return (
    <View style={st}>
      <Text style={{ color: token.colorText, fontSize: token.fontSizeSM }}>{props.label}</Text>
    </View>
  );
}

function Caption(props: { children: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginBottom: 4 }}>
      {props.children}
    </Text>
  );
}

/** 基础：span 12/6/6 与 8/8/8 */
function SpanDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginXS }}>
      <Row gutter="small">
        <Col span={12}>
          <Block label="span=12" />
        </Col>
        <Col span={6}>
          <Block label="span=6" />
        </Col>
        <Col span={6}>
          <Block label="span=6" />
        </Col>
      </Row>
      <Row gutter="small">
        <Col span={8}>
          <Block label="8" />
        </Col>
        <Col span={8}>
          <Block label="8" />
        </Col>
        <Col span={8}>
          <Block label="8" />
        </Col>
      </Row>
    </View>
  );
}

/** 偏移：offset 留白 */
function OffsetDemo(): React.ReactElement {
  return (
    <View style={{ gap: 8 }}>
      <Row gutter="small">
        <Col span={6}>
          <Block label="span=6" />
        </Col>
        <Col span={12} offset={6}>
          <Block label="offset=6 span=12" />
        </Col>
      </Row>
      <Row gutter="small">
        <Col span={12} offset={12}>
          <Block label="offset=12" />
        </Col>
      </Row>
    </View>
  );
}

/** 间距：gutter [水平, 垂直] 元组，多行看 rowGap */
function GutterDemo(): React.ReactElement {
  // 用定宽 View 而非 Col（Col 的 flexBasis:'0%' 会吃掉固定宽度），靠 Row 换行体现 rowGap
  return (
    <Row gutter={[48, 20]}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ width: 220, flexShrink: 0 }}>
          <Block label={`gutter [48,20] #${i + 1}`} />
        </View>
      ))}
    </Row>
  );
}

/** 对齐：justify（antd 关键字）+ align */
function AlignDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginXS }}>
      <Caption>justify="space-between"（固定宽块）</Caption>
      <Row justify="space-between" style={{ borderStyle: 'dashed', borderWidth: token.lineWidth, borderColor: token.colorBorder }}>
        <View style={{ width: 80 }}>
          <Block label="A" />
        </View>
        <View style={{ width: 80 }}>
          <Block label="B" />
        </View>
        <View style={{ width: 80 }}>
          <Block label="C" />
        </View>
      </Row>
      <Caption>justify="center"</Caption>
      <Row justify="center" style={{ borderStyle: 'dashed', borderWidth: token.lineWidth, borderColor: token.colorBorder }}>
        <View style={{ width: 80 }}>
          <Block label="A" />
        </View>
        <View style={{ width: 80 }}>
          <Block label="B" />
        </View>
      </Row>
    </View>
  );
}

/** 混合：Col flex（数字比例 / 'auto' 自适应）与 span 共存 */
function FlexColDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginXS }}>
      <Caption>flex="auto"（内容自适应）+ 剩余列 flex=1 撑开</Caption>
      <Row gutter="small">
        <Col flex="auto">
          <Block label="auto 侧栏" />
        </Col>
        <Col flex={1}>
          <Block label="flex=1 主区" tall />
        </Col>
      </Row>
      <Caption>flex 数字比例 1 : 2 : 3</Caption>
      <Row gutter="small">
        <Col flex={1}>
          <Block label="1" />
        </Col>
        <Col flex={2}>
          <Block label="2" />
        </Col>
        <Col flex={3}>
          <Block label="3" />
        </Col>
      </Row>
    </View>
  );
}

/** Flex 容器：vertical + gap 档 */
function FlexDemo(): React.ReactElement {
  return (
    <Flex vertical gap="small">
      <Flex justify="space-between" gap="middle">
        <View style={{ width: 90 }}>
          <Block label="横向 A" />
        </View>
        <View style={{ width: 90 }}>
          <Block label="横向 B" />
        </View>
      </Flex>
      <Flex vertical gap="large">
        <Block label="纵向 1（gap=large）" />
        <Block label="纵向 2" />
      </Flex>
    </Flex>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础栅格',
    desc: 'Row + Col span（24 栏），gutter 走命名档',
    node: <SpanDemo />,
    code: [
      'import { Row, Col } from "react-native-flux-desktop";',
      '',
      '// 24 栏栅格：span 占栏数，gutter 走命名档',
      '<Row gutter="small">',
      '  <Col span={12}><Block>span=12</Block></Col>',
      '  <Col span={6}><Block>span=6</Block></Col>',
      '  <Col span={6}><Block>span=6</Block></Col>',
      '</Row>',
    ].join('\n'),
  },
  {
    name: '偏移',
    desc: 'Col offset 按 1/24 留出左侧空白',
    node: <OffsetDemo />,
    code: [
      '// Col offset 按 1/24 留出左侧空白',
      '<Row gutter="small">',
      '  <Col span={6}><Block>A</Block></Col>',
      '  <Col span={12} offset={6}><Block>offset=6 span=12</Block></Col>',
      '</Row>',
    ].join('\n'),
  },
  {
    name: '间距',
    desc: 'gutter 支持 [水平, 垂直] 元组，多行可见 rowGap',
    node: <GutterDemo />,
    code: [
      '// gutter 支持 [水平, 垂直] 元组，多行可见 rowGap',
      '<Row gutter={[48, 20]}>{cells}</Row>',
    ].join('\n'),
  },
  {
    name: '对齐',
    desc: 'Row justify / align 兼容 antd 关键字（start/end/top/middle…）',
    node: <AlignDemo />,
    code: [
      '// justify / align 兼容 antd 关键字',
      '<Row justify="space-between">…</Row>',
      '<Row justify="center">…</Row>',
      "// justify: start / end / center / space-between / space-around / space-evenly",
    ].join('\n'),
  },
  {
    name: '弹性 Col',
    desc: 'Col flex：数字按比例分配，"auto" 随内容自适应',
    node: <FlexColDemo />,
    code: [
      '// Col flex：数字按比例分配，"auto" 随内容自适应',
      '<Row gutter="small">',
      '  <Col flex="auto"><Block>auto 侧栏</Block></Col>',
      '  <Col flex={1}><Block>flex=1 主区</Block></Col>',
      '</Row>',
      '// 也可 flex={1}/{2}/{3} 做 1:2:3 比例分栏',
    ].join('\n'),
  },
  {
    name: 'Flex 容器',
    desc: 'antd v5 Flex：vertical / justify / gap（命名档或 [行,列]）',
    node: <FlexDemo />,
    code: [
      '// antd v5 Flex：vertical / justify / gap',
      '<Flex vertical gap="small">',
      '  <Flex justify="space-between" gap="middle">…</Flex>',
      '  <Flex vertical gap="large">…</Flex>',
      '</Flex>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'Row.gutter', desc: '间距，元组可分设横纵', type: 'number | 档 | [h, v]', default: '0' },
  { name: 'Row.justify', desc: '水平对齐（兼容 antd 关键字）', type: "'start'|'end'|'center'|'space-between'|…", default: "'start'" },
  { name: 'Row.align', desc: '垂直对齐（兼容 top/middle/bottom）', type: "'top'|'middle'|'bottom'|'stretch'", default: "'top'" },
  { name: 'Row.wrap', desc: '是否换行', type: 'boolean', default: 'true' },
  { name: 'Col.span', desc: '占据栅格数（0-24）', type: 'number', default: '24' },
  { name: 'Col.offset', desc: '左侧偏移栅格数', type: 'number', default: '0' },
  { name: 'Col.flex', desc: '弹性值，覆盖 span', type: 'number | "auto"', default: '–' },
  { name: 'Flex.vertical', desc: '方向为纵向', type: 'boolean', default: 'false' },
  { name: 'Flex.gap', desc: '间距，元组可分设行列', type: 'number | 档 | [row, col]', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'marginLG / margin / marginSM', desc: 'gutter 命名档 large / middle / small 取值', default: '24 / 16 / 12' },
  { name: 'colorPrimaryBg', desc: '演示色块底色（非组件 token）', default: '–' },
];

export function LayoutDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
