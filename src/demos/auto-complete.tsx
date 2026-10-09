// AUTOCOMPLETE：自动完成。DemoPage 多段式，覆盖 基础 / 自定义 label / 全量展示 / 受控 / 尺寸 / 禁用。
import React from 'react';
import { AutoComplete, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const COLORS = ['红色', '橙色', '黄色', '绿色', '青色', '蓝色', '紫色', '黑色', '白色'];

const EMAILS = [
  'alice@example.com',
 'allen@keyon.dev',
  'bob@example.com',
  'carol@antd.io',
  'dave@react.dev',
  'eve@flux.app',
];

/** 受控演示：右侧回显当前值 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState('');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: 520 }}>
      <View style={{ flex: 1 }}>
        <AutoComplete options={EMAILS} value={v} onChange={setV} placeholder="受控：输入过滤邮箱" allowClear />
      </View>
      <Text style={{ marginLeft: token.margin, fontSize: token.fontSize, color: token.colorPrimary }}>{v || '（空）'}</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '聚焦弹出建议，按输入过滤；点选项回填（此段自动聚焦便于查看面板）',
    node: (
      <AutoComplete
        options={COLORS}
        defaultValue="蓝"
        autoFocus
        placeholder="输入颜色名过滤"
        style={{ maxWidth: 320 }}
      />
    ),
    code: [
      'import { AutoComplete } from "react-native-flux-desktop";',
      '',
      'const COLORS = [\'红色\', \'橙色\', \'黄色\', \'绿色\', \'蓝色\'];',
      '',
      '// 聚焦弹出建议，按输入过滤；点选项回填',
      '<AutoComplete',
      '  options={COLORS}',
      '  defaultValue="蓝"',
      '  autoFocus',
      '  placeholder="输入颜色名过滤"',
      '/>',
    ].join('\n'),
  },
  {
    name: '自定义 label',
    desc: 'options 传 {value,label}，展示与取值分离',
    node: (
      <AutoComplete
        options={[
          { value: 'React', label: '⚛ React' },
          { value: 'Vue', label: '◈ Vue' },
          { value: 'Svelte', label: '🔥 Svelte' },
          { value: 'Angular', label: '🅰 Angular' },
        ]}
        placeholder="选择前端框架"
        style={{ maxWidth: 320 }}
      />
    ),
    code: [
      'import { AutoComplete } from "react-native-flux-desktop";',
      '',
      '// options 传 {value,label}，展示与取值分离',
      '<AutoComplete',
      '  options={[',
      '    { value: \'React\', label: \'⚛ React\' },',
      '    { value: \'Vue\', label: \'◈ Vue\' },',
      '    { value: \'Svelte\', label: \'🔥 Svelte\' },',
      '  ]}',
      '  placeholder="选择前端框架"',
      '/>',
    ].join('\n'),
  },
  {
    name: '不过滤（全量展示）',
    desc: 'filterOption=false 始终列出全部选项',
    node: <AutoComplete options={EMAILS} filterOption={false} placeholder="聚焦看全部邮箱" style={{ maxWidth: 320 }} />,
    code: [
      'import { AutoComplete } from "react-native-flux-desktop";',
      '',
      '// filterOption=false 始终列出全部选项',
      '<AutoComplete options={EMAILS} filterOption={false} placeholder="聚焦看全部邮箱" />',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange 外部持有，onSelect 记录点选',
    node: <ControlledDemo />,
    code: [
      'import { AutoComplete } from "react-native-flux-desktop";',
      '',
      '// value + onChange 外部持有',
      'const [v, setV] = useState(\'\');',
      '<AutoComplete options={EMAILS} value={v} onChange={setV} allowClear />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: "size='large' / 'small'",
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', maxWidth: 520 }}>
        <View style={{ flex: 1, minWidth: 220, marginRight: 12 }}>
          <AutoComplete options={COLORS} size="large" placeholder="大号" />
        </View>
        <View style={{ flex: 1, minWidth: 220 }}>
          <AutoComplete options={COLORS} size="small" placeholder="小号" />
        </View>
      </View>
    ),
    code: [
      'import { AutoComplete, View } from "react-native-flux-desktop";',
      '',
      '// size=large / small',
      '<View style={{ flexDirection: \'row\' }}>',
      '  <AutoComplete options={COLORS} size="large" placeholder="大号" />',
      '  <AutoComplete options={COLORS} size="small" placeholder="小号" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 置灰不可输入',
    node: <AutoComplete options={COLORS} defaultValue="蓝色" disabled style={{ maxWidth: 320 }} />,
    code: [
      'import { AutoComplete } from "react-native-flux-desktop";',
      '',
      '// disabled 置灰不可输入',
      '<AutoComplete options={COLORS} defaultValue="蓝色" disabled />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'options', desc: '候选项（字符串或 {value,label}）', type: '(string | Option)[]', default: '[]' },
  { name: 'value / defaultValue', desc: '受控 / 初值', type: 'string', default: '–' },
  { name: 'filterOption', desc: '过滤方式（false=全量）', type: "boolean | (input,option)=>boolean", default: 'true' },
  { name: 'allowClear', desc: '可清除', type: 'boolean', default: 'false' },
  { name: 'size', desc: '尺寸', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'onChange / onSelect', desc: '输入变化 / 点选', type: '(v: string) => void', default: '–' },
  { name: 'onSearch', desc: '检索词变化', type: '(v: string) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: '建议面板底', default: '浮层背景' },
  { name: 'colorPrimaryBg', desc: '当前值高亮行', default: '主色浅底' },
  { name: 'colorFillTertiary', desc: '悬停行底色', default: '三级填充' },
];

export function AutoCompleteDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
