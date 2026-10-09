// COLORPICKER：颜色选择器。统一走 DemoPage 多段式，覆盖 基础 / 尺寸 / 自定义文本 / 预设行 / 允许清除 / 弹出方向 / 受控。
import React from 'react';
import { ColorPicker, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 受控：色值回显到外部文本 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [c, setC] = React.useState('#eb2f96');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
      <ColorPicker value={c} onChange={setC} />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>当前色值：{c.toUpperCase()}</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点触发器弹出 24 色预设面板，选色即收起',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <ColorPicker defaultValue="#1677ff" />
        <ColorPicker defaultValue="#52c41a" />
        <ColorPicker defaultValue="#fa8c16" disabled />
      </View>
    ),
    code: [
      'import { ColorPicker, View } from "react-native-flux-desktop";',
      '',
      '// 点触发器弹出 24 色预设面板，选色即收起',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <ColorPicker defaultValue="#1677ff" />',
      '  <ColorPicker defaultValue="#52c41a" />',
      '  <ColorPicker defaultValue="#fa8c16" disabled />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = large / middle / small',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <ColorPicker defaultValue="#722ed1" size="large" />
        <ColorPicker defaultValue="#722ed1" size="middle" />
        <ColorPicker defaultValue="#722ed1" size="small" />
      </View>
    ),
    code: [
      'import { ColorPicker, View } from "react-native-flux-desktop";',
      '',
      '// size = large / middle / small',
      '<View style={{ flexDirection: \'row\', alignItems: \'flex-end\', gap: 24 }}>',
      '  <ColorPicker defaultValue="#722ed1" size="large" />',
      '  <ColorPicker defaultValue="#722ed1" size="middle" />',
      '  <ColorPicker defaultValue="#722ed1" size="small" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '隐藏文本',
    desc: 'showText=false 仅显示色块；或传函数自定义',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
        <ColorPicker defaultValue="#13c2c2" showText={false} />
        <ColorPicker defaultValue="#13c2c2" showText={(v) => `色：${(v ?? '').toUpperCase()}`} />
      </View>
    ),
    code: [
      'import { ColorPicker } from "react-native-flux-desktop";',
      '',
      '// showText=false 仅显示色块；或传函数自定义',
      '<ColorPicker defaultValue="#13c2c2" showText={false} />',
      '<ColorPicker defaultValue="#13c2c2" showText={(v) => `色：${(v ?? \'\').toUpperCase()}`} />',
    ].join('\n'),
  },
  {
    name: '自定义预设',
    desc: 'presets 在主色板上方加一行品牌色（此段常驻展开，预留高度避免压住后续内容）',
    node: (
      <View style={{ }}>
        <ColorPicker defaultValue="#f5222d" presets={['#f5222d', '#fa541c', '#fa8c16', '#faad14', '#a0d911']} />
      </View>
    ),
    code: [
      'import { ColorPicker } from "react-native-flux-desktop";',
      '',
      '// presets 在主色板上方加一行品牌色',
      '<ColorPicker defaultValue="#f5222d" presets={[\'#f5222d\', \'#fa541c\', \'#fa8c16\', \'#faad14\']} />',
    ].join('\n'),
  },
  {
    name: '允许清除',
    desc: 'allowClear 面板底部提供清除按钮',
    node: <ClearDemo />,
    code: [
      'import { ColorPicker } from "react-native-flux-desktop";',
      '',
      '// allowClear 面板底部提供清除按钮',
      '<ColorPicker value={c} onChange={setC} allowClear />',
    ].join('\n'),
  },
  {
    name: '弹出方向',
    desc: 'placement = bottomRight / topLeft / topRight',
    node: (
      <View style={{ flexDirection: 'row', gap: 24, paddingTop: 220 }}>
        <ColorPicker defaultValue="#2f54eb" placement="bottomRight" />
        <ColorPicker defaultValue="#2f54eb" placement="topLeft" />
        <ColorPicker defaultValue="#2f54eb" placement="topRight" />
      </View>
    ),
    code: [
      'import { ColorPicker, View } from "react-native-flux-desktop";',
      '',
      '// placement = bottomRight / topLeft / topRight',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <ColorPicker defaultValue="#2f54eb" placement="bottomRight" />',
      '  <ColorPicker defaultValue="#2f54eb" placement="topLeft" />',
      '  <ColorPicker defaultValue="#2f54eb" placement="topRight" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange，色值回显外部',
    node: <ControlledDemo />,
    code: [
      'import { ColorPicker } from "react-native-flux-desktop";',
      '',
      '// value + onChange，色值回显外部',
      'const [c, setC] = useState(\'#eb2f96\');',
      '<ColorPicker value={c} onChange={setC} />',
    ].join('\n'),
  },
];

/** 允许清除（常驻展开便于展示清除按钮） */
function ClearDemo(): React.ReactElement {
  const [c, setC] = React.useState('#eb2f96');
  return <ColorPicker value={c} onChange={setC} allowClear />;
}

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '受控 / 非受控色值（hex）', type: 'string', default: "'#1677ff'" },
  { name: 'size', desc: '触发器尺寸', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'showText', desc: '显示色值文本或自定义渲染', type: 'boolean | (color)=>ReactNode', default: 'true' },
  { name: 'presets', desc: '自定义预设色行', type: 'string[]', default: '–' },
  { name: 'allowClear', desc: '允许清除（面板底部按钮）', type: 'boolean', default: 'false' },
  { name: 'placement', desc: '弹出方向', type: "'bottomLeft'|'bottomRight'|'topLeft'|'topRight'", default: "'bottomLeft'" },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'open', desc: '面板常驻展开（嵌入场景）', type: 'boolean', default: '–' },
  { name: 'onChange', desc: '选色回调（清除时为空串）', type: '(color) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '触发器高度（middle）', default: '32' },
  { name: 'colorBgElevated', desc: '面板背景', default: '浮层底色' },
  { name: 'borderRadiusLG', desc: '面板圆角', default: '8' },
];

export function ColorPickerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
