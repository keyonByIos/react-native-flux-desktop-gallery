// MENTIONS：提及组件。DemoPage 多段式，覆盖 基础 / 自定义前缀 / 长列表滚动 / 受控 / 禁用。
// 交互提示：本栈拿不到光标位，采用「尾部 token 检测」——文本以 @+无空白串 结尾时弹面板。
import React from 'react';
import { Mentions, Text, View, useToken, type MentionsOption } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const USERS = ['张三', '张伟', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑一'];
const LONG = USERS.map((u) => ({ value: u }));

/** 受控演示：外部持有文本 + 记录最近选中 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [v, setV] = React.useState('麻烦 ');
  const [last, setLast] = React.useState('–');
  return (
    <View style={{ maxWidth: 420 }}>
      <Mentions
        value={v}
        options={USERS}
        onChange={setV}
        onSelect={(o: MentionsOption) => setLast(o.value)}
        placeholder="输入 @ 唤起人员列表"
      />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        最近提及：{last} · 当前文本：{v || '空'}
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '输入 @ 弹出人员列表，继续输入按 value 过滤，点选插入',
    node: (
      <View style={{ maxWidth: 420 }}>
        <Mentions defaultValue="请 @张伟 协助核对账单。@" options={USERS} placeholder="输入 @ 唤起列表" />
      </View>
    ),
    code: [
      'import { Mentions } from "react-native-flux-desktop";',
      '',
      '// 输入 @ 弹出人员列表，继续输入按 value 过滤，点选插入',
      'const USERS = [\'张三\', \'张伟\', \'李四\', \'王五\'];',
      '<Mentions defaultValue="请 @张伟 协助核对账单。@" options={USERS} placeholder="输入 @ 唤起列表" />',
    ].join('\n'),
  },
  {
    name: '自定义前缀',
    desc: "prefix='#' 用话题触发",
    node: (
      <View style={{ maxWidth: 420 }}>
        <Mentions prefix="#" options={['需求评审', '线上故障', '迭代排期', '性能优化']} defaultValue="记一个 #" />
      </View>
    ),
    code: [
      'import { Mentions } from "react-native-flux-desktop";',
      '',
      '// prefix=# 用话题触发',
      '<Mentions',
      '  prefix="#"',
      '  options={[\'需求评审\', \'线上故障\', \'迭代排期\', \'性能优化\']}',
      '  defaultValue="记一个 #"',
      '/>',
    ].join('\n'),
  },
  {
    name: '长列表 / 禁用项',
    desc: '超 maxHeight 内部滚动；disabled 项置灰不可选',
    node: (
      <View style={{ maxWidth: 420 }}>
        <Mentions
          options={[...LONG.slice(0, 4), { value: '已离职员工', disabled: true }, ...LONG.slice(4)]}
          defaultValue="@张三"
        />
      </View>
    ),
    code: [
      'import { Mentions } from "react-native-flux-desktop";',
      '',
      '// 超 maxHeight 内部滚动；disabled 项置灰不可选',
      '<Mentions',
      '  options={[',
      '    { value: \'张三\' },',
      '    { value: \'已离职员工\', disabled: true },',
      '    { value: \'李四\' },',
      '  ]}',
      '  defaultValue="@张三"',
      '/>',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange 外部持有，onSelect 记录点选',
    node: <ControlledDemo />,
    code: [
      'import { Mentions } from "react-native-flux-desktop";',
      '',
      '// value + onChange 外部持有，onSelect 记录点选',
      'const [v, setV] = useState(\'麻烦 \');',
      '<Mentions value={v} options={USERS} onChange={setV} onSelect={(o) => setLast(o.value)} />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 整体不可编辑不弹面板',
    node: (
      <View style={{ maxWidth: 420 }}>
        <Mentions disabled defaultValue="@李四 已处理" options={USERS} />
      </View>
    ),
    code: [
      'import { Mentions } from "react-native-flux-desktop";',
      '',
      '// disabled 整体不可编辑不弹面板',
      '<Mentions disabled defaultValue="@李四 已处理" options={USERS} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'options', desc: '候选项（string 或 {value,label,disabled}）', type: 'MentionsOption[]', default: '–' },
  { name: 'prefix', desc: '触发前缀', type: 'string', default: "'@'" },
  { name: 'value / defaultValue', desc: '受控 / 初值', type: 'string', default: '–' },
  { name: 'rows', desc: '显示行数', type: 'number', default: '3' },
  { name: 'maxHeight', desc: '面板最大高度，超出内滚', type: 'number', default: '200' },
  { name: 'onSelect', desc: '点选回调（插入前）', type: '(opt) => void', default: '–' },
  { name: 'onChange', desc: '文本变化', type: '(v: string) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgElevated', desc: '建议面板底', default: '浮层背景' },
  { name: 'colorFillTertiary', desc: '选项 hover 底', default: '三态填充' },
  { name: 'colorSplit', desc: '面板描边', default: '分隔色' },
];

export function MentionsDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
