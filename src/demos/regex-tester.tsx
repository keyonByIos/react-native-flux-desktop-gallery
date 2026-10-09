// 开发 / 正则测试器：模式 + flags + 测试文本实时求值，命中高亮、捕获组列表、替换预览。
// 纯前端零依赖，非法正则 / 零宽匹配 / 巨量命中均有护栏。
import React from 'react';
import { View } from 'react-native-flux-desktop';
import { RegexTester } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

const EMAIL_TEXT = '联系 admin@flux.dev 或 support@keyon.io，无效的是 foo@bar 和 @baz.com';
const DATE_TEXT = '会议 2026-09-27，上线 2026-10-05，回滚 2025/12/31';
const WORD_TEXT = 'Foo bar FOO baz Bar — 忽略大小写时全部命中 4 个 foo 变体';

/** 包一层保证 demo 宽度铺满 */
function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%' }}>{props.node}</View>;
}

const DEMOS: DemoItem[] = [
  {
    name: '邮箱匹配',
    desc: '预置正则 + 测试文本，实时高亮命中并列出编号捕获组；勾选 g/i/m 切换 flags',
    node: <Block node={<RegexTester defaultPattern="(\w+)@(\w+)\.(com|io|dev)" defaultText={EMAIL_TEXT} defaultFlags="g" defaultReplacement="$1 [at] $2.$3" />} />,
    code: [
      'import { RegexTester } from "react-native-flux-desktop";',
      '',
      '// 预置模式/文本/flags/替换串，实时高亮命中并列出捕获组',
      '<RegexTester',
      '  defaultPattern="(\\w+)@(\\w+)\\.(com|io|dev)"',
      '  defaultText={EMAIL_TEXT}',
      '  defaultFlags="g"',
      '  defaultReplacement="$1 [at] $2.$3"',
      '/>',
    ].join('\n'),
  },
  {
    name: '命名捕获组',
    desc: '(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})：捕获组表同时列编号 $1.. 与命名 $<y>',
    node: <Block node={<RegexTester defaultPattern="(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})" defaultText={DATE_TEXT} defaultFlags="g" defaultReplacement="$<y>年$<m>月$<d>日" />} />,
    code: [
      'import { RegexTester } from "react-native-flux-desktop";',
      '',
      '// 命名捕获组：捕获组表同时列编号 $1.. 与命名 $<y>',
      '<RegexTester',
      '  defaultPattern="(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})"',
      '  defaultText={DATE_TEXT}',
      '  defaultFlags="g"',
      '  defaultReplacement="$<y>年$<m>月$<d>日"',
      '/>',
    ].join('\n'),
  },
  {
    name: '忽略大小写',
    desc: '默认勾选 i：foo 变体全部命中；对照取消 i 后仅小写命中',
    node: <Block node={<RegexTester defaultPattern="foo" defaultText={WORD_TEXT} defaultFlags="gi" />} />,
    code: [
      'import { RegexTester } from "react-native-flux-desktop";',
      '',
      '// defaultFlags 含 i 则勾选忽略大小写',
      '<RegexTester defaultPattern="foo" defaultText={WORD_TEXT} defaultFlags="gi" />',
    ].join('\n'),
  },
  {
    name: '空白工具',
    desc: '从零开始：输入非法正则（如未闭合括号）顶部红字提示、不崩溃',
    node: <Block node={<RegexTester defaultFlags="g" />} />,
    code: [
      'import { RegexTester } from "react-native-flux-desktop";',
      '',
      '// 不传预置即空白工具；非法正则顶部红字提示不崩溃',
      '<RegexTester defaultFlags="g" />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'defaultPattern', desc: '初始正则模式', type: 'string', default: "''" },
  { name: 'defaultText', desc: '初始测试文本', type: 'string', default: "''" },
  { name: 'defaultFlags', desc: '初始 flags（含 g/i/m 者对应勾选）', type: 'string', default: "'g'" },
  { name: 'defaultReplacement', desc: '初始替换串', type: 'string', default: "''" },
  { name: 'showReplace', desc: '是否显示替换区', type: 'boolean', default: 'true' },
];

export function RegexTesterDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
