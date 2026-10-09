// WATERMARK demo：embed 平铺块 + cover 覆盖内容；多行文字 / 颜色字号 / 旋转间隔 / 字重字体。
import React from 'react';
import { Watermark, Card, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

function CoverCard(props: { children?: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <Card>
      <View style={{ height: 120, justifyContent: 'center' }}>{props.children}</View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>覆盖模式下水印跟随内容尺寸</Text>
    </Card>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础（嵌入块）',
    desc: "mode='embed' 平铺展示",
    node: <Watermark content="Flux 内部资料" mode="embed" height={140} />,
    code: [
      'import { Watermark } from "react-native-flux-desktop";',
      '',
      '// mode=embed：自身渲染一块平铺水印',
      '<Watermark content="Flux 内部资料" mode="embed" height={140} />',
    ].join('\n'),
  },
  {
    name: '覆盖内容',
    desc: "mode='cover' 水印叠于 children",
    node: (
      <Watermark content="机密 CONFIDENTIAL">
        <CoverCard />
      </Watermark>
    ),
    code: [
      '// mode=cover（默认）：水印叠在 children 之上',
      '<Watermark content="机密 CONFIDENTIAL">',
      '  <Card>被保护的内容</Card>',
      '</Watermark>',
    ].join('\n'),
  },
  {
    name: '多行文字',
    desc: 'content 传入字符串数组',
    node: <Watermark content={['第一行水印', 'Second Line']} mode="embed" height={160} />,
    code: [
      '// content 传数组 = 多行水印',
      '<Watermark content={[\'第一行水印\', \'Second Line\']} mode="embed" height={160} />',
    ].join('\n'),
  },
  {
    name: '自定义颜色与字号',
    desc: 'fontColor / fontSize',
    node: <Watermark content="品牌水印" mode="embed" height={140} fontSize={22} fontColor="rgba(22, 119, 255, 0.18)" />,
    code: [
      '<Watermark',
      '  content="品牌水印"',
      '  mode="embed"',
      '  height={140}',
      '  fontSize={22}',
      '  fontColor="rgba(22, 119, 255, 0.18)"',
      '/>',
    ].join('\n'),
  },
  {
    name: '旋转与间隔',
    desc: 'rotate / gap',
    node: <Watermark content="旋转水印" mode="embed" height={160} rotate={-12} gap={[24, 24]} />,
    code: [
      '// rotate 旋转角度；gap 平铺间隔 [横, 纵]',
      '<Watermark content="旋转水印" mode="embed" height={160} rotate={-12} gap={[24, 24]} />',
    ].join('\n'),
  },
  {
    name: '字重与字体',
    desc: 'fontWeight / fontFamily',
    node: <Watermark content="Bold Watermark" mode="embed" height={140} fontWeight={700} fontFamily="Georgia" fontSize={20} />,
    code: [
      '<Watermark',
      '  content="Bold Watermark"',
      '  mode="embed"',
      '  height={140}',
      '  fontWeight={700}',
      '  fontFamily="Georgia"',
      '  fontSize={20}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'content', desc: '水印文字（可多行）', type: 'string | string[]', default: "'Flux Skia'" },
  { name: 'mode', desc: '展示形态', type: "'cover'|'embed'", default: "'cover'" },
  { name: 'gap', desc: '平铺间隔 [横, 纵]', type: '[number, number]', default: '[48, 40]' },
  { name: 'rotate', desc: '旋转角度', type: 'number', default: '-22' },
  { name: 'fontSize', desc: '字号', type: 'number', default: 'fontSizeLG' },
  { name: 'fontColor', desc: '字体颜色（含透明度）', type: 'string', default: 'colorTextBase 15%' },
  { name: 'fontWeight / fontFamily', desc: '字重 / 字体', type: "TextStyle", default: '–' },
  { name: 'height', desc: 'embed 模式块高', type: 'number', default: 'fontSize×8' },
  { name: 'children', desc: 'cover 模式被覆盖内容', type: 'ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorTextBase', desc: '默认水印色基色', default: '随主题' },
  { name: 'fontSizeLG', desc: '默认字号', default: '16' },
  { name: 'colorBgContainer', desc: 'embed 块底色', default: '容器底色' },
];

export function WatermarkDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
