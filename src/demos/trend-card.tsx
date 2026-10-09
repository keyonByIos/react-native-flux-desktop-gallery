// 高阶 / 行情趋势卡：名称 + 大字现价（count-up）+ 涨跌额/幅染色 + 内嵌面积迷你走势。
// 面向金融/行情看板；涨红跌绿（可 upColor/downColor 覆盖为绿涨红跌）。
import React from 'react';
import { View } from 'react-native-flux-desktop';
import { TrendCard } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const UP_SERIES = [42, 44, 43, 46, 48, 47, 51, 53, 52, 56, 58, 61];
const DOWN_SERIES = [61, 60, 58, 59, 56, 54, 55, 52, 50, 51, 48, 46];
const FLAT_SERIES = [50, 51, 49, 50, 52, 50, 49, 51, 50, 50, 51, 50];

function Row(props: { children: React.ReactNode }): React.ReactElement {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' }}>{props.children}</View>;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础（涨 / 跌）',
    desc: '现价 count-up；涨跌由 price 与 prevClose 推，涨红跌绿整卡染色 + 走势线同色',
    node: (
      <Row>
        <TrendCard name="比特币" symbol="BTC" price={68420.5} prevClose={66980} prefix="$" series={UP_SERIES} style={{ width: 260 }} />
        <TrendCard name="以太坊" symbol="ETH" price={3210.8} prevClose={3355} prefix="$" series={DOWN_SERIES} style={{ width: 260 }} />
      </Row>
    ),
    code: [
      'import { TrendCard } from "react-native-flux-desktop";',
      '',
      '// 涨跌由 price − prevClose 推；涨红跌绿整卡染色',
      '<TrendCard name="比特币" symbol="BTC" price={68420.5} prevClose={66980} prefix="$" series={UP_SERIES} />',
    ].join('\n'),
  },
  {
    name: '显式涨跌 + 持平',
    desc: 'change / changePercent 直接给定；change=0 归涨色（↑ +0.00%）',
    node: (
      <Row>
        <TrendCard name="沪深300" symbol="000300" price={3842.6} change={58.2} changePercent={1.54} prefix="¥" series={UP_SERIES} style={{ width: 260 }} />
        <TrendCard name="恒生指数" symbol="HSI" price={17820} change={0} changePercent={0} series={FLAT_SERIES} style={{ width: 260 }} />
      </Row>
    ),
    code: [
      'import { TrendCard } from "react-native-flux-desktop";',
      '',
      '// change / changePercent 直接给定；change=0 归涨色',
      '<TrendCard name="沪深300" price={3842.6} change={58.2} changePercent={1.54} prefix="¥" series={UP_SERIES} />',
    ].join('\n'),
  },
  {
    name: '绿涨红跌（国际配色）',
    desc: 'upColor / downColor 覆盖为绿涨红跌',
    node: (
      <Row>
        <TrendCard name="AAPL" price={192.4} prevClose={189.1} prefix="$" upColor="#26A69A" downColor="#EF5350" series={UP_SERIES} style={{ width: 260 }} />
        <TrendCard name="TSLA" price={242.1} prevClose={251.7} prefix="$" upColor="#26A69A" downColor="#EF5350" series={DOWN_SERIES} style={{ width: 260 }} />
      </Row>
    ),
    code: [
      'import { TrendCard } from "react-native-flux-desktop";',
      '',
      '// upColor / downColor 覆盖为绿涨红跌',
      '<TrendCard',
      '  name="AAPL"',
      '  price={192.4}',
      '  prevClose={189.1}',
      '  upColor="#26A69A"',
      '  downColor="#EF5350"',
      '  series={UP_SERIES}',
      '/>',
    ].join('\n'),
  },
  {
    name: '可点击',
    desc: 'onClick 整卡可点，悬停主色描边、按下轻微压暗',
    node: (
      <Row>
        <TrendCard name="纳斯达克" symbol="IXIC" price={15320.6} prevClose={15180} prefix="$" series={UP_SERIES} onClick={() => {}} style={{ width: 260 }} />
      </Row>
    ),
    code: [
      'import { TrendCard } from "react-native-flux-desktop";',
      '',
      '// onClick 整卡可点（悬停主色描边、按下轻微压暗）',
      '<TrendCard name="纳斯达克" price={15320.6} prevClose={15180} prefix="$" onClick={() => openDetail()} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'price', desc: '现价（count-up 大字，随涨跌染色）', type: 'number', default: '–' },
  { name: 'change / changePercent', desc: '涨跌额 / 涨跌幅；缺省时由 price − prevClose 推', type: 'number', default: '推导' },
  { name: 'prevClose', desc: '昨收（推涨跌基线）', type: 'number', default: '–' },
  { name: 'series', desc: '迷你走势数值序列（>1 才画面积折线）', type: 'number[]', default: '–' },
  { name: 'prefix / precision', desc: '货币前缀 / 小数位', type: 'string / number', default: '– / 2' },
  { name: 'upColor / downColor', desc: '涨色 / 跌色', type: 'string', default: '红 / 绿' },
  { name: 'onClick', desc: '整卡可点（悬停描边高亮）', type: '() => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorError / colorSuccess', desc: '涨 / 跌默认色（A股红涨绿跌）', default: '–' },
  { name: 'colorBgContainer', desc: '卡片底色', default: '–' },
  { name: 'colorBorderSecondary', desc: '静置描边；hover 换 colorPrimary', default: '–' },
];

export function TrendCardDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
