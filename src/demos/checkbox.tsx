// CHECKBOX：多选框。统一走 DemoPage 多段式，覆盖 基础 / 全选半选联动 / Group options / 手写 children / 整组禁用。
import React from 'react';
import { Checkbox, View, Space, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 全选 + 半选联动：父框 indeterminate，子组勾选数决定全选态 */
function CheckAllDemo(): React.ReactElement {
  const { token } = useToken();
  const plain = ['苹果', '梨', '橙子'];
  const [checkedList, setCheckedList] = React.useState<(string | number)[]>(['苹果']);
  const allChecked = checkedList.length === plain.length;
  const indeterminate = checkedList.length > 0 && checkedList.length < plain.length;
  return (
    <View>
      <Checkbox
        indeterminate={indeterminate}
        checked={allChecked}
        onChange={(c) => setCheckedList(c ? plain : [])}
        label="全选"
      />
      <View style={{ height: token.marginXS }} />
      <Checkbox.Group options={plain} value={checkedList} onChange={setCheckedList} />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '受控 / 默认选中 / 未选 / 禁用',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, rowGap: 12 }}>
        <Space>
          <BaseControlled />
        <Checkbox defaultChecked label="默认选中" />
        <Checkbox label="未选" />
        <Checkbox checked disabled label="禁用已选" />
        <Checkbox disabled label="禁用未选" />
        </Space>
      </View>
    ),
    code: [
      'import { Checkbox, Space } from "react-native-flux-desktop";',
      '',
      '// 受控 / 默认选中 / 未选 / 禁用',
      '<Checkbox checked={ck} label="受控勾选" onChange={setCk} />',
      '<Checkbox defaultChecked label="默认选中" />',
      '<Checkbox label="未选" />',
      '<Checkbox checked disabled label="禁用已选" />',
    ].join('\n'),
  },
  {
    name: '全选与半选',
    desc: 'indeterminate 半选横杠，随子项勾选数联动',
    node: <CheckAllDemo />,
    code: [
      'import { Checkbox } from "react-native-flux-desktop";',
      '',
      '// 父框 indeterminate 半选，随子组勾选数联动',
      '<Checkbox',
      '  indeterminate={indeterminate}',
      '  checked={allChecked}',
      '  onChange={(c) => setCheckedList(c ? plain : [])}',
      '  label="全选"',
      '/>',
      '<Checkbox.Group options={plain} value={checkedList} onChange={setCheckedList} />',
    ].join('\n'),
  },
  {
    name: '选项组',
    desc: 'Checkbox.Group options 简写（字符串或 {label,value,disabled}）',
    node: (
      <Checkbox.Group
        defaultValue={['b']}
        options={[
          { label: '选项 A', value: 'a' },
          { label: '选项 B', value: 'b' },
          { label: '选项 C（禁用）', value: 'c', disabled: true },
          { label: '选项 D', value: 'd' },
        ]}
      />
    ),
    code: [
      'import { Checkbox } from "react-native-flux-desktop";',
      '',
      '// Checkbox.Group options 简写（字符串或 {label,value,disabled}）',
      '<Checkbox.Group',
      '  defaultValue={[\'b\']}',
      '  options={[',
      '    { label: \'选项 A\', value: \'a\' },',
      '    { label: \'选项 C（禁用）\', value: \'c\', disabled: true },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '手写子项',
    desc: 'Group 内直接放 Checkbox（带 value）',
    node: (
      <Checkbox.Group defaultValue={['x']}>
        <Checkbox value="x" label="番茄" />
        <Checkbox value="y" label="黄瓜" />
        <Checkbox value="z" label="茄子" />
      </Checkbox.Group>
    ),
    code: [
      'import { Checkbox } from "react-native-flux-desktop";',
      '',
      '// Group 内直接放 Checkbox（带 value）',
      '<Checkbox.Group defaultValue={[\'x\']}>',
      '  <Checkbox value="x" label="番茄" />',
      '  <Checkbox value="y" label="黄瓜" />',
      '  <Checkbox value="z" label="茄子" />',
      '</Checkbox.Group>',
    ].join('\n'),
  },
  {
    name: '整组禁用',
    desc: 'Group disabled 让全部子项不可点',
    node: (
      <Checkbox.Group disabled defaultValue={['a', 'b']} options={['a', 'b', 'c']} />
    ),
    code: [
      'import { Checkbox } from "react-native-flux-desktop";',
      '',
      '// Group disabled 让全部子项不可点',
      '<Checkbox.Group disabled defaultValue={[\'a\', \'b\']} options={[\'a\', \'b\', \'c\']} />',
    ].join('\n'),
  },
];

/** 受控单项（自带 state） */
function BaseControlled(): React.ReactElement {
  const [ck, setCk] = React.useState(true);
  return <Checkbox checked={ck} label="受控勾选" onChange={setCk} />;
}

const API: ApiRow[] = [
  { name: 'checked / defaultChecked', desc: '受控 / 非受控选中', type: 'boolean', default: 'false' },
  { name: 'label', desc: '多选框文字', type: 'ReactNode', default: '–' },
  { name: 'indeterminate', desc: '半选状态（框内横杠）', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'value', desc: 'Group 内的选项值', type: 'string | number', default: '–' },
  { name: 'onChange', desc: '选中变化回调', type: '(checked) => void', default: '–' },
  { name: 'Group.value / defaultValue', desc: '组受控 / 非受控选中值集合', type: '(string|number)[]', default: '[]' },
  { name: 'Group.options', desc: '选项简写数组', type: '(string|number|Option)[]', default: '–' },
  { name: 'Group.disabled', desc: '整组禁用', type: 'boolean', default: 'false' },
  { name: 'Group.onChange', desc: '组选中集合变化回调', type: '(checkedValue[]) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlInteractiveSize', desc: '方框边长', default: '20' },
  { name: 'borderRadiusSM', desc: '方框圆角', default: 'borderRadiusSM' },
  { name: 'colorPrimary', desc: '选中 / 半选填色', default: '主色' },
];

export function CheckboxDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
