// RATE：评分。统一走 DemoPage 多段式，覆盖 基础 / 只读 / 半星 / 自定义字符 / 数量 / 清除 / 禁用。
import React from 'react';
import { Rate, View, Text, useToken, Icon } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础：受控 + 当前值回显 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState(3);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
      <Rate value={v} onChange={setV} />
      <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{v} / 5</Text>
    </View>
  );
}

/** 半星：受控回显含 .5 */
function HalfDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState(3.5);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
      <Rate allowHalf value={v} onChange={setV} />
      <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{v}</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '受控 + 当前值回显，点星设值、悬停预览',
    node: <BasicDemo />,
    code: [
      'import { Rate } from "react-native-flux-desktop";',
      '',
      '// 受控：value + onChange，点星设值',
      "const [v, setV] = React.useState(3);",
      '<Rate value={v} onChange={setV} />',
    ].join('\n'),
  },
  {
    name: '只读展示',
    desc: 'readOnly 仅展示分值',
    node: (
      <View style={{ gap: 8 }}>
        <Rate readOnly defaultValue={4} />
        <Rate readOnly defaultValue={2.5} allowHalf />
      </View>
    ),
    code: [
      'import { Rate } from "react-native-flux-desktop";',
      '',
      '// readOnly 不可交互，仅展示分值',
      '<Rate readOnly defaultValue={4} />',
      '<Rate readOnly defaultValue={2.5} allowHalf />',
    ].join('\n'),
  },
  {
    name: '半星',
    desc: 'allowHalf 左右半区悬停 / 点击，支持 .5 分值',
    node: <HalfDemo />,
    code: [
      'import { Rate } from "react-native-flux-desktop";',
      '',
      '// allowHalf 支持 .5 分值（左/右半区）',
      '<Rate allowHalf defaultValue={3.5} />',
    ].join('\n'),
  },
  {
    name: '自定义字符',
    desc: 'character 传字符串（按文本着色）或图标节点',
    node: (
      <View style={{ gap: 8 }}>
        <Rate defaultValue={3} character="好" />
        <Rate defaultValue={4} character={<Icon name="heart-filled" size={20} color="#eb2f96" />} color="#eb2f96" />
      </View>
    ),
    code: [
      'import { Rate, Icon } from "react-native-flux-desktop";',
      '',
      '// character 可为字符串（文本着色）或图标节点',
      '<Rate defaultValue={3} character="好" />',
      '<Rate',
      '  defaultValue={4}',
      '  character={<Icon name="heart-filled" size={20} color="#eb2f96" />}',
      '  color="#eb2f96"',
      '/>',
    ].join('\n'),
  },
  {
    name: '数量与配色',
    desc: 'count 星数；color 填充色',
    node: (
      <View style={{ gap: 8 }}>
        <Rate defaultValue={7} count={10} />
        <Rate defaultValue={3} count={5} color="#13c2c2" />
      </View>
    ),
    code: [
      'import { Rate } from "react-native-flux-desktop";',
      '',
      '// count 控制星数；color 控制填充色',
      '<Rate defaultValue={7} count={10} />',
      '<Rate defaultValue={3} count={5} color="#13c2c2" />',
    ].join('\n'),
  },
  {
    name: '清除',
    desc: 'allowClear 再次点击当前值清零',
    node: <Rate allowClear defaultValue={2} />,
    code: [
      'import { Rate } from "react-native-flux-desktop";',
      '',
      '// allowClear：再次点击当前分值清零',
      '<Rate allowClear defaultValue={2} />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 灰显不可交互',
    node: <Rate disabled defaultValue={3} />,
    code: [
      'import { Rate } from "react-native-flux-desktop";',
      '',
      '// disabled 灰显不可交互',
      '<Rate disabled defaultValue={3} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '受控 / 非受控分值', type: 'number', default: '0' },
  { name: 'count', desc: '星数', type: 'number', default: '5' },
  { name: 'allowHalf', desc: '允许半星', type: 'boolean', default: 'false' },
  { name: 'character', desc: '自定义字符 / 图标', type: 'ReactNode', default: '星形' },
  { name: 'color', desc: '填充色', type: 'string', default: 'colorWarning' },
  { name: 'readOnly', desc: '只读展示', type: 'boolean', default: 'false' },
  { name: 'allowClear', desc: '点击当前值清零', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'size / gap', desc: '星尺寸 / 间隙', type: 'number', default: 'fontSizeLG+2 / marginXXS' },
  { name: 'onChange', desc: '分值变化回调', type: '(value) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorWarning', desc: '默认填充色', default: '警告黄' },
  { name: 'colorFillSecondary', desc: '空星色', default: '填充' },
  { name: 'fontSizeLG', desc: '星尺寸基准', default: '16' },
];

export function RateDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
