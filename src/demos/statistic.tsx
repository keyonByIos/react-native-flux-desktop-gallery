// STATISTIC：统计数值。统一走 DemoPage 多段式，覆盖 基础 / 对齐 / 前后缀 / 千分位与小数 / 动画 / 颜色 / 加载 / 格式化。
import React from 'react';
import { Statistic, Button, Space } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 动画重播 */
function AnimationDemo(): React.ReactElement {
  const [seed, setSeed] = React.useState(0);
  return (
    <Space direction="vertical" size={12}>
      <Statistic key={`anim-${seed}`} title="累计访问" value={1234567} suffix="次" animation />
      <Button size="small" onPress={() => setSeed(seed + 1)}>
        重播动画
      </Button>
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '小标题 + 大号数值',
    node: <Statistic title="活跃用户（周）" value={112893} suffix="人" />,
    code: [
      'import { Statistic } from "react-native-flux-desktop";',
      '',
      '// 小标题 + 大号数值',
      '<Statistic title="活跃用户（周）" value={112893} suffix="人" />',
    ].join('\n'),
  },
  {
    name: '对齐',
    desc: '默认标题靠右 + 数值靠左；titleAlign / valueAlign 可改（需给宽度对齐才看得出来）',
    node: (
      <Space size="large" wrap>
        <Statistic title="默认（标题右、数值左）" value={112893} style={{ width: 220 }} />
        <Statistic title="标题左、数值右" value={112893} titleAlign="left" valueAlign="right" style={{ width: 220 }} />
        <Statistic title="均居中" value={112893} titleAlign="center" valueAlign="center" style={{ width: 220 }} />
      </Space>
    ),
    code: [
      'import { Statistic, Space } from "react-native-flux-desktop";',
      '',
      '// 默认：标题靠右 + 数值靠左；titleAlign / valueAlign 可覆盖',
      '<Space size="large" wrap>',
      '  <Statistic title="默认（标题右、数值左）" value={112893} style={{ width: 220 }} />',
      '  <Statistic title="标题左、数值右" value={112893} titleAlign="left" valueAlign="right" style={{ width: 220 }} />',
      '  <Statistic title="均居中" value={112893} titleAlign="center" valueAlign="center" style={{ width: 220 }} />',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '前后缀',
    desc: 'prefix / suffix 包裹单位或符号',
    node: (
      <Space size="large" wrap>
        <Statistic title="账户余额" prefix="¥" value={18932.44} />
        <Statistic title="剩余库存" value={268} suffix="件" />
      </Space>
    ),
    code: [
      'import { Statistic, Space } from "react-native-flux-desktop";',
      '',
      '// prefix / suffix 包裹单位或符号',
      '<Space size="large" wrap>',
      '  <Statistic title="账户余额" prefix="¥" value={18932.44} />',
      '  <Statistic title="剩余库存" value={268} suffix="件" />',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '千分位与小数',
    desc: 'groupSeparator 千分位；precision 固定小数位',
    node: (
      <Space size="large" wrap>
        <Statistic title="千分位" value={112893} />
        <Statistic title="无千分位" value={112893} groupSeparator={false} />
        <Statistic title="保留 2 位小数" value={1234.5} precision={2} />
      </Space>
    ),
    code: [
      'import { Statistic, Space } from "react-native-flux-desktop";',
      '',
      '// groupSeparator 千分位；precision 固定小数位',
      '<Space size="large" wrap>',
      '  <Statistic title="千分位" value={112893} />',
      '  <Statistic title="无千分位" value={112893} groupSeparator={false} />',
      '  <Statistic title="保留 2 位小数" value={1234.5} precision={2} />',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '动画',
    desc: 'animation 数值从 0 补间到目标（count-up）',
    node: <AnimationDemo />,
    code: [
      'import { Statistic } from "react-native-flux-desktop";',
      '',
      '// animation 数值从 0 补间到目标（count-up）',
      '<Statistic key={seed} title="累计访问" value={1234567} suffix="次" animation />',
    ].join('\n'),
  },
  {
    name: '自定义颜色',
    desc: 'valueStyle 覆盖数值样式',
    node: (
      <Space size="large" wrap>
        <Statistic title="增长率" value={9.34} precision={2} suffix="%" valueStyle={{ color: '#52c41a' }} />
        <Statistic title="流失率" value={1.28} precision={2} suffix="%" valueStyle={{ color: '#ff4d4f' }} />
      </Space>
    ),
    code: [
      'import { Statistic, Space } from "react-native-flux-desktop";',
      '',
      '// valueStyle 覆盖数值样式',
      '<Statistic title="增长率" value={9.34} precision={2} suffix="%" valueStyle={{ color: \'#52c41a\' }} />',
      '<Statistic title="流失率" value={1.28} precision={2} suffix="%" valueStyle={{ color: \'#ff4d4f\' }} />',
    ].join('\n'),
  },
  {
    name: '加载中',
    desc: 'loading 以占位块代替数值',
    node: (
      <Space size="large" wrap>
        <Statistic title="加载中数值" value={9999} loading />
        <Statistic title="已加载" value={9999} />
      </Space>
    ),
    code: [
      'import { Statistic, Space } from "react-native-flux-desktop";',
      '',
      '// loading 以占位块代替数值',
      '<Statistic title="加载中数值" value={9999} loading />',
      '<Statistic title="已加载" value={9999} />',
    ].join('\n'),
  },
  {
    name: '自定义格式化',
    desc: 'formatter 接管数值渲染（优先于内置）',
    node: <Statistic title="完成度" value={0.82} formatter={(v) => `${Math.round((v as number) * 100)} / 100`} />,
    code: [
      'import { Statistic } from "react-native-flux-desktop";',
      '',
      '// formatter 接管数值渲染（优先于内置）',
      '<Statistic',
      '  title="完成度"',
      '  value={0.82}',
      '  formatter={(v) => `${Math.round(v * 100)} / 100`}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title', desc: '标题', type: 'ReactNode', default: '–' },
  { name: 'value', desc: '数值', type: 'ReactNode', default: '–' },
  { name: 'prefix / suffix', desc: '前后缀', type: 'ReactNode', default: '–' },
  { name: 'precision', desc: '小数位数', type: 'number', default: '–' },
  { name: 'groupSeparator', desc: '千分位（false 关闭）', type: "string | false", default: "','" },
  { name: 'animation', desc: 'count-up 动画', type: 'boolean', default: 'false' },
  { name: 'loading', desc: '加载占位', type: 'boolean', default: 'false' },
  { name: 'formatter', desc: '自定义格式化', type: '(v) => ReactNode', default: '–' },
  { name: 'titleAlign', desc: '标题水平对齐', type: "'left' | 'center' | 'right'", default: "'right'" },
  { name: 'valueAlign', desc: '数值水平对齐', type: "'left' | 'center' | 'right'", default: "'left'" },
  { name: 'valueStyle', desc: '数值样式', type: 'TextStyle', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'titleFontSize', desc: '标题字号', default: 'Statistic token' },
  { name: 'contentFontSize', desc: '数值字号', default: 'Statistic token' },
  { name: 'colorTextTertiary', desc: '标题 / 后缀色', default: '三级文本' },
];

export function StatisticDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
