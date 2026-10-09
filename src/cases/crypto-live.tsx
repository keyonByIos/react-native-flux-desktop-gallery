// 案例 / 区块链币价实时看板：Binance 官方公共 API 直连（无代理），展示 web3 + 金融图表 + ProTable 组合。
// 数据管线参照 binance-ws.ts / binance-client.ts：REST 24hr 快照 + miniTicker/kline/depth20/aggTrade 公共流；
// 端点用官方公共行情镜像域（api.binance.com 本机不可达）；网络不可达自动降级本地随机游走模拟（页面常活）。
import React from 'react';
import { View, Text, Card, Tag, Segmented, Button, Pressable, CandlestickChart, IndicatorChart, DepthChart, movingAverage, type ProColumn, type CandleOverlay, type DepthLevel, type StatCardProps } from 'react-native-flux-desktop';
import { ProTable, StatisticGroup } from 'react-native-flux-desktop-pro';
import { TokenPrice, CoinIcon } from 'react-native-flux-desktop-web3';
import { useToken } from 'react-native-flux-desktop';
import { fade } from 'react-native-flux-desktop';

/** Node24 全局 fetch/WebSocket（@types/node@20 无 WebSocket 类型，统一走 any 垫片） */
const G = globalThis as any;

const REST = 'https://data-api.binance.vision'; // 币安官方公共行情 REST（无需 Key，与 api.binance.com 同源数据）
const WS_BASE = 'wss://data-stream.binance.vision/stream?streams='; // 官方公共行情 WS 镜像

interface CoinDef { symbol: string; name: string; base: number }
const COINS: CoinDef[] = [
  { symbol: 'BTC', name: 'Bitcoin', base: 68000 },
  { symbol: 'ETH', name: 'Ethereum', base: 3300 },
  { symbol: 'SOL', name: 'Solana', base: 145 },
  { symbol: 'BNB', name: 'BNB', base: 540 },
  { symbol: 'XRP', name: 'XRP', base: 0.52 },
];
const pairOf = (s: string): string => `${s}USDT`;
type Iv = '1s' | '1m' | '5m' | '15m';
const IV_MS: Record<Iv, number> = { '1s': 1000, '1m': 60_000, '5m': 300_000, '15m': 900_000 };

interface Quote { price: number; pct: number; high: number; low: number; vol: number }
interface Candle { date: string; open: number; high: number; low: number; close: number; volume: number; t: number }
interface Trade { time: string; price: number; qty: number; buy: boolean }

const fmtPrice = (v: number): string =>
  v >= 1000 ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : v >= 1 ? v.toFixed(2) : v.toFixed(4);
const fmtVol = (v: number): string => (v >= 1e8 ? `${(v / 1e8).toFixed(2)} 亿` : v >= 1e4 ? `${(v / 1e4).toFixed(1)} 万` : v.toFixed(0));
const hhmmss = (ms: number): string => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};
/** K 线时间标签（参照 binance-client.ts formatKlineDate：1s 到秒、分钟级到时分） */
const klineLabel = (openTime: number, iv: Iv): string => (iv === '1s' ? hhmmss(openTime) : hhmmss(openTime).slice(0, 5));
/** REST kline 数组 → Candle[]（参照 mapKlineCandles） */
const mapKlines = (raw: any[][], iv: Iv): Candle[] =>
  raw.map((it) => ({
    date: klineLabel(Number(it[0]), iv), open: +it[1], high: +it[2], low: +it[3], close: +it[4],
    volume: +it[5], t: Number(it[0]),
  }));

const seedQuotes = (): Record<string, Quote> => {
  const q: Record<string, Quote> = {};
  for (const c of COINS) {
    const p = c.base * (0.97 + Math.random() * 0.06);
    q[c.symbol] = { price: p, pct: (Math.random() - 0.45) * 6, high: p * 1.02, low: p * 0.98, vol: c.base * 1e6 };
  }
  return q;
};
const seedCandles = (base: number, iv: Iv): Candle[] => {
  const out: Candle[] = [];
  let close = base * (0.97 + Math.random() * 0.04);
  const now = Date.now() - 60 * IV_MS[iv];
  for (let i = 0; i < 60; i++) {
    const open = close;
    close = open * (1 + (Math.random() - 0.5) * 0.008);
    const high = Math.max(open, close) * (1 + Math.random() * 0.003);
    const low = Math.min(open, close) * (1 - Math.random() * 0.003);
    out.push({ date: klineLabel(now + i * IV_MS[iv], iv), open: +open.toFixed(4), high: +high.toFixed(4), low: +low.toFixed(4), close: +close.toFixed(4), volume: Math.round(50 + Math.random() * 300), t: now + i * IV_MS[iv] });
  }
  return out;
};

export function CryptoLiveDemo(): React.ReactElement {
  const { token } = useToken();
  const [mode, setMode] = React.useState<'boot' | 'live' | 'sim'>('boot');
  const [bootKey, setBootKey] = React.useState(0);
  const [sel, setSel] = React.useState('BTC');
  const [iv, setIv] = React.useState<Iv>('1s');
  const [quotes, setQuotes] = React.useState<Record<string, Quote>>({});
  const [candles, setCandles] = React.useState<Candle[]>([]);
  const [depth, setDepth] = React.useState<{ bids: DepthLevel[]; asks: DepthLevel[] }>({ bids: [], asks: [] });
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const [updatedAt, setUpdatedAt] = React.useState('');
  const depthRef = React.useRef(depth);
  const tradesRef = React.useRef<Trade[]>([]);

  // ---- 启动：REST 24hr 快照 + 热门榜 → live；失败 → sim ----
  React.useEffect(() => {
    let dead = false;
    let ws: any = null;
    setMode('boot');
    (async (): Promise<void> => {
      try {
        const url = `${REST}/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(COINS.map((c) => pairOf(c.symbol))))}`;
        const r: any = await Promise.race([G.fetch(url), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))]);
        const arr: any[] = await r.json();
        if (dead) return;
        const q: Record<string, Quote> = {};
        for (const it of arr) {
          const sym = String(it.symbol).replace(/USDT$/, '');
          q[sym] = { price: +it.lastPrice, pct: +it.priceChangePercent, high: +it.highPrice, low: +it.lowPrice, vol: +it.quoteVolume };
        }
        setQuotes(q);
        setMode('live');
        // 全币 miniTicker 合并流（1s/币）
        const streams = COINS.map((c) => `${c.symbol.toLowerCase()}usdt@miniTicker`).join('/');
        ws = new G.WebSocket(`${WS_BASE}${streams}`);
        ws.onmessage = (ev: any): void => {
          try {
            const d = JSON.parse(ev.data).data;
            const sym = String(d.s).replace(/USDT$/, '');
            const price = +d.c; const open = +d.o;
            setQuotes((prev) => ({
              ...prev,
              [sym]: { price, pct: open > 0 ? ((price - open) / open) * 100 : 0, high: +d.h, low: +d.l, vol: +d.q },
            }));
            setUpdatedAt(hhmmss(Date.now()));
          } catch { /* ignore */ }
        };
        ws.onerror = (): void => { if (!dead && ws?.readyState !== 1) { setQuotes(seedQuotes()); setMode('sim'); } };
      } catch {
        if (!dead) { setQuotes(seedQuotes()); setMode('sim'); }
      }
    })();
    return (): void => { dead = true; try { ws?.close(); } catch { /* ignore */ } };
  }, [bootKey]);

  // ---- 选中币/周期：REST K 线打底 + 行情合并流（kline/depth/aggTrade） ----
  React.useEffect(() => {
    let dead = false;
    let ws: any = null;
    const lower = sel.toLowerCase();
    const base = COINS.find((c) => c.symbol === sel)!.base;
    if (mode === 'live') {
      (async (): Promise<void> => {
        try {
          const r: any = await Promise.race([
            G.fetch(`${REST}/api/v3/klines?symbol=${pairOf(sel)}&interval=${iv}&limit=60`),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000)),
          ]);
          if (!dead) setCandles(mapKlines(await r.json(), iv));
        } catch { if (!dead) setCandles(seedCandles(base, iv)); }
      })();
      const streams = [`${lower}usdt@kline_${iv}`, `${lower}usdt@depth20@100ms`, `${lower}usdt@aggTrade`].join('/');
      ws = new G.WebSocket(`${WS_BASE}${streams}`);
      ws.onmessage = (ev: any): void => {
        try {
          const msg = JSON.parse(ev.data);
          const stream: string = msg.stream ?? '';
          const d = msg.data;
          if (stream.includes('@kline_')) {
            const k = d.k;
            setCandles((prev) => {
              const candle: Candle = { date: klineLabel(k.t, iv), open: +k.o, high: +k.h, low: +k.l, close: +k.c, volume: +k.v, t: k.t };
              const last = prev[prev.length - 1];
              const next = last && last.t === k.t ? [...prev.slice(0, -1), candle] : [...prev, candle];
              return next.slice(-60);
            });
          } else if (stream.includes('@depth')) {
            depthRef.current = {
              bids: (d.bids ?? []).slice(0, 12).map((p: string[]) => ({ price: +p[0], size: +p[1] })),
              asks: (d.asks ?? []).slice(0, 12).map((p: string[]) => ({ price: +p[0], size: +p[1] })),
            };
          } else if (stream.includes('@aggTrade')) {
            tradesRef.current = [{ time: hhmmss(d.T), price: +d.p, qty: +d.q, buy: !d.m }, ...tradesRef.current].slice(0, 8);
          }
        } catch { /* ignore */ }
      };
    } else if (mode === 'sim') {
      setCandles(seedCandles(base, iv));
    }
    return (): void => { dead = true; try { ws?.close(); } catch { /* ignore */ } };
  }, [mode, sel, iv, bootKey]);

  // ---- sim 心跳：每秒随机游走（价格/K线/深度/成交全链路常活） ----
  React.useEffect(() => {
    if (mode !== 'sim') return undefined;
    const id = setInterval(() => {
      setQuotes((prev) => {
        const next: Record<string, Quote> = { ...prev };
        for (const c of COINS) {
          const q = prev[c.symbol]; if (!q) continue;
          const p = Math.max(c.base * 0.5, q.price * (1 + (Math.random() - 0.5) * 0.004));
          next[c.symbol] = { price: p, pct: q.pct + (Math.random() - 0.5) * 0.2, high: Math.max(q.high, p), low: Math.min(q.low, p), vol: q.vol + c.base * (200 + Math.random() * 800) };
        }
        return next;
      });
      setCandles((prev) => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        const drift = last.close * (Math.random() - 0.5) * 0.004;
        const close = last.close + drift;
        const now = Date.now();
        const roll = now - last.t >= IV_MS[iv];
        const next = roll
          ? [...prev, { date: klineLabel(now, iv), open: last.close, high: Math.max(last.close, close), low: Math.min(last.close, close), close: +close.toFixed(4), volume: Math.round(50 + Math.random() * 300), t: now }]
          : [...prev.slice(0, -1), { ...last, close: +close.toFixed(4), high: +Math.max(last.high, close).toFixed(4), low: +Math.min(last.low, close).toFixed(4), volume: last.volume + Math.round(Math.random() * 20) }];
        return next.slice(-60);
      });
      const p = quotes[sel]?.price ?? COINS[0].base;
      if (p > 0) {
        depthRef.current = {
          bids: Array.from({ length: 12 }, (_, i) => ({ price: +(p * (1 - 0.0002 * (i + 1))).toFixed(2), size: +(Math.random() * 4 + 0.2).toFixed(3) })),
          asks: Array.from({ length: 12 }, (_, i) => ({ price: +(p * (1 + 0.0002 * (i + 1))).toFixed(2), size: +(Math.random() * 4 + 0.2).toFixed(3) })),
        };
        tradesRef.current = [
          ...Array.from({ length: 1 + Math.floor(Math.random() * 2) }, (): Trade => ({
            time: hhmmss(Date.now()), price: +(p * (1 + (Math.random() - 0.5) * 0.0006)).toFixed(4), qty: +(Math.random() * 2).toFixed(3), buy: Math.random() > 0.5,
          })),
          ...tradesRef.current,
        ].slice(0, 8);
      }
      setUpdatedAt(hhmmss(Date.now()));
    }, 1000);
    return (): void => clearInterval(id);
    // quotes 仅作 sim 深度/成交价的锚，不入依赖（避免每秒重建定时器）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, sel, iv]);

  // ---- 节流刷帧：depth/逐笔 ref → state（每秒一次，避免 100ms 推流打爆渲染） ----
  React.useEffect(() => {
    const id = setInterval(() => {
      if (depthRef.current.bids.length) setDepth(depthRef.current);
      if (tradesRef.current.length) setTrades([...tradesRef.current]);
    }, 1000);
    return (): void => clearInterval(id);
  }, []);

  // ---- 渲染派生 ----
  const selQuote = quotes[sel];
  const prec = (v: number): number => (v >= 1000 ? 2 : v >= 1 ? 2 : 4);
  const closes = candles.map((c) => c.close);
  const overlays: CandleOverlay[] = candles.length >= 20 ? [
    { name: 'MA5', color: token.colorPrimary, width: 1.5, values: movingAverage(closes, 5) },
    { name: 'MA20', color: '#F6BD16', width: 1.5, values: movingAverage(closes, 20) },
  ] : [];
  const rows = COINS.map((c) => ({ symbol: c.symbol, name: c.name, ...quotes[c.symbol] })).filter((r) => r.price != null);

  // KPI 行（选中币）：不做 loading 翻转（Statistic loading↔真值行高不重排坑）
  const kpis: StatCardProps[] = selQuote ? [
    { title: `${sel} 最新价 (USDT)`, value: selQuote.price, precision: prec(selQuote.price), spark: closes.slice(-14) },
    { title: '24h 涨跌', value: Math.abs(selQuote.pct), precision: 2, suffix: '%', trend: { direction: selQuote.pct >= 0 ? 'up' : 'down', value: `${selQuote.pct.toFixed(2)}%` } },
    { title: '24h 高', value: selQuote.high, precision: prec(selQuote.high) },
    { title: '24h 低', value: selQuote.low, precision: prec(selQuote.low) },
    { title: '24h 成交额', value: selQuote.vol / 1e8, precision: 2, suffix: ' 亿', tag: mode === 'live' ? '实时' : '模拟' },
  ] : [];

  // 盘口梯：卖 4 档（降序到最优）+ 买 4 档，累计条按总量缩放
  const ladderRows: Array<{ lv: DepthLevel; cum: number; buy: boolean }> = [];
  {
    let cum = 0;
    const asks = depth.asks.slice(0, 4).reverse(); // 最差→最优（最优贴中间）
    for (const lv of asks) { cum += lv.size; ladderRows.push({ lv, cum, buy: false }); }
    cum = 0;
    for (const lv of depth.bids.slice(0, 4)) { cum += lv.size; ladderRows.push({ lv, cum, buy: true }); }
  }
  const ladderMax = Math.max(1e-9, ...ladderRows.map((r) => r.cum));

  const cellText = { fontSize: token.fontSizeSM, color: token.colorText };
  const cellSub = { fontSize: token.fontSizeSM, color: token.colorTextSecondary };
  const cols: ProColumn<Record<string, any>>[] = [
    { title: '币种', dataIndex: 'symbol', key: 'symbol', width: 88, render: (v: string) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <CoinIcon symbol={v} size={18} />
        <Text style={cellText}>{v}</Text>
      </View>
    ) },
    { title: '最新价', dataIndex: 'price', key: 'price', width: 100, sorter: (a, b) => a.price - b.price, render: (v: number) => <Text style={cellText}>{fmtPrice(v)}</Text> },
    { title: '24h 涨跌', dataIndex: 'pct', key: 'pct', width: 88, sorter: (a, b) => a.pct - b.pct, render: (v: number) => (
      <Text style={{ ...cellText, color: v >= 0 ? token.colorSuccess : token.colorError, fontWeight: '600' }}>{`${v >= 0 ? '+' : ''}${v.toFixed(2)}%`}</Text>
    ) },
    { title: '24h 高', dataIndex: 'high', key: 'high', width: 92, render: (v: number) => <Text style={cellSub}>{fmtPrice(v)}</Text> },
    { title: '24h 低', dataIndex: 'low', key: 'low', width: 92, render: (v: number) => <Text style={cellSub}>{fmtPrice(v)}</Text> },
    { title: '成交额', dataIndex: 'vol', key: 'vol', render: (v: number) => <Text style={cellSub}>{fmtVol(v)}</Text> },
  ];

  return (
    <View style={{ gap: token.marginLG }}>
      {/* 状态条 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, flexShrink: 0, backgroundColor: mode === 'live' ? token.colorSuccess : mode === 'sim' ? token.colorWarning : token.colorTextQuaternary }} />
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText, flexShrink: 0 }}>区块链币价实时看板</Text>
        <Tag color={mode === 'live' ? 'success' : mode === 'sim' ? 'warning' : 'default'}>
          {mode === 'live' ? '币安官方 API · WS 实时' : mode === 'sim' ? '离线演示 · 本地模拟' : '连接中…'}
        </Tag>
        <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          data-api / data-stream.binance.vision 官方公共行情（无需 Key）；离线自动降级模拟
        </Text>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, flexShrink: 0 }}>{updatedAt ? `更新 ${updatedAt}` : '等待推送…'}</Text>
        <View style={{ flexShrink: 0 }}><Button size="small" onPress={(): void => setBootKey((k) => k + 1)}>重连</Button></View>
      </View>

      {/* 币价卡行（TokenPrice + CoinIcon，点卡选币） */}
      <View style={{ flexDirection: 'row', gap: token.marginSM }}>
        {COINS.map((c) => {
          const q = quotes[c.symbol];
          return (
            <Pressable key={c.symbol} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onPress={(): void => setSel(c.symbol)}>
              <Card size="small" style={sel === c.symbol ? { borderWidth: 1, borderColor: token.colorPrimary } : undefined}>
                {q ? (
                  <TokenPrice token={{ symbol: c.symbol, icon: <CoinIcon symbol={c.symbol} size={26} /> }} amount={1} fiatPrice={q.price} change={q.pct} precision={c.base >= 1000 ? 0 : c.base >= 1 ? 2 : 4} size="small" />
                ) : (
                  <Text style={{ color: token.colorTextQuaternary }}>{c.symbol}</Text>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* KPI 行：选中币 24h 概览 */}
      {kpis.length ? <StatisticGroup items={kpis} perRow={5} /> : null}

      {/* K 线三面板 + 深度/盘口梯 */}
      <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
        <Card
          title={`${sel}/USDT · ${iv} K线（实时滚动）`}
          size="small"
          style={{ flex: 3 }}
          extra={
            <Segmented
              size="small"
              value={iv}
              onChange={(v): void => setIv(v as Iv)}
              options={[{ label: '1s', value: '1s' }, { label: '1m', value: '1m' }, { label: '5m', value: '5m' }, { label: '15m', value: '15m' }]}
            />
          }
        >
          <View style={{ gap: 4, overflow: 'hidden', cacheAsBitmap: true }}>
            <CandlestickChart data={candles} overlays={overlays} showXAxis={false} showVolume={false} animation={false} height={200} upColor={token.colorSuccess} downColor={token.colorError} />
            <IndicatorChart data={candles} type="MACD" label="MACD(12,26,9)" showXAxis={false} height={96} animation={false} upColor={token.colorSuccess} downColor={token.colorError} />
            <IndicatorChart data={candles} type="VOL" label="成交量" showXAxis height={96} animation={false} upColor={token.colorSuccess} downColor={token.colorError} />
          </View>
        </Card>
        <View style={{ flex: 2, gap: token.margin }}>
          <Card title="订单簿深度" size="small" extra={selQuote ? <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{fmtPrice(selQuote.price)}</Text> : undefined}>
            <View style={{ overflow: 'hidden', cacheAsBitmap: true }}>
              <DepthChart bids={depth.bids} asks={depth.asks} height={200} animation={false} sizeFormatter={fmtVol} />
            </View>
          </Card>
          <Card title="盘口梯" size="small">
            <View style={{ gap: 2 }}>
              {ladderRows.map((r, i) => (
                <View key={i} style={{ height: 20, justifyContent: 'center' }}>
                  <View style={{ position: 'absolute', right: 0, top: 2, bottom: 2, width: `${(r.cum / ladderMax) * 100}%`, backgroundColor: fade(r.buy ? token.colorSuccess : token.colorError, 0.18), borderRadius: 2 }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: token.paddingXXS }}>
                    <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: r.buy ? token.colorSuccess : token.colorError }}>{fmtPrice(r.lv.price)}</Text>
                    <Text style={{ width: 64, fontSize: token.fontSizeSM, color: token.colorTextSecondary, textAlign: 'right' }}>{r.lv.size.toFixed(r.lv.size >= 100 ? 0 : 3)}</Text>
                    <Text style={{ width: 70, fontSize: token.fontSizeSM, color: token.colorTextTertiary, textAlign: 'right' }}>{r.cum >= 1000 ? fmtVol(r.cum) : r.cum.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </View>

      {/* 24h 行情榜 + 最新成交 */}
      <View style={{ flexDirection: 'row', gap: token.margin, alignItems: 'flex-start' }}>
        <Card title="24h 行情榜" size="small" style={{ flex: 3 }}>
          <ProTable<Record<string, any>> columns={cols} dataSource={rows} rowKey={(r): string => String(r.symbol)} pageSize={5} size="small" striped />
        </Card>
        <Card title={`${sel}/USDT 最新成交`} size="small" style={{ flex: 2 }}>
          <View style={{ gap: token.marginXXS }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: token.paddingXXS }}>
              <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>时间</Text>
              <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>价格</Text>
              <Text style={{ width: 70, fontSize: token.fontSizeSM, color: token.colorTextTertiary, textAlign: 'right' }}>数量</Text>
            </View>
            {trades.length === 0 ? (
              <Text style={{ color: token.colorTextQuaternary, paddingVertical: token.paddingSM }}>等待成交流…</Text>
            ) : (
              trades.map((t, i) => (
                <View key={`${t.time}-${i}`} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: token.paddingXXS, paddingVertical: 2 }}>
                  <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{t.time}</Text>
                  <Text style={{ flex: 1, fontSize: token.fontSizeSM, color: t.buy ? token.colorSuccess : token.colorError }}>{fmtPrice(t.price)}</Text>
                  <Text style={{ width: 70, fontSize: token.fontSizeSM, color: token.colorTextSecondary, textAlign: 'right' }}>{t.qty.toFixed(3)}</Text>
                </View>
              ))
            )}
          </View>
        </Card>
      </View>
    </View>
  );
}

export default CryptoLiveDemo;
