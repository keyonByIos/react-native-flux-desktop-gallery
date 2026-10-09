// IMAGE：图片。统一走 DemoPage 多段式，覆盖 基础 / contain / 形状 / 说明条 / 空 src 占位 / 自定义兜底 / 点击预览。
import React from 'react';
import path from 'path';
import { ImageBox, Icon, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const ASSET = path.join(process.cwd(), 'assets', 'sample.png');

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'cover 铺满容器，默认圆角',
    node: <ImageBox src={ASSET} width={260} height={160} />,
    code: [
      'import { ImageBox } from "react-native-flux-desktop";',
      'import path from \'path\';',
      '',
      'const ASSET = path.join(process.cwd(), \'assets\', \'sample.png\');',
      '',
      '// cover 铺满容器，默认圆角',
      '<ImageBox src={ASSET} width={260} height={160} />',
    ].join('\n'),
  },
  {
    name: 'contain',
    desc: 'resizeMode=contain 完整显示、留边',
    node: <ImageBox src={ASSET} width={200} height={160} resizeMode="contain" />,
    code: [
      'import { ImageBox } from "react-native-flux-desktop";',
      '',
      '// resizeMode=contain 完整显示、留边',
      '<ImageBox src={ASSET} width={200} height={160} resizeMode="contain" />',
    ].join('\n'),
  },
  {
    name: '形状',
    desc: 'shape=circle 圆形 / square 直角 / radius 自定义圆角',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <ImageBox src={ASSET} width={120} height={120} shape="circle" />
        <ImageBox src={ASSET} width={120} height={120} shape="square" />
        <ImageBox src={ASSET} width={120} height={120} radius={24} />
      </View>
    ),
    code: [
      'import { ImageBox, View } from "react-native-flux-desktop";',
      '',
      '// shape=circle 圆形 / square 直角 / radius 自定义圆角',
      '<View style={{ flexDirection: \'row\', gap: 20 }}>',
      '  <ImageBox src={ASSET} width={120} height={120} shape="circle" />',
      '  <ImageBox src={ASSET} width={120} height={120} shape="square" />',
      '  <ImageBox src={ASSET} width={120} height={120} radius={24} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '说明条',
    desc: 'caption 压于图片底部',
    node: <ImageBox src={ASSET} width={260} height={150} caption="sample — Lorem Picsum 随机图" />,
    code: [
      'import { ImageBox } from "react-native-flux-desktop";',
      '',
      '// caption 压于图片底部',
      '<ImageBox src={ASSET} width={260} height={150} caption="sample — Lorem Picsum 随机图" />',
    ].join('\n'),
  },
  {
    name: '空 src 占位',
    desc: 'src 为空时按 alt 渲染占位插画',
    node: <ImageBox src="" width={220} height={140} alt="图片加载失败" />,
    code: [
      'import { ImageBox } from "react-native-flux-desktop";',
      '',
      '// src 为空时按 alt 渲染占位插画',
      '<ImageBox src="" width={220} height={140} alt="图片加载失败" />',
    ].join('\n'),
  },
  {
    name: '自定义兜底',
    desc: 'fallback 传入任意节点替换默认占位',
    node: (
      <ImageBox
        src=""
        width={220}
        height={140}
        fallback={
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Icon name="camera" size={30} color="#bfbfbf" strokeWidth={1.5} />
            <Text style={{ fontSize: 12, color: '#8c8c8c' }}>自定义兜底内容</Text>
          </View>
        }
      />
    ),
    code: [
      'import { ImageBox, Icon, Text, View } from "react-native-flux-desktop";',
      '',
      '// fallback 传入任意节点替换默认占位',
      '<ImageBox',
      '  src=""',
      '  width={220}',
      '  height={140}',
      '  fallback={',
      '    <View style={{ alignItems: \'center\', gap: 6 }}>',
      '      <Icon name="camera" size={30} color="#bfbfbf" strokeWidth={1.5} />',
      '      <Text style={{ fontSize: 12, color: \'#8c8c8c\' }}>自定义兜底内容</Text>',
      '    </View>',
      '  }',
      '/>',
    ].join('\n'),
  },
  {
    name: '点击预览',
    desc: 'preview 属性开启后点击图片弹出全屏预览浮层（支持缩放）',
    node: <ImageBox src={ASSET} width={200} height={140} preview />,
    code: [
      'import { ImageBox } from "react-native-flux-desktop";',
      '',
      '// preview 开启后点击图片弹出全屏预览浮层（支持缩放）',
      '<ImageBox src={ASSET} width={200} height={140} preview />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'src', desc: '图片地址（空则占位）', type: 'string', default: '–' },
  { name: 'width / height', desc: '尺寸', type: 'number | string', default: "'100%' / 160" },
  { name: 'resizeMode', desc: '填充方式', type: "'cover' | 'contain' | ...", default: "'cover'" },
  { name: 'shape', desc: '形状', type: "'circle' | 'rounded' | 'square'", default: "'rounded'" },
  { name: 'radius', desc: '自定义圆角', type: 'number', default: 'borderRadiusLG' },
  { name: 'alt', desc: '空 src 占位文案', type: 'string', default: '–' },
  { name: 'fallback', desc: '自定义占位', type: 'ReactNode', default: '–' },
  { name: 'caption', desc: '底部说明条', type: 'ReactNode', default: '–' },
  { name: 'preview', desc: '点击放大预览', type: 'boolean | {images}', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorFillSecondary', desc: '占位底色', default: '浅填充' },
  { name: 'borderRadiusLG', desc: '默认圆角', default: '8' },
  { name: 'colorTextQuaternary', desc: '占位文字色', default: '最弱文本' },
];

export function ImageDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
