// SLIDER：滑动条。DemoPage 多段式，覆盖 基础 / 步长 / 带刻度 / 数值气泡 / 受控 / 禁用。
// 交互提示：本栈无拖拽管线，点击轨道/刻度即可就近吸附到步位。
import React from 'react';
import { Slider, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 受控演示：值显示在右侧 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState(40);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: 460 }}>
      <View style={{ flex: 1 }}>
        <Slider min={0} max={100} value={v} onChange={setV} />
      </View>
      <Text style={{ width: 48, textAlign: 'right', fontSize: token.fontSize, color: token.colorPrimary }}>{v}</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点击轨道即就近吸附到步位，手柄补间滑动',
    node: <Slider defaultValue={30} style={{ maxWidth: 400 }} />,
    code: [
      'import { Slider } from "react-native-flux-desktop";',
      '',
      '// 点击轨道就近吸附到步位',
      '<Slider defaultValue={30} style={{ maxWidth: 400 }} />',
    ].join('\n'),
  },
  {
    name: '步长',
    desc: 'step=10，落点被规整到 0/10/…/100',
    node: <Slider step={10} defaultValue={50} style={{ maxWidth: 400 }} />,
    code: [
      'import { Slider } from "react-native-flux-desktop";',
      '',
      '// step 控制吸附粒度，落点规整到步长倍',
      '<Slider step={10} defaultValue={50} style={{ maxWidth: 400 }} />',
    ].join('\n'),
  },
  {
    name: '带刻度 marks',
    desc: 'marks 标注关键点，点刻度可精确跳转',
    node: (
      <Slider
        defaultValue={30}
        step={10}
        marks={{ 0: '0', 30: '30', 70: '70', 100: '100' }}
        style={{ maxWidth: 400 }}
      />
    ),
    code: [
      'import { Slider } from "react-native-flux-desktop";',
      '',
      '// marks 标注关键点，点刻度精确跳转',
      '<Slider',
      '  defaultValue={30}',
      '  step={10}',
      '  marks={{ 0: \'0\', 30: \'30\', 70: \'70\', 100: \'100\' }}',
      '/>',
    ].join('\n'),
  },
  {
    name: '数值气泡',
    desc: 'tooltipVisible 常驻显示当前值，formatter 自定义格式',
    node: (
      <Slider
        defaultValue={60}
        tooltipVisible
        formatter={(v) => `${v}%`}
        style={{ maxWidth: 400 }}
      />
    ),
    code: [
      'import { Slider } from "react-native-flux-desktop";',
      '',
      '// tooltipVisible 常驻数值气泡；formatter 自定义格式',
      '<Slider',
      '  defaultValue={60}',
      '  tooltipVisible',
      '  formatter={(v) => `${v}%`}',
      '/>',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange 外部持有状态',
    node: <ControlledDemo />,
    code: [
      'import { Slider } from "react-native-flux-desktop";',
      '',
      '// 受控：value + onChange 外部持有',
      "const [v, setV] = React.useState(40);",
      '<Slider min={0} max={100} value={v} onChange={setV} />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 置灰且不响应点击',
    node: <Slider defaultValue={45} disabled style={{ maxWidth: 400 }} />,
    code: [
      'import { Slider } from "react-native-flux-desktop";',
      '',
      '// disabled 置灰且不响应点击',
      '<Slider defaultValue={45} disabled style={{ maxWidth: 400 }} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'min / max', desc: '取值区间', type: 'number', default: '0 / 100' },
  { name: 'step', desc: '步长（吸附粒度）', type: 'number', default: '1' },
  { name: 'value / defaultValue', desc: '受控 / 初值', type: 'number', default: '–' },
  { name: 'marks', desc: '刻度标注', type: 'Record<number, ReactNode>', default: '–' },
  { name: 'tooltipVisible', desc: '常驻数值气泡', type: 'boolean', default: 'false' },
  { name: 'formatter', desc: '数值格式化', type: '(v) => ReactNode', default: '–' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '值变化回调', type: '(v: number) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary', desc: '已填充段 / 手柄描边', default: '主色' },
  { name: 'colorSplit', desc: '未填充轨道', default: '分隔色' },
  { name: 'colorBgContainer', desc: '手柄底色', default: '容器背景' },
];

export function SliderDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
