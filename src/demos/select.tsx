// SELECT：选择器。统一走 DemoPage 多段式，覆盖 单选 / 多选 / 尺寸 / 校验状态 / 标签折叠 / 禁用 / 弹出方向 / 受控。
// 面板绝对定位覆盖，不占文档流；常驻展开段用固定高度容器预留空间。
import React from 'react';
import { Select, View, Text, useToken, type SelectOption } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const OPTIONS: SelectOption[] = [
  { label: '阿里巴巴', value: 'ali' },
  { label: '腾讯', value: 'tencent' },
  { label: '字节跳动', value: 'bytedance' },
  { label: '美团', value: 'meituan' },
  { label: '京东（禁用）', value: 'jd', disabled: true },
  { label: '网易', value: 'netease' },
];

/** 单选受控回显 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState<string>('tencent');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
      <Select options={OPTIONS} value={v} onChange={(x) => setV(x as string)} allowClear style={{ width: 200 }} />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>当前：{v || '未选'}</Text>
    </View>
  );
}

/** 标签折叠：多选超 maxTagCount 折叠为 +N（常驻展开） */
function MaxTagDemo(): React.ReactElement {
  return (
    <View style={{ }}>
      <Select
        mode="multiple"
        options={OPTIONS}
        defaultValue={['ali', 'tencent', 'bytedance', 'meituan']}
        maxTagCount={2}
      />
    </View>
  );
}

const W = 240;

const DEMOS: DemoItem[] = [
  {
    name: '单选',
    desc: '点触发器展开面板，选项点即收起；allowClear 可清除',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <Select options={OPTIONS} defaultValue="tencent" allowClear style={{ width: W }} />
        <Select options={OPTIONS} placeholder="请选择公司" style={{ width: W }} />
      </View>
    ),
    code: [
      'import { Select } from "react-native-flux-desktop";',
      '',
      'const OPTIONS = [',
      '  { label: \'阿里巴巴\', value: \'ali\' },',
      '  { label: \'腾讯\', value: \'tencent\' },',
      '  { label: \'京东（禁用）\', value: \'jd\', disabled: true },',
      '];',
      '<Select options={OPTIONS} defaultValue="tencent" allowClear style={{ width: 240 }} />',
    ].join('\n'),
  },
  {
    name: '多选',
    desc: 'mode="multiple" 勾选多项，标签回显',
    node: <Select mode="multiple" options={OPTIONS} defaultValue={['ali', 'bytedance']} style={{ width: W * 1.4 }} />,
    code: [
      'import { Select } from "react-native-flux-desktop";',
      '',
      '// mode=multiple 勾选多项，标签回显',
      '<Select mode="multiple" options={OPTIONS} defaultValue={[\'ali\', \'bytedance\']} style={{ width: 320 }} />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = large / middle / small',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <Select options={OPTIONS} defaultValue="ali" size="large" style={{ width: W }} />
        <Select options={OPTIONS} defaultValue="ali" size="middle" style={{ width: W }} />
        <Select options={OPTIONS} defaultValue="ali" size="small" style={{ width: W }} />
      </View>
    ),
    code: [
      'import { Select } from "react-native-flux-desktop";',
      '',
      '// size = large / middle / small',
      '<Select options={OPTIONS} defaultValue="ali" size="large" style={{ width: 240 }} />',
      '<Select options={OPTIONS} defaultValue="ali" size="small" style={{ width: 240 }} />',
    ].join('\n'),
  },
  {
    name: '校验状态',
    desc: 'status = error / warning，描红 / 黄边',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <Select options={OPTIONS} defaultValue="ali" status="error" style={{ width: W }} />
        <Select options={OPTIONS} defaultValue="ali" status="warning" style={{ width: W }} />
      </View>
    ),
    code: [
      'import { Select } from "react-native-flux-desktop";',
      '',
      '// status = error / warning 描红 / 黄边',
      '<Select options={OPTIONS} defaultValue="ali" status="error" style={{ width: 240 }} />',
      '<Select options={OPTIONS} defaultValue="ali" status="warning" style={{ width: 240 }} />',
    ].join('\n'),
  },
  {
    name: '标签折叠',
    desc: 'maxTagCount=2，超出折叠为 +N（此段常驻展开）',
    node: <MaxTagDemo />,
    code: [
      'import { Select } from "react-native-flux-desktop";',
      '',
      '// maxTagCount 超出折叠为 +N',
      '<Select',
      '  mode="multiple"',
      '  options={OPTIONS}',
      '  defaultValue={[\'ali\', \'tencent\', \'bytedance\', \'meituan\']}',
      '  maxTagCount={2}',
      '/>',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 灰显不可点',
    node: <Select options={OPTIONS} defaultValue="ali" disabled style={{ width: W }} />,
    code: [
      'import { Select } from "react-native-flux-desktop";',
      '',
      '// disabled 灰显不可点',
      '<Select options={OPTIONS} defaultValue="ali" disabled style={{ width: 240 }} />',
    ].join('\n'),
  },
  {
    name: '弹出方向',
    desc: 'placement = bottomRight / topLeft / topRight',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <Select options={OPTIONS} defaultValue="ali" placement="bottomRight" style={{ width: W }} />
        <Select options={OPTIONS} defaultValue="ali" placement="topLeft" style={{ width: W }} />
        <Select options={OPTIONS} defaultValue="ali" placement="topRight" style={{ width: W }} />
      </View>
    ),
    code: [
      'import { Select } from "react-native-flux-desktop";',
      '',
      '// placement 控制下拉面板弹出方向',
      '<Select options={OPTIONS} defaultValue="ali" placement="bottomRight" style={{ width: 240 }} />',
      '<Select options={OPTIONS} defaultValue="ali" placement="topLeft" style={{ width: 240 }} />',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange',
    node: <ControlledDemo />,
    code: [
      'import { Select } from "react-native-flux-desktop";',
      '',
      '// 受控：value + onChange',
      "const [v, setV] = React.useState('tencent');",
      '<Select options={OPTIONS} value={v} onChange={(x) => setV(x)} allowClear style={{ width: 200 }} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'options', desc: '选项数组 {label,value,disabled}', type: 'SelectOption[]', default: '–' },
  { name: 'value / defaultValue', desc: '受控 / 非受控值', type: 'string | string[]', default: '–' },
  { name: 'mode', desc: "'multiple' 多选", type: 'string', default: '–' },
  { name: 'size', desc: '高度三档', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'status', desc: '校验状态', type: "'error' | 'warning'", default: '–' },
  { name: 'placement', desc: '弹出方向', type: "'bottomLeft'|'bottomRight'|'topLeft'|'topRight'", default: "'bottomLeft'" },
  { name: 'maxTagCount', desc: '多选最多直接展示标签数（超出 +N）', type: 'number', default: '–' },
  { name: 'allowClear', desc: '允许清除', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'placeholder', desc: '占位符', type: 'string', default: "'请选择'" },
  { name: 'onChange', desc: '选中变化回调', type: '(value) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '触发器高度（middle）', default: '32' },
  { name: 'colorBgElevated', desc: '下拉面板背景', default: '浮层底色' },
  { name: 'colorPrimary', desc: '选中项 / 聚焦描边', default: '主色' },
];

export function SelectDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
