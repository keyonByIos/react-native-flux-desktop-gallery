// STAT-CARD：指标卡 / 指标卡组。DemoPage 多段式：单卡 / 一排卡组（趋势+迷你柱条）/ 可点卡。
import React from 'react';
import { Text, View, useToken, type StatCardProps } from 'react-native-flux-desktop';
import { StatCard, StatisticGroup } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 首次挂载 count-up 演示：延迟把值从 0 换成目标（animation 对 number 生效） */
function CountUpCard(): React.ReactElement {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setV(128456), 350);
    return () => clearTimeout(t);
  }, []);
  return <StatCard title="累计成交（count-up）" value={v} precision={0} trend={{ direction: 'up', value: '8.3%' }} style={{ maxWidth: 320 }} />;
}

const GROUP: StatCardProps[] = [
  { title: '日活 DAU', value: 48219, trend: { direction: 'up', value: '12.4%' }, spark: [22, 30, 26, 41, 38, 47, 52] },
  { title: '转化率', value: 3.42, precision: 2, suffix: '%', trend: { direction: 'down', value: '0.6%' }, spark: [5.1, 4.8, 4.6, 4.2, 3.9, 3.7, 3.4] },
  { title: '客单价', value: 268, prefix: '¥ ', trend: { direction: 'up', value: '4.1%' }, spark: [210, 224, 218, 236, 245, 251, 268] },
  { title: '退款率', value: 0.87, precision: 2, suffix: '%', trend: { direction: 'up', value: '0.2%', invert: true }, spark: [0.5, 0.55, 0.6, 0.62, 0.7, 0.8, 0.87] },
];

/** 6 卡分行：每行最多 4 张，末行 2 张 + 补空位保持卡宽一致 */
const GROUP6: StatCardProps[] = [
  ...GROUP,
  { title: '新增用户', value: 1204, trend: { direction: 'up', value: '6.8%' }, spark: [8, 9, 11, 10, 12, 13, 15] },
  { title: '在线时长', value: 26.4, precision: 1, suffix: ' 分钟', trend: { direction: 'up', value: '1.2%' }, spark: [22, 23, 24, 25, 24, 26, 26.4] },
];

const DEMOS: DemoItem[] = [
  {
    name: '单卡',
    desc: '标题 + count-up 大数值 + 趋势角标；数值延迟到达时从 0 补间上来',
    node: <CountUpCard />,
    code: [
      'import { StatCard } from "react-native-flux-desktop";',
      '',
      '// 标题 + count-up 大数值 + 趋势角标',
      '<StatCard',
      '  title="累计成交"',
      '  value={128456}',
      '  precision={0}',
      '  trend={{ direction: \'up\', value: \'8.3%\' }}',
      '  style={{ maxWidth: 320 }}',
      '/>',
    ].join('\n'),
  },
  {
    name: '指标卡组 StatisticGroup',
    desc: '一排等分：涨/跌语义配色 + 迷你柱条看近 7 日走势；invert 让「涨=坏事」类指标（退款率）反转配色',
    node: <StatisticGroup items={GROUP} />,
    code: [
      'import { StatisticGroup } from "react-native-flux-desktop";',
      '',
      '// 一排等分；trend 涨/跌语义色；spark 迷你柱条；invert 反转配色',
      'const items = [',
      '  { title: \'日活 DAU\', value: 48219, trend: { direction: \'up\', value: \'12.4%\' }, spark: [22, 30, 26, 41] },',
      '  { title: \'退款率\', value: 0.87, precision: 2, suffix: \'%\', trend: { direction: \'up\', value: \'0.2%\', invert: true } },',
      '];',
      '<StatisticGroup items={items} />',
    ].join('\n'),
  },
  {
    name: '多行分行 perRow',
    desc: '6 卡每行 4 张自动分组，末行补空位保持卡宽与上行对齐（本 Yoga 下 wrap 会丢画，故用按行分组替代）',
    node: <StatisticGroup items={GROUP6} />,
    code: [
      'import { StatisticGroup } from "react-native-flux-desktop";',
      '',
      '// perRow 控制每行最多卡数，超量自动分行；末行补空位对齐',
      '<StatisticGroup items={SIX_CARDS} perRow={4} />',
    ].join('\n'),
  },
  {
    name: '可点卡片',
    desc: 'onPress 整卡可点（按压微暗 + pointer 光标），常用于点卡跳转下钻',
    node: (
      <ClickCard />
    ),
    code: [
      'import { StatCard } from "react-native-flux-desktop";',
      '',
      '// onPress 整卡可点（按压微暗 + pointer）',
      '<StatCard title="待办事项" value={12} tag="今日" onPress={() => drillDown()} />',
    ].join('\n'),
  },
];

function ClickCard(): React.ReactElement {
  const { token } = useToken();
  const [count, setCount] = React.useState(0);
  return (
    <View style={{ gap: token.marginXS, maxWidth: 320 }}>
      <StatCard title="待办事项" value={12} tag="今日" onPress={() => setCount((c) => c + 1)} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>点一下卡片：onPress 已触发 {count} 次</Text>
    </View>
  );
}

const API: ApiRow[] = [
  { name: 'title / value', desc: '卡片标题与数值（number 自动千分位）', type: 'ReactNode', default: '–' },
  { name: 'prefix / suffix / precision', desc: '前后缀与小数位（透传 Statistic）', type: 'ReactNode / number', default: '–' },
  { name: 'animation', desc: '数值 count-up（仅 number；值变化即从当前补间）', type: 'boolean', default: 'true' },
  { name: 'trend', desc: '{direction: up|down, value, invert}：invert 反转涨跌语义配色', type: 'StatCardTrend', default: '–' },
  { name: 'spark', desc: '迷你柱条数据，末条主色高亮', type: 'number[]', default: '–' },
  { name: 'tag / loading / onPress', desc: '角标 / 骨架态 / 整卡可点', type: 'ReactNode / boolean / ()=>void', default: '–' },
  { name: 'StatisticGroup.items', desc: '一排多卡等分；子项即 StatCardProps（本 Yoga 下 wrap+flex:1 会丢画，已收敛为单行）', type: 'StatCardProps[]', default: '–' },
  { name: 'StatisticGroup.perRow', desc: '每行最多卡数，超量自动分行；末行补空位对齐卡宽', type: 'number', default: '4' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSuccess / colorError', desc: '趋势涨跌语义色（invert 反转）' },
  { name: 'colorBorderSecondary', desc: '卡片描边' },
  { name: 'paddingLG / marginSM', desc: '卡内边距 / 卡组间隙' },
  { name: 'colorFillSecondary', desc: '柱条底色与角标底' },
];

export function StatCardDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default StatCardDemo;
