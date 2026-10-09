// CASCADER：级联选择。统一走 DemoPage 多段式，覆盖 antd v5 基础 / 多级面板 / 尺寸 / 选中即提交 / 自定义回显 / 禁用校验 / 弹出方向。
import React from 'react';
import { Cascader, View, Text, useToken, type CascaderOption } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const OPTIONS: CascaderOption[] = [
  {
    label: '浙江',
    value: 'zj',
    children: [
      { label: '杭州', value: 'hz', children: [
        { label: '西湖区', value: 'xh' },
        { label: '余杭区', value: 'yh' },
        { label: '滨江区', value: 'bj' },
      ] },
      { label: '宁波', value: 'nb', children: [
        { label: '海曙区', value: 'hs' },
        { label: '江北区', value: 'jb' },
      ] },
    ],
  },
  {
    label: '江苏',
    value: 'js',
    children: [
      { label: '南京', value: 'nj', children: [
        { label: '玄武区', value: 'xw' },
        { label: '鼓楼区', value: 'gl' },
      ] },
      { label: '苏州', value: 'sz', children: [
        { label: '姑苏区', value: 'gs' },
        { label: '工业园区', value: 'gy' },
      ] },
    ],
  },
  { label: '北京', value: 'bj2' },
  { label: '（禁用）', value: 'off', disabled: true },
];

/** 受控：选中结果写回外部 state */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [val, setVal] = React.useState<string[]>(['zj', 'hz', 'xh']);
  return (
    <View>
      <Cascader options={OPTIONS} value={val} allowClear onChange={(v) => setVal(v)} style={{ width: 240 }} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginTop: token.marginXS }}>
        当前路径：{val.length ? val.join(' / ') : '（空）'}
      </Text>
    </View>
  );
}

/** 常驻展开的多级面板（预留面板高度，避免压住后续内容） */
function OpenPanelDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ }}>
      <Cascader options={OPTIONS} defaultValue={['zj', 'hz']} style={{ width: 260 }} />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: '点触发器展开多列面板，逐级下钻到叶子提交',
    node: <ControlledDemo />,
    code: [
      'import { Cascader, type CascaderOption } from "react-native-flux-desktop";',
      '',
      'const OPTIONS: CascaderOption[] = [',
      '  { label: \'浙江\', value: \'zj\', children: [{ label: \'杭州\', value: \'hz\' }] },',
      '  { label: \'北京\', value: \'bj2\' },',
      '];',
      '',
      '// 受控：选中结果写回外部 state',
      '<Cascader options={OPTIONS} value={val} allowClear onChange={(v) => setVal(v)} style={{ width: 240 }} />',
    ].join('\n'),
  },
  {
    name: '多级面板',
    desc: '每列一屏选项，右侧箭头指示可下钻',
    node: <OpenPanelDemo />,
    code: [
      'import { Cascader } from "react-native-flux-desktop";',
      '',
      '// 每列一屏选项，右侧箭头指示可下钻',
      '<Cascader options={OPTIONS} defaultValue={[\'zj\', \'hz\']} style={{ width: 260 }} />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size=large / middle / small',
    node: (
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Cascader options={OPTIONS} size="large" placeholder="大" style={{ width: 180 }} />
        <Cascader options={OPTIONS} size="middle" placeholder="中" style={{ width: 180 }} />
        <Cascader options={OPTIONS} size="small" placeholder="小" style={{ width: 180 }} />
      </View>
    ),
    code: [
      'import { Cascader, View } from "react-native-flux-desktop";',
      '',
      '// size=large / middle / small',
      '<View style={{ flexDirection: \'row\', gap: 16 }}>',
      '  <Cascader options={OPTIONS} size="large" placeholder="大" style={{ width: 180 }} />',
      '  <Cascader options={OPTIONS} size="middle" placeholder="中" style={{ width: 180 }} />',
      '  <Cascader options={OPTIONS} size="small" placeholder="小" style={{ width: 180 }} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '选中即提交',
    desc: 'changeOnSelect 允许选择任意一级（不必到叶子）',
    node: <Cascader options={OPTIONS} changeOnSelect placeholder="可选到省市任意级" style={{ width: 240 }} />,
    code: [
      'import { Cascader } from "react-native-flux-desktop";',
      '',
      '// changeOnSelect 允许选择任意一级（不必到叶子）',
      '<Cascader options={OPTIONS} changeOnSelect placeholder="可选到省市任意级" style={{ width: 240 }} />',
    ].join('\n'),
  },
  {
    name: '自定义回显',
    desc: 'displayRender 定制触发器显示',
    node: (
      <Cascader
        options={OPTIONS}
        defaultValue={['zj', 'hz', 'xh']}
        displayRender={(labels) => labels.join(' > ')}
        style={{ width: 240 }}
      />
    ),
    code: [
      'import { Cascader } from "react-native-flux-desktop";',
      '',
      '// displayRender 定制触发器显示',
      '<Cascader',
      '  options={OPTIONS}',
      '  defaultValue={[\'zj\', \'hz\', \'xh\']}',
      '  displayRender={(labels) => labels.join(\' > \')}',
      '  style={{ width: 240 }}',
      '/>',
    ].join('\n'),
  },
  {
    name: '禁用与校验',
    desc: 'disabled 整体禁用 / status=error 红框',
    node: (
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        <Cascader options={OPTIONS} defaultValue={['bj2']} disabled style={{ width: 200 }} />
        <Cascader options={OPTIONS} placeholder="必填项" status="error" style={{ width: 200 }} />
      </View>
    ),
    code: [
      'import { Cascader, View } from "react-native-flux-desktop";',
      '',
      '// disabled 整体禁用 / status=error 红框',
      '<View style={{ flexDirection: \'row\', gap: 16 }}>',
      '  <Cascader options={OPTIONS} defaultValue={[\'bj2\']} disabled style={{ width: 200 }} />',
      '  <Cascader options={OPTIONS} placeholder="必填项" status="error" style={{ width: 200 }} />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '弹出方向',
    desc: 'placement=bottomRight 面板右对齐',
    node: (
      <View style={{ alignItems: 'flex-end' }}>
        <Cascader options={OPTIONS} defaultValue={['js', 'nj']} placement="bottomRight" style={{ width: 240 }} />
      </View>
    ),
    code: [
      'import { Cascader, View } from "react-native-flux-desktop";',
      '',
      '// placement=bottomRight 面板右对齐',
      '<View style={{ alignItems: \'flex-end\' }}>',
      '  <Cascader options={OPTIONS} defaultValue={[\'js\', \'nj\']} placement="bottomRight" style={{ width: 240 }} />',
      '</View>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'options', desc: '级联数据源', type: 'CascaderOption[]', default: '[]' },
  { name: 'value / defaultValue', desc: '受控 / 非受控选中路径', type: 'string[]', default: '[]' },
  { name: 'onChange', desc: '选中变化回调', type: '(value, selectedOptions) => void', default: '–' },
  { name: 'placeholder', desc: '占位文本', type: 'ReactNode', default: "'请选择'" },
  { name: 'size', desc: '尺寸', type: "'large' | 'middle' | 'small'", default: "'middle'" },
  { name: 'placement', desc: '面板弹出方向', type: "'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'", default: "'bottomLeft'" },
  { name: 'expandTrigger', desc: '展开下级触发方式', type: "'click' | 'hover'", default: "'click'" },
  { name: 'changeOnSelect', desc: '选中任意一级即提交', type: 'boolean', default: 'false' },
  { name: 'displayRender', desc: '自定义回显', type: '(labels, selectedOptions) => ReactNode', default: '–' },
  { name: 'allowClear', desc: '可清除', type: 'boolean', default: 'false' },
  { name: 'showArrow', desc: '显示右侧箭头', type: 'boolean', default: 'true' },
  { name: 'status', desc: '校验状态', type: "'error' | 'warning'", default: '–' },
  { name: 'disabled', desc: '整体禁用', type: 'boolean', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: 'middle 触发器高度', default: 'controlHeight' },
  { name: 'controlHeightLG / SM', desc: 'large / small 触发器高度', default: '派生' },
  { name: 'colorPrimary', desc: '展开态边框 / 选中项文字色', default: '主色' },
  { name: 'colorError / colorWarning', desc: '校验状态边框色', default: '语义色' },
];

export function CascaderDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
