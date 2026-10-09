// INPUTNUMBER：数字输入框。统一走 DemoPage 多段式，覆盖 基础 / 尺寸 / 步进单位 / 前后缀 / 校验状态 / 隐藏步进 / 禁用。
import React from 'react';
import { InputNumber, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 受控 + min/max 夹取，回显当前值 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState<number | null>(3);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
      <InputNumber value={v ?? undefined} min={0} max={10} onChange={setV} />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>当前：{v ?? '空'}（限 0~10）</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点上下步进按钮调值，min/max 夹取',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <InputNumber defaultValue={5} />
        <InputNumber placeholder="请输入" min={0} max={100} />
      </View>
    ),
    code: [
      'import { InputNumber, View } from "react-native-flux-desktop";',
      '',
      '// 点上下步进按钮调值，min/max 夹取',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <InputNumber defaultValue={5} />',
      '  <InputNumber placeholder="请输入" min={0} max={100} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange + min/max',
    node: <ControlledDemo />,
    code: [
      'import { InputNumber } from "react-native-flux-desktop";',
      '',
      '// value + onChange + min/max 夹取',
      'const [v, setV] = useState<number | null>(3);',
      '<InputNumber value={v ?? undefined} min={0} max={10} onChange={setV} />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = large / middle / small',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <InputNumber defaultValue={16} size="large" />
        <InputNumber defaultValue={16} size="middle" />
        <InputNumber defaultValue={16} size="small" />
      </View>
    ),
    code: [
      'import { InputNumber, View } from "react-native-flux-desktop";',
      '',
      '// size = large / middle / small',
      '<View style={{ flexDirection: \'row\', alignItems: \'flex-end\', gap: 24 }}>',
      '  <InputNumber defaultValue={16} size="large" />',
      '  <InputNumber defaultValue={16} size="middle" />',
      '  <InputNumber defaultValue={16} size="small" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '步进与单位',
    desc: 'step=10 调幅，suffix 后缀单位',
    node: <InputNumber defaultValue={20} step={10} min={0} max={200} suffix="kg" />,
    code: [
      'import { InputNumber } from "react-native-flux-desktop";',
      '',
      '// step=10 调幅，suffix 后缀单位',
      '<InputNumber defaultValue={20} step={10} min={0} max={200} suffix="kg" />',
    ].join('\n'),
  },
  {
    name: '前后缀',
    desc: 'prefix 前缀符号；formatter 自定义显示（千分位 + %）',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <InputNumber defaultValue={9} prefix="¥" />
        <InputNumber defaultValue={1234} formatter={(v) => `${v}%`} min={0} max={100} />
      </View>
    ),
    code: [
      'import { InputNumber, View } from "react-native-flux-desktop";',
      '',
      '// prefix 前缀符号；formatter 自定义显示',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <InputNumber defaultValue={9} prefix="¥" />',
      '  <InputNumber defaultValue={1234} formatter={(v) => `${v}%`} min={0} max={100} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '校验状态',
    desc: 'status = error / warning，描红 / 黄边',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <InputNumber defaultValue={5} status="error" />
        <InputNumber defaultValue={5} status="warning" />
      </View>
    ),
    code: [
      'import { InputNumber, View } from "react-native-flux-desktop";',
      '',
      '// status = error / warning，描红 / 黄边',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <InputNumber defaultValue={5} status="error" />',
      '  <InputNumber defaultValue={5} status="warning" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '隐藏步进',
    desc: 'controls=false 去掉右侧步进按钮',
    node: <InputNumber defaultValue={42} controls={false} />,
    code: [
      'import { InputNumber } from "react-native-flux-desktop";',
      '',
      '// controls=false 去掉右侧步进按钮',
      '<InputNumber defaultValue={42} controls={false} />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 灰显不可调',
    node: <InputNumber defaultValue={7} disabled />,
    code: [
      'import { InputNumber } from "react-native-flux-desktop";',
      '',
      '// disabled 灰显不可调',
      '<InputNumber defaultValue={7} disabled />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '受控 / 非受控数值', type: 'number', default: '–' },
  { name: 'min / max', desc: '取值范围夹取', type: 'number', default: '-Infinity / Infinity' },
  { name: 'step', desc: '步进调幅', type: 'number', default: '1' },
  { name: 'size', desc: '高度三档', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'status', desc: '校验状态', type: "'error' | 'warning'", default: '–' },
  { name: 'controls', desc: '是否显示步进按钮', type: 'boolean', default: 'true' },
  { name: 'prefix / suffix', desc: '前缀 / 后缀单位', type: 'ReactNode | string', default: '–' },
  { name: 'placeholder', desc: '无值占位', type: 'string', default: '–' },
  { name: 'formatter', desc: '自定义数值显示', type: '(value) => string', default: '–' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '数值变化回调', type: '(v: number|null) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '触发器高度（middle）', default: '32' },
  { name: 'colorError', desc: 'error 状态描边', default: '错误红' },
  { name: 'colorFillQuaternary', desc: '禁用底色', default: '填充' },
];

export function InputNumberDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
