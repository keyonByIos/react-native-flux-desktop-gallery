// 开发 / Cron 解析器：输入 5 段 cron → 合法性 + 中文描述 + 五字段分解 + 未来 N 次触发。纯前端零依赖。
import React from 'react';
import { View } from 'react-native-flux-desktop';
import { CronParser } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

/** 包一层保证 demo 宽度铺满 */
function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%' }}>{props.node}</View>;
}

const DEMOS: DemoItem[] = [
  {
    name: '工作日工作时间',
    desc: '*/15 9-18 * * 1-5：每 15 分钟、9~18 点、周一至周五；顶部中文描述 + 五字段分解 + 未来 5 次触发时刻',
    node: <Block node={<CronParser defaultValue="*/15 9-18 * * 1-5" />} />,
    code: [
      'import { CronParser } from "react-native-flux-desktop";',
      '',
      '// 输入 5 段 cron → 合法性 + 中文描述 + 五字段分解 + 未来 N 次触发',
      '<CronParser defaultValue="*/15 9-18 * * 1-5" />',
    ].join('\n'),
  },
  {
    name: '宏表达式',
    desc: '@daily 等宏自动展开（分 时 日 月 周 = 0 0 * * *），点预设芯片一键填充',
    node: <Block node={<CronParser defaultValue="@daily" />} />,
    code: [
      'import { CronParser } from "react-native-flux-desktop";',
      '',
      '// @daily 等宏自动展开为 0 0 * * *',
      '<CronParser defaultValue="@daily" />',
    ].join('\n'),
  },
  {
    name: '非法输入护栏',
    desc: '输入错误段数或越界值 → 顶部红字提示原因，不崩溃；改正后即时恢复',
    node: <Block node={<CronParser defaultValue="0 0 32 * *" />} />,
    code: [
      'import { CronParser } from "react-native-flux-desktop";',
      '',
      '// 越界值（如 32 日）顶部红字提示原因，不崩溃',
      '<CronParser defaultValue="0 0 32 * *" />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'defaultValue', desc: '初始 cron 表达式（支持 @daily 等宏）', type: 'string', default: "'*/15 9-18 * * 1-5'" },
  { name: 'previewCount', desc: '预览未来触发次数', type: 'number', default: '5' },
];

export function CronParserDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
