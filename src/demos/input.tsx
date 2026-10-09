// INPUT：文本输入框。这是本仓库第一条打通「键盘 → 编辑 → IME」的组件——
// 点框即聚焦，可直接敲物理键盘；切到中文输入法时，拼音在光标处以合成态显示，选词后上屏。
import React from 'react';
import { Input, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 受控：value + onChange 回显 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState('hello');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
      <Input value={v} onChange={setV} style={{ width: 240 }} placeholder="受控输入" />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>当前：{v || '空'}（{v.length} 字）</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点框聚焦后直接敲键盘；placeholder 空占位，defaultValue 预填',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <Input placeholder="请输入内容" style={{ width: 220 }} />
        <Input defaultValue="Flux Skia" style={{ width: 220 }} />
      </View>
    ),
    code: [
      'import { Input, View } from "react-native-flux-desktop";',
      '',
      '// 点框聚焦后直接敲键盘；placeholder 空占位，defaultValue 预填',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <Input placeholder="请输入内容" style={{ width: 220 }} />',
      '  <Input defaultValue="Flux Skia" style={{ width: 220 }} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange，实时回显长度',
    node: <ControlledDemo />,
    code: [
      'import { Input } from "react-native-flux-desktop";',
      '',
      '// value + onChange，实时回显长度',
      'const [v, setV] = useState(\'hello\');',
      '<Input value={v} onChange={setV} style={{ width: 240 }} placeholder="受控输入" />',
    ].join('\n'),
  },
  {
    name: '聚焦即可输入（含中文）',
    desc: 'autoFocus 自动聚焦；切中文输入法可拼音合成上屏',
    node: <Input autoFocus defaultValue="键入" style={{ width: 260 }} maxLength={20} />,
    code: [
      'import { Input } from "react-native-flux-desktop";',
      '',
      '// autoFocus 自动聚焦；切中文输入法可拼音合成上屏',
      '<Input autoFocus defaultValue="键入" style={{ width: 260 }} maxLength={20} />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = large / middle / small',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <Input defaultValue="large" size="large" style={{ width: 180 }} />
        <Input defaultValue="middle" size="middle" style={{ width: 180 }} />
        <Input defaultValue="small" size="small" style={{ width: 180 }} />
      </View>
    ),
    code: [
      'import { Input, View } from "react-native-flux-desktop";',
      '',
      '// size = large / middle / small',
      '<View style={{ flexDirection: \'row\', alignItems: \'flex-end\', gap: 24 }}>',
      '  <Input defaultValue="large" size="large" style={{ width: 180 }} />',
      '  <Input defaultValue="middle" size="middle" style={{ width: 180 }} />',
      '  <Input defaultValue="small" size="small" style={{ width: 180 }} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '前后缀',
    desc: 'prefix 前置符号，suffix 后置单位',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <Input prefix="¥" defaultValue="128" style={{ width: 180 }} />
        <Input suffix="KG" defaultValue="50" style={{ width: 180 }} />
      </View>
    ),
    code: [
      'import { Input, View } from "react-native-flux-desktop";',
      '',
      '// prefix 前置符号，suffix 后置单位',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <Input prefix="¥" defaultValue="128" style={{ width: 180 }} />',
      '  <Input suffix="KG" defaultValue="50" style={{ width: 180 }} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '校验状态',
    desc: 'status = error / warning，描红 / 黄边',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <Input defaultValue="error" status="error" style={{ width: 180 }} />
        <Input defaultValue="warning" status="warning" style={{ width: 180 }} />
      </View>
    ),
    code: [
      'import { Input, View } from "react-native-flux-desktop";',
      '',
      '// status = error / warning，描红 / 黄边',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <Input defaultValue="error" status="error" style={{ width: 180 }} />',
      '  <Input defaultValue="warning" status="warning" style={{ width: 180 }} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '可清除',
    desc: 'allowClear 聚焦且有值时显示清除按钮',
    node: <Input allowClear defaultValue="点我清除" style={{ width: 220 }} />,
    code: [
      'import { Input } from "react-native-flux-desktop";',
      '',
      '// allowClear 聚焦且有值时显示清除按钮',
      '<Input allowClear defaultValue="点我清除" style={{ width: 220 }} />',
    ].join('\n'),
  },
  {
    name: '禁用与只读',
    desc: 'disabled 灰显不可聚焦；readOnly 可选取不可编辑',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <Input defaultValue="disabled" disabled style={{ width: 180 }} />
        <Input defaultValue="read-only" readOnly style={{ width: 180 }} />
      </View>
    ),
    code: [
      'import { Input, View } from "react-native-flux-desktop";',
      '',
      '// disabled 灰显不可聚焦；readOnly 可选取不可编辑',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <Input defaultValue="disabled" disabled style={{ width: 180 }} />',
      '  <Input defaultValue="read-only" readOnly style={{ width: 180 }} />',
      '</View>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '受控 / 非受控文本', type: 'string', default: '–' },
  { name: 'placeholder', desc: '空占位文字', type: 'string', default: '–' },
  { name: 'size', desc: '高度三档', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'status', desc: '校验状态', type: "'error' | 'warning'", default: '–' },
  { name: 'prefix / suffix', desc: '前缀 / 后缀', type: 'ReactNode', default: '–' },
  { name: 'allowClear', desc: '聚焦有值时显示清除', type: 'boolean', default: 'false' },
  { name: 'maxLength', desc: '最大字符数（码点）', type: 'number', default: '–' },
  { name: 'disabled / readOnly', desc: '禁用 / 只读', type: 'boolean', default: 'false' },
  { name: 'autoFocus', desc: '挂载即聚焦', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '文本变化', type: '(v: string) => void', default: '–' },
  { name: 'onPressEnter', desc: '回车回调', type: '(v: string) => void', default: '–' },
  { name: 'onFocus / onBlur', desc: '聚焦 / 失焦', type: '() => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '触发器高度（middle）', default: '32' },
  { name: 'colorPrimary', desc: '聚焦态描边', default: '主色' },
  { name: 'colorFillQuaternary', desc: '禁用底色', default: '填充' },
];

export function InputDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
