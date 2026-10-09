// DIVIDER：分割线。统一走 DemoPage 三段式（demo 列表 → API 表 → Token 表）。
import React from 'react';
import { Divider, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 水平：默认实线 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const label = (t: string) => (
    <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{t}</Text>
  );
  return (
    <View>
      {label('默认水平分割线')}
      <Divider />
      <Text style={{ fontSize: token.fontSize, color: token.colorText }}>内容段落 A</Text>
      <Divider />
      <Text style={{ fontSize: token.fontSize, color: token.colorText }}>内容段落 B</Text>
    </View>
  );
}

/** 线型：variant solid / dashed / dotted */
function VariantDemo(): React.ReactElement {
  const { token } = useToken();
  const label = (t: string) => (
    <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{t}</Text>
  );
  return (
    <View>
      {label('solid')}
      <Divider variant="solid" />
      {label('dashed 虚线')}
      <Divider variant="dashed" />
      {label('dotted 点线')}
      <Divider variant="dotted" />
    </View>
  );
}

/** 带文字：orientation left / center / right */
function TextDemo(): React.ReactElement {
  return (
    <View>
      <Divider orientation="left">文字居左</Divider>
      <Divider orientation="center">文字居中</Divider>
      <Divider orientation="right">文字居右</Divider>
    </View>
  );
}

/** plain：文字不加粗；线型也可与文字组合 */
function PlainDemo(): React.ReactElement {
  return (
    <View>
      <Divider plain>plain — 文字常规字重（默认是 500 半粗）</Divider>
      <Divider dashed orientation="left">
        dashed + 文字
      </Divider>
    </View>
  );
}

/** 垂直：嵌在文本行内做竖线分隔 */
function VerticalDemo(): React.ReactElement {
  const { token } = useToken();
  const link = (t: string) => (
    <Text style={{ fontSize: token.fontSize, color: token.colorLink }}>{t}</Text>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 24 }}>
      {link('链接一')}
      <Divider type="vertical" />
      {link('链接二')}
      <Divider type="vertical" variant="dashed" />
      {link('链接三')}
      <Divider type="vertical" variant="dotted" />
      {link('链接四')}
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '水平分割线',
    desc: '默认 type=horizontal，用于分隔区块内容',
    node: <BasicDemo />,
    code: [
      'import { Divider, Text } from "react-native-flux-desktop";',
      '',
      '// 默认水平分割线（type=horizontal）',
      '<Text>内容段落 A</Text>',
      '<Divider />',
      '<Text>内容段落 B</Text>',
    ].join('\n'),
  },
  {
    name: '线型',
    desc: 'variant：solid / dashed / dotted（旧版 dashed 布尔仍兼容）',
    node: <VariantDemo />,
    code: [
      '// variant：solid / dashed / dotted',
      '<Divider variant="solid" />',
      '<Divider variant="dashed" />',
      '<Divider variant="dotted" />',
    ].join('\n'),
  },
  {
    name: '带文字',
    desc: 'children + orientation：left / center / right，线在文字处断开',
    node: <TextDemo />,
    code: [
      '// children + orientation：线在文字处断开',
      '<Divider orientation="left">文字居左</Divider>',
      '<Divider orientation="center">文字居中</Divider>',
      '<Divider orientation="right">文字居右</Divider>',
    ].join('\n'),
  },
  {
    name: 'plain 文字',
    desc: 'plain 让文字回到常规字重（默认 500 半粗）',
    node: <PlainDemo />,
    code: [
      '// plain 文字回到常规字重；可与 orientation / variant 组合',
      '<Divider plain>plain — 文字常规字重</Divider>',
      '<Divider dashed orientation="left">dashed + 文字</Divider>',
    ].join('\n'),
  },
  {
    name: '垂直分割线',
    desc: 'type=vertical，嵌在行内做竖线分隔，同样支持 variant',
    node: <VerticalDemo />,
    code: [
      '// type=vertical 嵌在行内做竖线分隔',
      '<View style={{ flexDirection: "row", alignItems: "center" }}>',
      '  <Text>链接一</Text>',
      '  <Divider type="vertical" />',
      '  <Text>链接二</Text>',
      '  <Divider type="vertical" variant="dashed" />',
      '  <Text>链接三</Text>',
      '</View>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'type', desc: '分割线方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
  { name: 'variant', desc: '线型（优先级高于 dashed）', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'" },
  { name: 'dashed', desc: '虚线布尔（旧版，等价 variant="dashed"）', type: 'boolean', default: 'false' },
  { name: 'orientation', desc: '文字位置（仅带 children 时生效）', type: "'left' | 'center' | 'right'", default: "'center'" },
  { name: 'plain', desc: '文字不加粗', type: 'boolean', default: 'false' },
  { name: 'children', desc: '分割线中间的文字，置空则为纯线', type: 'ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSplit', desc: '分割线颜色', default: '–' },
  { name: 'lineWidth', desc: '线宽', default: '1' },
  { name: 'margin', desc: '水平分割线上下外边距', default: '16' },
  { name: 'marginXS', desc: '垂直分割线左右外边距', default: '8' },
  { name: 'paddingXS', desc: '文字与线段间距', default: '8' },
];

export function DividerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
