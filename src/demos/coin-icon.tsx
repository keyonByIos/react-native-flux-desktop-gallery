// CoinIcon demo：区块链币种图标演示（三段式 demo → API）。图形取自 @ant-design/web3 icons 内置集。
// 首个 demo 用 InfiniteScroll + Grid(Row/Col) 无限滚动渲染全部币种。
import React from 'react';
import { View, Text, useToken, Row, Col, InfiniteScroll } from 'react-native-flux-desktop';
import { CoinIcon, COIN_IDS } from 'react-native-flux-desktop-web3';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

/** 图标 + 下方小标签（symbol），用于成排展示。 */
function CoinChip(props: { symbol: string; size?: number; shape?: 'plain' | 'circle' | 'square'; bg?: string }): React.ReactElement {
  const { token } = useToken();
  const { symbol, size = 32, shape = 'plain', bg } = props;
  return (
    <View style={{ alignItems: 'center', width: size + 16, marginVertical: 6 }}>
      <CoinIcon symbol={symbol} size={size} shape={shape} bg={bg} />
      <View style={{ height: 4 }} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{symbol}</Text>
    </View>
  );
}

function Wall(props: { symbols: string[]; size?: number; shape?: 'plain' | 'circle' | 'square' }): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {props.symbols.map((s) => (
        <CoinChip key={s} symbol={s} size={props.size} shape={props.shape} />
      ))}
    </View>
  );
}

/** 全量币种墙：InfiniteScroll（固定高内滚）+ Grid 多列，触底逐页加载直到全部渲染。 */
function CoinGridInfinite(): React.ReactElement {
  const { token } = useToken();
  const total = COIN_IDS.length;
  const PAGE = 80; // 每页个数
  const COLUMNS = 8; // 网格列数（Col span = 24 / COLUMNS）
  const [count, setCount] = React.useState(PAGE);
  const [loading, setLoading] = React.useState(false);
  const hasMore = count < total;
  const loadMore = React.useCallback((): void => {
    if (loading || count >= total) return;
    setLoading(true);
    // 数据在本地，模拟一次异步翻页的短暂 loading
    setTimeout(() => {
      setCount((c) => Math.min(c + PAGE, total));
      setLoading(false);
    }, 260);
  }, [loading, count, total]);
  const shown = COIN_IDS.slice(0, count);
  // Col 用 flexGrow 均分单行，不会自动换行→手动按列数切行，逐行一个 Row（末行补空 Col 保持列宽一致）
  const rows: string[][] = [];
  for (let i = 0; i < shown.length; i += COLUMNS) rows.push(shown.slice(i, i + COLUMNS));
  return (
    <View
      style={{
        height: 520,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadius,
        padding: token.paddingSM,
      }}
    >
      <InfiniteScroll
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        noMoreText={`— 已加载全部 ${total} 个币种 —`}
      >
        <View style={{ gap: token.marginXS }}>
          {rows.map((row, ri) => (
            <Row key={ri} gutter={[token.marginXS, 0]}>
              {Array.from({ length: COLUMNS }).map((_, ci) => {
                const s = row[ci];
                return (
                  <Col key={ci} span={24 / COLUMNS} style={{ alignItems: 'center' }}>
                    {s ? <CoinChip symbol={s} /> : <View style={{ height: 1 }} />}
                  </Col>
                );
              })}
            </Row>
          ))}
        </View>
      </InfiniteScroll>
    </View>
  );
}

export function CoinIconDemo(): React.ReactElement {
  const { token } = useToken();
  const total = COIN_IDS.length;
  const demos: DemoItem[] = [
    {
      name: `内置币种（共 ${total} 个 · 无限滚动全量）`,
      desc: 'InfiniteScroll 触底逐页加载 + Grid 多列铺排，滚动即可渲染全部币种；完整清单见 COIN_IDS',
      node: <CoinGridInfinite />,
      code: [
        'import { CoinIcon, COIN_IDS, InfiniteScroll, Row, Col } from "react-native-flux-desktop";',
        '',
        '// COIN_IDS 为全部内置币种名；触底逐页 slice 渲染',
        '<InfiniteScroll hasMore={count < total} loading={loading} onLoadMore={loadMore}>',
        '  {rows.map((row, ri) => (',
        '    <Row key={ri} gutter={[8, 0]}>',
        '      {row.map((s) => <Col key={s} span={3}><CoinIcon symbol={s} /></Col>)}',
        '    </Row>',
        '  ))}',
        '</InfiniteScroll>',
      ].join('\n'),
    },
    {
      name: 'ticker 别名',
      desc: '用常见 ticker 传入（BTC/ETH/SOL/DOGE/TRX/DOT…），大小写不敏感、含全称↔简称桥接',
      node: <Wall symbols={['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'LINK', 'TON', 'MATIC', 'TRX', 'LTC', 'UNI', 'ATOM']} />,
      code: [
        'import { CoinIcon } from "react-native-flux-desktop";',
        '',
        '// ticker / 全称 / 大小写均可，内部三级匹配（基名→别名→宽松归一）',
        '<CoinIcon symbol="BTC" size={32} />',
        '<CoinIcon symbol="ethereum" size={32} />',
        '<CoinIcon symbol="solana" size={32} />',
      ].join('\n'),
    },
    {
      name: '尺寸梯度',
      desc: 'size 任意边长，矢量随尺寸无损缩放',
      node: (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {[16, 24, 32, 48, 64].map((s) => (
            <View key={s} style={{ marginRight: 14, alignItems: 'center' }}>
              <CoinIcon symbol="ETH" size={s} />
              <View style={{ height: 4 }} />
              <CoinIcon symbol="BTC" size={s} />
            </View>
          ))}
        </View>
      ),
      code: [
        '// size 任意边长（px），矢量无损缩放；默认 24',
        '<CoinIcon symbol="ETH" size={16} />',
        '<CoinIcon symbol="ETH" size={32} />',
        '<CoinIcon symbol="ETH" size={64} />',
      ].join('\n'),
    },
    {
      name: '圆形 / 方形底牌',
      desc: 'shape=circle / square 会加底牌并裁切；bg 自定义底色',
      node: (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: 18 }}>
            <CoinIcon symbol="BTC" size={44} shape="circle" bg="#f7931a22" />
          </View>
          <View style={{ marginRight: 18 }}>
            <CoinIcon symbol="ETH" size={44} shape="circle" bg={token.colorFillSecondary} />
          </View>
          <View style={{ marginRight: 18 }}>
            <CoinIcon symbol="SOL" size={44} shape="square" bg={token.colorFillSecondary} />
          </View>
          <CoinIcon symbol="USDT" size={44} shape="square" bg="#50af9522" />
        </View>
      ),
      code: [
        '// shape=circle / square 加底牌并裁切；bg 自定义底色（默认 colorBgContainer）',
        '<CoinIcon symbol="BTC" size={44} shape="circle" bg="#f7931a22" />',
        '<CoinIcon symbol="SOL" size={44} shape="square" bg="#50af9522" />',
      ].join('\n'),
    },
    {
      name: '未收录兜底',
      desc: `不在 ${total} 个内置之内的 symbol，用哈希派生的字母圆牌（确定性配色）`,
      node: <Wall symbols={['ZZZ', 'FOOBAR', 'XYZ', 'MYCOIN', 'ABC123', 'QQQ']} />,
      code: [
        '// 不在内置清单的 symbol → 哈希派生字母圆牌（同 symbol 配色确定）',
        '<CoinIcon symbol="ZZZ" size={32} />',
        '<CoinIcon symbol="MYCOIN" size={32} />',
      ].join('\n'),
    },
  ];
  const api: ApiRow[] = [
    { name: 'symbol', desc: '币种：ticker 或名称（大小写不敏感，含常见别名）', type: 'string' },
    { name: 'size', desc: '边长（px）', type: 'number', default: '24' },
    { name: 'shape', desc: "外形：plain 仅图形 / circle / square 加底牌并裁切", type: "'plain' | 'circle' | 'square'", default: "'plain'" },
    { name: 'bg', desc: 'circle / square 底牌背景色；默认 colorBgContainer', type: 'string' },
    { name: 'style', desc: '额外样式', type: 'ViewStyle' },
  ];
  return <DemoPage demos={demos} api={api} />;
}

export default CoinIconDemo;
