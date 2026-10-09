// SEGMENTED：分段控制。统一走 DemoPage 多段式，覆盖 基础 / block / 尺寸 / 图标 / 圆角形状 / 禁用。
import React from 'react';
import { Segmented, View } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础 */
function BasicDemo(): React.ReactElement {
  const [v, setV] = React.useState<string | number>('列表');
  return <Segmented options={['列表', '看板', '表格']} value={v} onChange={setV} />;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点击切换，选中滑块平滑迁移',
    node: <BasicDemo />,
    code: [
      'import { Segmented } from "react-native-flux-desktop";',
      '',
      '// 受控：value + onChange，选中滑块平滑迁移',
      'const [v, setV] = useState<string | number>(\'列表\');',
      '<Segmented options={[\'列表\', \'看板\', \'表格\']} value={v} onChange={setV} />',
    ].join('\n'),
  },
  {
    name: 'block 撑满',
    desc: 'block 让控件填满容器宽度',
    node: (
      <View style={{ maxWidth: 460 }}>
        <Segmented block options={['日', '周', '月', '年']} defaultValue="周" />
      </View>
    ),
    code: [
      'import { Segmented, View } from "react-native-flux-desktop";',
      '',
      '// block 让控件填满容器宽度',
      '<View style={{ maxWidth: 460 }}>',
      '  <Segmented block options={[\'日\', \'周\', \'月\', \'年\']} defaultValue="周" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size：small / middle / large',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <Segmented size="small" options={['a', 'b', 'c']} defaultValue="a" />
        <Segmented size="middle" options={['a', 'b', 'c']} defaultValue="b" />
        <Segmented size="large" options={['a', 'b', 'c']} defaultValue="c" />
      </View>
    ),
    code: [
      'import { Segmented, View } from "react-native-flux-desktop";',
      '',
      '// size：small / middle / large',
      '<View style={{ flexDirection: \'row\', gap: 20 }}>',
      '  <Segmented size="small" options={[\'a\', \'b\', \'c\']} defaultValue="a" />',
      '  <Segmented size="middle" options={[\'a\', \'b\', \'c\']} defaultValue="b" />',
      '  <Segmented size="large" options={[\'a\', \'b\', \'c\']} defaultValue="c" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '图标',
    desc: 'option.icon 在文字左侧加图标',
    node: (
      <Segmented
        defaultValue="list"
        options={[
          { label: '列表', value: 'list', icon: 'bars' },
          { label: '看板', value: 'kanban', icon: 'table' },
          { label: '云盘', value: 'cloud', icon: 'cloud' },
        ]}
      />
    ),
    code: [
      'import { Segmented } from "react-native-flux-desktop";',
      '',
      '// option.icon 在文字左侧加图标',
      '<Segmented',
      '  defaultValue="list"',
      '  options={[',
      '    { label: \'列表\', value: \'list\', icon: \'bars\' },',
      '    { label: \'看板\', value: \'kanban\', icon: \'table\' },',
      '    { label: \'云盘\', value: \'cloud\', icon: \'cloud\' },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '圆角形状',
    desc: "shape='round' 胶囊外观",
    node: (
      <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
        <Segmented shape="round" options={['圆角', '默认']} defaultValue="圆角" />
        <Segmented shape="round" size="large" options={['大胶囊', 'B', 'C']} defaultValue="大胶囊" />
      </View>
    ),
    code: [
      'import { Segmented, View } from "react-native-flux-desktop";',
      '',
      '// shape=round 胶囊外观',
      '<View style={{ flexDirection: \'row\', gap: 20 }}>',
      '  <Segmented shape="round" options={[\'圆角\', \'默认\']} defaultValue="圆角" />',
      '  <Segmented shape="round" size="large" options={[\'大胶囊\', \'B\', \'C\']} defaultValue="大胶囊" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 整体禁用；option.disabled 单项禁用',
    node: (
      <View style={{ gap: 16 }}>
        <Segmented disabled options={['全部禁用', 'B', 'C']} defaultValue="全部禁用" />
        <Segmented
          defaultValue="可点"
          options={[
            { label: '可点', value: 'a' },
            { label: '禁用项', value: 'b', disabled: true },
            { label: 'C', value: 'c' },
          ]}
        />
      </View>
    ),
    code: [
      'import { Segmented, View } from "react-native-flux-desktop";',
      '',
      '// disabled 整体禁用；option.disabled 单项禁用',
      '<View style={{ gap: 16 }}>',
      '  <Segmented disabled options={[\'全部禁用\', \'B\', \'C\']} defaultValue="全部禁用" />',
      '  <Segmented',
      '    defaultValue="可点"',
      '    options={[',
      '      { label: \'可点\', value: \'a\' },',
      '      { label: \'禁用项\', value: \'b\', disabled: true },',
      '      { label: \'C\', value: \'c\' },',
      '    ]}',
      '  />',
      '</View>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'options', desc: '选项（含 label/value/icon/disabled）', type: 'SegmentedOption[]', default: '[]' },
  { name: 'value / defaultValue', desc: '受控 / 默认值', type: 'string | number', default: '–' },
  { name: 'onChange', desc: '切换回调', type: '(v) => void', default: '–' },
  { name: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", default: "'middle'" },
  { name: 'block', desc: '撑满容器', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '整体禁用', type: 'boolean', default: 'false' },
  { name: 'shape', desc: '形状', type: "'default' | 'round'", default: "'default'" },
];

const TOKENS: TokenRow[] = [
  { name: 'trackBg', desc: '轨道底色', default: 'Segmented token' },
  { name: 'thumbBg', desc: '滑块底色', default: 'Segmented token' },
  { name: 'controlHeight', desc: 'middle 高度', default: '32' },
];

export function SegmentedDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
