// RADIO：单选框。统一走 DemoPage 多段式，覆盖 基础 / 单选组合 / 按钮风格 / 按钮尺寸 / 手写子项 / 禁用。
import React from 'react';
import { Radio, View, Text, useToken, type RadioValue, Space } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础：受控 + 本地 state 互斥 */
function BasicDemo(): React.ReactElement {
  const [v, setV] = React.useState<RadioValue>('a');
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, rowGap: 12 }}>
      <Space>
        <Radio checked={v === 'a'} label="选项 A" onChange={() => setV('a')} />
        <Radio checked={v === 'b'} label="选项 B" onChange={() => setV('b')} />
        <Radio checked={v === 'c'} label="选项 C" onChange={() => setV('c')} />
        <Radio checked={false} disabled label="禁用" />
      </Space>
    </View>
  );
}

/** 按钮风格受控联动回显 */
function ButtonDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState<RadioValue>('a');
  return (
    <View>
      <Radio.Group
        value={v}
        onChange={setV}
        optionType="button"
        options={[
          { label: '日', value: 'a' },
          { label: '周', value: 'b' },
          { label: '月', value: 'c' },
          { label: '年', value: 'd', disabled: true },
        ]}
      />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        当前：{String(v)}
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '受控互斥 + 禁用项',
    node: <BasicDemo />,
    code: [
      'import { Radio } from "react-native-flux-desktop";',
      '',
      '// 受控互斥：外部持有选中值，点击回写',
      "const [v, setV] = React.useState('a');",
      '<Radio checked={v === \'a\'} label="选项 A" onChange={() => setV(\'a\')} />',
      '<Radio checked={v === \'b\'} label="选项 B" onChange={() => setV(\'b\')} />',
      '<Radio checked={false} disabled label="禁用" />',
    ].join('\n'),
  },
  {
    name: '单选组合',
    desc: 'Radio.Group options 简写（字符串或 {label,value,disabled}）',
    node: (
      <Radio.Group
        defaultValue="b"
        options={[
          { label: '选项 A', value: 'a' },
          { label: '选项 B', value: 'b' },
          { label: '选项 C（禁用）', value: 'c', disabled: true },
          { label: '选项 D', value: 'd' },
        ]}
      />
    ),
    code: [
      'import { Radio } from "react-native-flux-desktop";',
      '',
      '// Group.options 简写：字符串或 {label,value,disabled}',
      '<Radio.Group',
      '  defaultValue="b"',
      '  options={[',
      '    { label: \'选项 A\', value: \'a\' },',
      '    { label: \'选项 B\', value: \'b\' },',
      '    { label: \'选项 C（禁用）\', value: \'c\', disabled: true },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '按钮风格',
    desc: 'optionType="button"，选中主色描边 + 主色文字，相邻边框塌陷',
    node: <ButtonDemo />,
    code: [
      'import { Radio } from "react-native-flux-desktop";',
      '',
      '// optionType=button 渲染为按钮组',
      '<Radio.Group',
      '  optionType="button"',
      '  defaultValue="a"',
      '  options={[',
      '    { label: \'日\', value: \'a\' },',
      '    { label: \'周\', value: \'b\' },',
      '    { label: \'年\', value: \'d\', disabled: true },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '按钮尺寸',
    desc: 'size = large / middle / small',
    node: (
      <View style={{ gap: 12 }}>
        <Radio.Group defaultValue="a" optionType="button" size="large" options={['Apple', 'Pear', 'Orange']} />
        <Radio.Group defaultValue="a" optionType="button" size="middle" options={['Apple', 'Pear', 'Orange']} />
        <Radio.Group defaultValue="a" optionType="button" size="small" options={['Apple', 'Pear', 'Orange']} />
      </View>
    ),
    code: [
      'import { Radio } from "react-native-flux-desktop";',
      '',
      '// size 控制按钮风格高度：large / middle / small',
      '<Radio.Group defaultValue="a" optionType="button" size="large" options={[\'Apple\', \'Pear\', \'Orange\']} />',
      '<Radio.Group defaultValue="a" optionType="button" size="small" options={[\'Apple\', \'Pear\', \'Orange\']} />',
    ].join('\n'),
  },
  {
    name: '手写子项',
    desc: 'Group 内直接放 Radio.Button（带 value）',
    node: (
      <Radio.Group defaultValue="x">
        <Radio.Button value="x" label="左对齐" />
        <Radio.Button value="y" label="居中" />
        <Radio.Button value="z" label="右对齐" />
      </Radio.Group>
    ),
    code: [
      'import { Radio } from "react-native-flux-desktop";',
      '',
      '// 不用 options，Group 内手写 Radio.Button 子项',
      '<Radio.Group defaultValue="x">',
      '  <Radio.Button value="x" label="左对齐" />',
      '  <Radio.Button value="y" label="居中" />',
      '  <Radio.Button value="z" label="右对齐" />',
      '</Radio.Group>',
    ].join('\n'),
  },
  {
    name: '整组禁用',
    desc: 'Group disabled 让全部子项不可选',
    node: <Radio.Group disabled defaultValue="b" options={['a', 'b', 'c']} />,
    code: [
      'import { Radio } from "react-native-flux-desktop";',
      '',
      '// Group.disabled 让整组置灰不可交互',
      '<Radio.Group disabled defaultValue="b" options={[\'a\', \'b\', \'c\']} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'checked / defaultChecked', desc: '受控 / 非受控选中', type: 'boolean', default: 'false' },
  { name: 'label', desc: '单选框文字', type: 'ReactNode', default: '–' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'value', desc: 'Group 内的选项值', type: 'string | number', default: '–' },
  { name: 'onChange', desc: '选中回调', type: '(checked) => void', default: '–' },
  { name: 'Group.value / defaultValue', desc: '组受控 / 非受控选中值', type: 'string | number', default: '–' },
  { name: 'Group.options', desc: '选项简写数组', type: '(string|number|Option)[]', default: '–' },
  { name: 'Group.optionType', desc: 'radio 圆点 / button 按钮', type: "'radio' | 'button'", default: "'radio'" },
  { name: 'Group.size', desc: '按钮风格尺寸', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'Group.disabled', desc: '整组禁用', type: 'boolean', default: 'false' },
  { name: 'Group.onChange', desc: '选中值变化回调', type: '(value) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'size', desc: '圆点外圈直径', default: '20' },
  { name: 'dotSize', desc: '内实心点直径', default: '16' },
  { name: 'colorPrimary', desc: '选中描边 / 内点 / 按钮文字', default: '主色' },
];

export function RadioDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
