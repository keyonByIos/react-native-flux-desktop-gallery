// 开发 / 时间戳转换器：Unix 时间戳 ↔ 日历时间双向转换，含实时时钟 + 多时区 + 相对时间。纯前端零依赖。
import React from 'react';
import { View } from 'react-native-flux-desktop';
import { TimeConverter } from 'react-native-flux-desktop-dev';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

/** 包一层保证 demo 宽度铺满 */
function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%', maxWidth: 560 }}>{props.node}</View>;
}

const DEMOS: DemoItem[] = [
  {
    name: '秒级时间戳',
    desc: '输入 1700000000 → 自动识别为秒，展开秒/毫秒/UTC/上海(+08:00)/ISO/相对时间；顶部实时「此刻」时钟每秒跳动，时区芯片可切换',
    node: <Block node={<TimeConverter defaultStamp="1700000000" />} />,
    code: [
      'import { TimeConverter } from "react-native-flux-desktop";',
      '',
      '// Unix 时间戳 ↔ 日历时间双向转换；秒/毫秒自动识别',
      '<TimeConverter defaultStamp="1700000000" />',
    ].join('\n'),
  },
  {
    name: '毫秒级时间戳',
    desc: '13 位数字自动识别为毫秒（≥1e11 判毫秒），单位行高亮标注；日期→时间戳区可用「YYYY-MM-DD HH:mm:ss」反查秒/毫秒/ISO',
    node: <Block node={<TimeConverter defaultStamp="1700000000123" defaultDate="2026-01-01 08:00:00" />} />,
    code: [
      'import { TimeConverter } from "react-native-flux-desktop";',
      '',
      '// 13 位自动识别为毫秒；defaultDate 支持反查时间戳',
      '<TimeConverter defaultStamp="1700000000123" defaultDate="2026-01-01 08:00:00" />',
    ].join('\n'),
  },
  {
    name: '无效输入护栏',
    desc: '时间戳非数字 / 日期格式错误 → 红字提示不崩溃；改正即时恢复',
    node: <Block node={<TimeConverter defaultStamp="abc" defaultDate="2026-13-40" liveClock={false} />} />,
    code: [
      'import { TimeConverter } from "react-native-flux-desktop";',
      '',
      '// 非法输入只红字提示不崩溃；liveClock=false 关掉实时钟',
      '<TimeConverter defaultStamp="abc" defaultDate="2026-13-40" liveClock={false} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'defaultStamp', desc: '初始时间戳（秒/毫秒自动识别）', type: 'string', default: '当前秒级' },
  { name: 'defaultDate', desc: '初始日期串（日期→时间戳）', type: 'string', default: '当前本地时间' },
  { name: 'liveClock', desc: '是否显示每秒跳动的实时时钟', type: 'boolean', default: 'true' },
];

export function TimeConverterDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} />;
}
