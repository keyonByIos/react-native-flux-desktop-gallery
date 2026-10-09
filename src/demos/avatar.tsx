// AVATAR：头像。统一走 DemoPage 多段式，覆盖 类型 / 尺寸 / 形状 / 颜色 / 头像组 / 头像组随机图片。
import React from 'react';
import { Avatar, View } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const DEMOS: DemoItem[] = [
  {
    name: '类型',
    desc: '文本 / 字符 / icon 三种占位',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar>U</Avatar>
        <Avatar size="large">USER</Avatar>
        <Avatar icon="user" />
        <Avatar icon="camera" backgroundColor="#1677ff" />
      </View>
    ),
    code: [
      'import { Avatar } from "react-native-flux-desktop";',
      '',
      '// 文本 / 字符 / icon 三种占位',
      '<Avatar>U</Avatar>',
      '<Avatar size="large">USER</Avatar>',
      '<Avatar icon="user" />',
      '<Avatar icon="camera" backgroundColor="#1677ff" />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = large / default / small，或自定义数字',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar size="large">大</Avatar>
        <Avatar>中</Avatar>
        <Avatar size="small">小</Avatar>
        <Avatar size={64} backgroundColor="#722ed1">64</Avatar>
      </View>
    ),
    code: [
      '// size = large / default / small，或自定义数字',
      '<Avatar size="large">大</Avatar>',
      '<Avatar>中</Avatar>',
      '<Avatar size="small">小</Avatar>',
      '<Avatar size={64} backgroundColor="#722ed1">64</Avatar>',
    ].join('\n'),
  },
  {
    name: '形状',
    desc: 'shape = circle（默认）/ square',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar shape="circle" icon="user" backgroundColor="#1677ff" />
        <Avatar shape="square" icon="picture" backgroundColor="#52c41a" />
        <Avatar shape="square" size="large">方</Avatar>
      </View>
    ),
    code: [
      '// shape = circle（默认）/ square',
      '<Avatar shape="circle" icon="user" backgroundColor="#1677ff" />',
      '<Avatar shape="square" icon="picture" backgroundColor="#52c41a" />',
    ].join('\n'),
  },
  {
    name: '颜色',
    desc: 'backgroundColor 自定义底色，文字自动转亮色',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar backgroundColor="#1677ff">蓝</Avatar>
        <Avatar backgroundColor="#52c41a">绿</Avatar>
        <Avatar backgroundColor="#faad14">黄</Avatar>
        <Avatar backgroundColor="#f5222d">红</Avatar>
      </View>
    ),
    code: [
      '// backgroundColor 自定义底色，文字自动转亮色',
      '<Avatar backgroundColor="#1677ff">蓝</Avatar>',
      '<Avatar backgroundColor="#52c41a">绿</Avatar>',
      '<Avatar backgroundColor="#f5222d">红</Avatar>',
    ].join('\n'),
  },
  {
    name: '头像组',
    desc: 'Avatar.Group 重叠排布，max 超出折叠为 +N',
    node: (
      <View style={{ gap: 16 }}>
        <Avatar.Group max={4}>
          <Avatar icon="user" backgroundColor="#1677ff" />
          <Avatar icon="team" backgroundColor="#52c41a" />
          <Avatar icon="camera" backgroundColor="#faad14" />
          <Avatar icon="picture" backgroundColor="#f5222d" />
          <Avatar icon="mail" backgroundColor="#722ed1" />
          <Avatar icon="phone" backgroundColor="#13c2c2" />
        </Avatar.Group>
        <Avatar.Group max={3} shape="square" size="large">
          <Avatar shape="square" size="large" backgroundColor="#1677ff">A</Avatar>
          <Avatar shape="square" size="large" backgroundColor="#52c41a">B</Avatar>
          <Avatar shape="square" size="large" backgroundColor="#faad14">C</Avatar>
          <Avatar shape="square" size="large" backgroundColor="#f5222d">D</Avatar>
          <Avatar shape="square" size="large" backgroundColor="#722ed1">E</Avatar>
        </Avatar.Group>
      </View>
    ),
    code: [
      '// Avatar.Group 重叠排布，max 超出折叠为 +N',
      '<Avatar.Group max={4}>',
      '  <Avatar icon="user" backgroundColor="#1677ff" />',
      '  <Avatar icon="team" backgroundColor="#52c41a" />',
      '  <Avatar icon="camera" backgroundColor="#faad14" />',
      '  <Avatar icon="picture" backgroundColor="#f5222d" />',
      '  <Avatar icon="mail" backgroundColor="#722ed1" />',
      '</Avatar.Group>',
    ].join('\n'),
  },
  {
    name: '头像组 · 随机图片',
    desc: 'src 接入随机图片 API（Lorem Picsum，/seed 稳定复现），Group 重叠排布、max 超出折叠 +N',
    node: (
      <View style={{ gap: 16 }}>
        <Avatar.Group max={6} size="large">
          {['ada', 'bob', 'cat', 'dog', 'eve', 'kai', 'max', 'zoe', 'lin', 'raj'].map((s) => (
            <Avatar key={s} size="large" src={`https://picsum.photos/seed/${s}/128`} alt={s} />
          ))}
        </Avatar.Group>
        <Avatar.Group space={6}>
          {['a1', 'b2', 'c3', 'd4'].map((s) => (
            <Avatar key={s} shape="square" src={`https://picsum.photos/seed/${s}/128`} alt={s} />
          ))}
        </Avatar.Group>
      </View>
    ),
    code: [
      "// src 接入图片 URL；Group 重叠排布、max 超出折叠 +N；space 调相邻间距",
      '<Avatar.Group max={6} size="large">',
      '  {[\'ada\', \'bob\', \'cat\'].map((s) => (',
      '    <Avatar key={s} size="large" src={`https://picsum.photos/seed/${s}/128`} alt={s} />',
      '  ))}',
      '</Avatar.Group>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'shape', desc: '形状', type: "'circle' | 'square'", default: "'circle'" },
  { name: 'size', desc: '尺寸（三档或数字）', type: "'large'|'default'|'small'|number", default: "'default'" },
  { name: 'src', desc: '图片地址', type: 'string | ImageSource', default: '–' },
  { name: 'icon', desc: '图标占位（图标名或节点）', type: "string | ReactNode", default: '–' },
  { name: 'alt', desc: '图片加载失败时的文字，取首字', type: 'string', default: '–' },
  { name: 'backgroundColor', desc: '自定义底色', type: 'string', default: '–' },
  { name: 'Group.max', desc: '头像组最多显示数，超出折叠 +N', type: 'number', default: '–' },
  { name: 'Group.space', desc: '相邻重叠间距', type: 'number', default: '8' },
];

const TOKENS: TokenRow[] = [
  { name: 'containerSize', desc: '默认头像边长', default: '32' },
  { name: 'colorFillContent', desc: '文字头像底色', default: '浅填充' },
  { name: 'colorTextLightSolid', desc: 'icon / 深底时前景', default: '亮色文本' },
];

export function AvatarDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
