// 金融图表 demo：K线/蜡烛图（Candlestick）+ 分时图（TimeSharing）。统一 DemoPage 三段式 + 重播入场动画。
import React from 'react';
import { View, Button, Text, CandlestickChart, TimeSharingChart, IndicatorChart, DepthChart, movingAverage } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 重播容器：换 key 重挂载子图，触发一次入场动画。 */
function Replay(props: { children: (seed: number) => React.ReactElement }): React.ReactElement {
  const [seed, setSeed] = React.useState(0);
  return (
    <View style={{ gap: 10 }}>
      <View key={seed}>{props.children(seed)}</View>
      <Button size="small" style={{ alignSelf: 'flex-start' }} onClick={() => setSeed((s) => s + 1)}>
        重播入场动画
      </Button>
    </View>
  );
}

// 确定性伪随机（LCG），保证每次构建/抓帧数据一致。
function lcg(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return (): number => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---- K线 mock：30 根，随机游走 ----
const CANDLES: Record<string, any>[] = (() => {
  const rnd = lcg(20260927);
  const rows: Record<string, any>[] = [];
  let prev = 100;
  for (let i = 0; i < 30; i++) {
    const open = prev;
    const drift = (rnd() - 0.48) * 6;
    const close = Math.max(60, open + drift);
    const high = Math.max(open, close) + rnd() * 2.5;
    const low = Math.min(open, close) - rnd() * 2.5;
    const volume = Math.round(20000 + rnd() * 60000 + Math.abs(drift) * 8000);
    const d = new Date(2026, 7, 1 + i);
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    rows.push({ date: label, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume });
    prev = close;
  }
  return rows;
})();

// ---- 分时 mock：全天 242 分钟采样为 48 点，围绕昨收 100 波动 ----
const INTRADAY: Record<string, any>[] = (() => {
  const rnd = lcg(88);
  const rows: Record<string, any>[] = [];
  const prevClose = 100;
  let price = prevClose;
  let cum = 0;
  const total = 48;
  for (let i = 0; i < total; i++) {
    price += (rnd() - 0.5) * 0.9 + (i > total * 0.4 ? 0.05 : -0.02);
    cum += price;
    const avg = cum / (i + 1);
    const mins = 9 * 60 + 30 + Math.round((i / (total - 1)) * 240); // 09:30 起 4 小时
    const hh = String(Math.floor(mins / 60)).padStart(2, '0');
    const mm = String(mins % 60).padStart(2, '0');
    rows.push({ time: `${hh}:${mm}`, price: +price.toFixed(2), avg: +avg.toFixed(2) });
  }
  return rows;
})();

// 基于 CANDLES 收盘价算均线（MA），供「K 线 + 折线重叠」demo 使。
const CLOSES: number[] = CANDLES.map((r): number => Number(r.close));
const CANDLE_OVERLAYS = [
  { name: 'MA5', color: '#5B8FF9', values: movingAverage(CLOSES, 5) },
  { name: 'MA10', color: '#F6BD16', values: movingAverage(CLOSES, 10) },
  { name: 'MA20', color: '#945FB9', values: movingAverage(CLOSES, 20) },
];

// ---- 长序列 mock：80 根，供多面板行情（MACD 需 ≥ 34 根暖机）----
const CANDLES_LONG: Record<string, any>[] = (() => {
  const rnd = lcg(4321);
  const rows: Record<string, any>[] = [];
  let prev = 100;
  for (let i = 0; i < 80; i++) {
    const open = prev;
    const drift = (rnd() - 0.47) * 5;
    const close = Math.max(50, open + drift);
    const high = Math.max(open, close) + rnd() * 2;
    const low = Math.min(open, close) - rnd() * 2;
    const volume = Math.round(20000 + rnd() * 60000 + Math.abs(drift) * 8000);
    const d = new Date(2026, 3, 1 + i);
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    rows.push({ date: label, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume });
    prev = close;
  }
  return rows;
})();
const CLOSES_LONG: number[] = CANDLES_LONG.map((r): number => Number(r.close));
const LONG_OVERLAYS = [
  { name: 'MA5', color: '#5B8FF9', values: movingAverage(CLOSES_LONG, 5) },
  { name: 'MA20', color: '#945FB9', values: movingAverage(CLOSES_LONG, 20) },
];

// ---- 订单簿 mock：围绕中价 100，近中价挂单量大→远端递减，形成山形累计深度 ----
const { BIDS, ASKS } = ((): { BIDS: { price: number; size: number }[]; ASKS: { price: number; size: number }[] } => {
  const rnd = lcg(9);
  const mid = 100;
  const bids: { price: number; size: number }[] = [];
  const asks: { price: number; size: number }[] = [];
  for (let i = 1; i <= 24; i++) {
    const wgt = 1 - i / 30;
    bids.push({ price: +(mid - i * 0.05).toFixed(2), size: Math.round(400 + rnd() * 3600 * wgt) });
    asks.push({ price: +(mid + i * 0.05).toFixed(2), size: Math.round(400 + rnd() * 3600 * wgt) });
  }
  return { BIDS: bids, ASKS: asks };
})();

function CandleDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: 'K线图 + 成交量', desc: '红涨绿跌，实体=开收、影线=高低；底部量柱随涨跌着色；悬浮逐根 OHLC 气泡 + 竖直准星', node: <Replay>{() => <CandlestickChart data={CANDLES} volumeField="volume" height={340} />}</Replay>, code: 'import { CandlestickChart } from "react-native-flux-desktop";\n\n// 红涨绿跌，实体=开收、影线=高低；volumeField 加底部量副图\n<CandlestickChart data={CANDLES} volumeField="volume" height={340} />' },
    { name: '国际配色 · 绿涨', desc: 'upColor/downColor 覆盖为绿涨红跌', node: <Replay>{() => <CandlestickChart data={CANDLES} upColor="#26A69A" downColor="#EF5350" height={300} />}</Replay>, code: '// upColor/downColor 覆盖为绿涨红跌（国际配色）\n<CandlestickChart data={CANDLES} upColor="#26A69A" downColor="#EF5350" height={300} />' },
    { name: '阳线空心', desc: 'hollowUp 传统 A股空心阳线', node: <Replay>{() => <CandlestickChart data={CANDLES} hollowUp height={300} />}</Replay>, code: '// hollowUp：传统 A股空心阳线\n<CandlestickChart data={CANDLES} hollowUp height={300} />' },
    { name: 'K线 + 均线叠加（折线重叠）', desc: 'overlays 传入 MA5/MA10/MA20，与蜡烛共享价格轴逐步描出', node: <Replay>{() => <CandlestickChart data={CANDLES} overlays={CANDLE_OVERLAYS} height={340} />}</Replay>, code: '// overlays 传入 MA5/MA10/MA20，与蜡烛共享价格轴逐步描出\n<CandlestickChart data={CANDLES} overlays={CANDLE_OVERLAYS} height={340} />' },
    { name: '网格自定义', desc: 'grid 开虚线 + 纵向网格（dashed / vertical）', node: <Replay>{() => <CandlestickChart data={CANDLES} grid={{ dashed: true, vertical: true, color: '#B7EB8F' }} height={300} />}</Replay>, code: '// grid：虚线 + 纵向网格（dashed / vertical / color）\n<CandlestickChart data={CANDLES} grid={{ dashed: true, vertical: true, color: \'#B7EB8F\' }} height={300} />' },
    { name: 'OHLC 竹线', desc: 'variant="ohlc"：高低价竖线 + 左开盘右收盘短划（欧美竹线画法）', node: <Replay>{() => <CandlestickChart data={CANDLES} variant="ohlc" height={300} />}</Replay>, code: '// variant="ohlc"：高低价竖线 + 左开盘右收盘短划（欧美竹线）\n<CandlestickChart data={CANDLES} variant="ohlc" height={300} />' },
  ];
  const api: ApiRow[] = [
    { name: 'data', desc: 'OHLC 行表', type: 'object[]', default: '–' },
    { name: 'openField / highField / lowField / closeField', desc: '四价字段', type: 'string', default: 'open/high/low/close' },
    { name: 'volumeField / showVolume', desc: '成交量字段 / 量副图', type: 'string / boolean', default: '– / 自动' },
    { name: 'upColor / downColor', desc: '涨色 / 跌色', type: 'string', default: '红 / 绿' },
    { name: 'hollowUp', desc: '阳线空心', type: 'boolean', default: 'false' },
    { name: 'overlays', desc: '叠加折线（均线等），与 data 等长、共享价格轴', type: 'CandleOverlay[]', default: '–' },
    { name: 'grid', desc: '网格自定义 show/color/dashed/thickness/vertical', type: 'GridConfig', default: '–' },
    { name: 'variant', desc: '画线样式：蜡烛 / OHLC 竹线', type: "'candle' | 'ohlc'", default: 'candle' },
    { name: 'showXAxis', desc: '预留/绘制底部时间轴（多面板堆叠时副图下方关闭）', type: 'boolean', default: 'true' },
    { name: 'tooltip', desc: '悬浮逐根 OHLC/涨跌幅/量 气泡 + 竖直准星（靠右自动翻边）', type: 'boolean', default: 'true' },
  ];
  const tokens: TokenRow[] = [
    { name: 'colorError', desc: '涨色默认（红涨）', default: '错误色' },
    { name: 'colorSuccess', desc: '跌色默认（绿跌）', default: '成功色' },
    { name: 'colorSplit', desc: '价格网格线', default: '分割色' },
  ];
  return <DemoPage demos={demos} api={api} tokens={tokens} />;
}

function TimeSharingDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '分时图', desc: '现价线 + 均价线 + 面积，昨收虚线基准；左价格右涨跌幅；悬浮十字准星 + 时刻/现价/均价/涨跌幅气泡（点按钮重播）', node: <Replay>{() => <TimeSharingChart data={INTRADAY} prevClose={100} height={300} />}</Replay>, code: 'import { TimeSharingChart } from "react-native-flux-desktop";\n\n// 现价线 + 均价线 + 面积，昨收虚线基准；prevClose 定基准与对称量程\n<TimeSharingChart data={INTRADAY} prevClose={100} height={300} />' },
    { name: '仅现价', desc: 'showAvg=false showArea=false 只留现价线', node: <Replay>{() => <TimeSharingChart data={INTRADAY} prevClose={100} showAvg={false} showArea={false} height={280} />}</Replay>, code: '// showAvg=false showArea=false 只留现价线\n<TimeSharingChart data={INTRADAY} prevClose={100} showAvg={false} showArea={false} height={280} />' },
  ];
  const api: ApiRow[] = [
    { name: 'priceField / avgField', desc: '现价 / 均价字段', type: 'string', default: 'price / avg' },
    { name: 'prevClose', desc: '昨收（基准 + 对称量程）', type: 'number', default: '首点' },
    { name: 'showAvg / showArea', desc: '均价线 / 面积', type: 'boolean', default: 'true' },
    { name: 'upColor / downColor', desc: '涨 / 跌着色（按末点相对昨收）', type: 'string', default: '红 / 绿' },
    { name: 'tooltip', desc: '悬浮十字准星 + 命中点圆环 + 现价/均价/涨跌幅气泡（靠右自动翻边）', type: 'boolean', default: 'true' },
  ];
  const tokens: TokenRow[] = [
    { name: 'colorError', desc: '涨（现价≥昨收）线色', default: '错误色' },
    { name: 'colorSuccess', desc: '跌线色', default: '成功色' },
    { name: 'colorBorderSecondary', desc: '昨收虚线', default: '次边框' },
  ];
  return <DemoPage demos={demos} api={api} tokens={tokens} />;
}

/** 实时行情：每秒向序列尾部追加一条新 K 线（滚动窗口 50 根），演示每秒获取新数据的行情流。 */
function LiveCandle(): React.ReactElement {
  const [rows, setRows] = React.useState<Record<string, any>[]>(() => CANDLES_LONG.slice(-50));
  const [running, setRunning] = React.useState(true);
  React.useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setRows((prev) => {
        const lastRow = prev[prev.length - 1];
        const open = lastRow ? Number(lastRow.close) : 100;
        const drift = (Math.random() - 0.48) * 5;
        const close = Math.max(60, open + drift);
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        const volume = Math.round(20000 + Math.random() * 60000 + Math.abs(drift) * 8000);
        const now = new Date();
        const label = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const next = [...prev, { date: label, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume }];
        return next.slice(-50);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const closes = rows.map((r): number => Number(r.close));
  const overlays = [
    { name: 'MA5', color: '#5B8FF9', values: movingAverage(closes, 5) },
    { name: 'MA10', color: '#F6BD16', values: movingAverage(closes, 10) },
  ];
  const lastRow = rows[rows.length - 1];
  const prevRow = rows[rows.length - 2];
  const upNow = lastRow && prevRow ? Number(lastRow.close) >= Number(prevRow.close) : true;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Button size="small" style={{ alignSelf: 'flex-start' }} onClick={() => setRunning((r) => !r)}>{running ? '暂停行情流' : '继续行情流'}</Button>
        <Text style={{ fontSize: 14, color: upNow ? '#FF4D4F' : '#52C41A' }}>
          最新 {lastRow ? Number(lastRow.close).toFixed(2) : '–'} · 每秒新增一根（滚动 50）
        </Text>
      </View>
      <CandlestickChart data={rows} volumeField="volume" overlays={overlays} animation={false} height={360} />
    </View>
  );
}

function StreamCandleDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '实时行情（每秒新数据）', desc: 'setInterval 每秒向尾部追加一根 K 线，滚动窗口 50 根，叠加 MA5/MA10；animation=false 不逐帧重播', node: <LiveCandle />, code: '// setInterval 每秒向尾部追加一根 K 线，滚动窗口 50 根\n// overlays 用 movingAverage(closes, n) 实时重算；animation=false 不逐帧重播\n<CandlestickChart data={rows} volumeField="volume" overlays={overlays} animation={false} height={360} />' },
  ];
  const api: ApiRow[] = [
    { name: 'data（每秒追加）', desc: '外部定时器驱动数据源，组件按数据自然增量渲染', type: 'object[]', default: '–' },
    { name: 'animation=false', desc: '关闭入场动画，实时流式更新不重播', type: 'boolean', default: 'true' },
    { name: 'overlays', desc: '均线随新数据实时重算', type: 'CandleOverlay[]', default: '–' },
  ];
  const tokens: TokenRow[] = [
    { name: 'colorError / colorSuccess', desc: '涨 / 跌蜡烛色', default: '红 / 绿' },
  ];
  return <DemoPage demos={demos} api={api} tokens={tokens} />;
}

/** 多面板行情：主图 showXAxis=false + MA 叠加，副图共享 band 逐根对齐堆叠。 */
function StockPanelDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    {
      name: '多面板行情（K线 + MACD + RSI + VOL）',
      desc: '主图 showXAxis=false + MA 叠加，副图共享 band 像素对齐逐根堆叠；最底 VOL 保留时间轴；副图悬浮逐根准星 + 时刻/指标数值气泡（暖机期 null 行自动跳过）',
      node: (
        <Replay>
          {() => (
            <View style={{ gap: 6 }}>
              <CandlestickChart data={CANDLES_LONG} overlays={LONG_OVERLAYS} showXAxis={false} width={620} height={280} />
              <IndicatorChart data={CANDLES_LONG} type="MACD" label="MACD(12,26,9)" showXAxis={false} width={620} height={120} />
              <IndicatorChart data={CANDLES_LONG} type="RSI" label="RSI(14)" showXAxis={false} width={620} height={110} />
              <IndicatorChart data={CANDLES_LONG} type="VOL" label="成交量" width={620} height={110} />
            </View>
          )}
        </Replay>
      ),
      code: 'import { CandlestickChart, IndicatorChart, View } from "react-native-flux-desktop";\n\n// 主图 showXAxis=false + MA 叠加，副图共享 band 逐根对齐堆叠；最底 VOL 保留时间轴\n<View style={{ gap: 6 }}>\n  <CandlestickChart data={CANDLES_LONG} overlays={LONG_OVERLAYS} showXAxis={false} width={620} height={280} />\n  <IndicatorChart data={CANDLES_LONG} type="MACD" label="MACD(12,26,9)" showXAxis={false} width={620} height={120} />\n  <IndicatorChart data={CANDLES_LONG} type="RSI" label="RSI(14)" showXAxis={false} width={620} height={110} />\n  <IndicatorChart data={CANDLES_LONG} type="VOL" label="成交量" width={620} height={110} />\n</View>',
    },
    {
      name: 'KDJ 副图（独立）',
      desc: 'type="KDJ"：K/D/J 三线 + 20/80 参考线',
      node: <Replay>{() => <IndicatorChart data={CANDLES_LONG} type="KDJ" label="KDJ(9,3,3)" width={620} height={140} />}</Replay>,
      code: '// type="KDJ"：K/D/J 三线 + 20/80 参考线\n<IndicatorChart data={CANDLES_LONG} type="KDJ" label="KDJ(9,3,3)" width={620} height={140} />',
    },
  ];
  const api: ApiRow[] = [
    { name: 'type', desc: '副图指标类型', type: "'VOL' | 'MACD' | 'RSI' | 'KDJ'", default: '–' },
    { name: 'data + OHLC/volume 字段', desc: '与主图同源，逐根对齐', type: 'object[]', default: '–' },
    { name: 'params', desc: '指标参数 MACD[f,s,g]/RSI[n]/KDJ[n,m1,m2]', type: 'number[]', default: '各自默认' },
    { name: 'showXAxis', desc: '仅最底面板开启时间轴', type: 'boolean', default: 'true' },
    { name: 'label', desc: '面板左上角标题', type: 'string', default: '–' },
    { name: 'tooltip', desc: '悬浮逐根竖直准星 + 时刻/指标数值气泡（VOL显量/MACD显HIST·DIF·DEA/RSI·KDJ显各线）', type: 'boolean', default: 'true' },
  ];
  const tokens: TokenRow[] = [
    { name: 'palette[0]/[2]/[7]/[5]', desc: 'DIF/DEA、K/D/J 线色', default: '色板' },
    { name: 'colorError / colorSuccess', desc: 'MACD 红绿柱正负', default: '红 / 绿' },
  ];
  return <DemoPage demos={demos} api={api} tokens={tokens} />;
}

function DepthDemo(): React.ReactElement {
  const demos: DemoItem[] = [
    { name: '订单簿深度', desc: '买盘(绿)/卖盘(红)累计阶梯，中价虚线；x=价格 y=累计挂单量；悬浮逐档准星 + 价格/挂单量/累计气泡', node: <Replay>{() => <DepthChart bids={BIDS} asks={ASKS} height={280} />}</Replay>, code: 'import { DepthChart } from "react-native-flux-desktop";\n\n// 买盘(绿)/卖盘(红)累计阶梯，中价虚线；x=价格 y=累计挂单量\n<DepthChart bids={BIDS} asks={ASKS} height={280} />' },
    { name: '逐档梳状', desc: 'cumulative=false 显示每档挂单量', node: <Replay>{() => <DepthChart bids={BIDS} asks={ASKS} cumulative={false} height={240} />}</Replay>, code: '// cumulative=false 显示每档挂单量（逐档梳状）\n<DepthChart bids={BIDS} asks={ASKS} cumulative={false} height={240} />' },
  ];
  const api: ApiRow[] = [
    { name: 'bids / asks', desc: '买卖挂单档位', type: 'DepthLevel[]', default: '–' },
    { name: 'cumulative', desc: '累计山形 / 逐档梳状', type: 'boolean', default: 'true' },
    { name: 'bidColor / askColor', desc: '买盘 / 卖盘色', type: 'string', default: '绿 / 红' },
    { name: 'priceFormatter / sizeFormatter', desc: '价格 / 挂单量格式化', type: 'fn', default: '2位 / 紧凑' },
    { name: 'tooltip', desc: '悬浮逐档准星 + 价格/挂单量/累计气泡（cumulative=false 时不显累计行）', type: 'boolean', default: 'true' },
  ];
  const tokens: TokenRow[] = [
    { name: 'colorSuccess / colorError', desc: '买盘 / 卖盘默认色', default: '绿 / 红' },
    { name: 'colorSplit', desc: '深度网格线', default: '分割色' },
  ];
  return <DemoPage demos={demos} api={api} tokens={tokens} />;
}

export { CandleDemo, TimeSharingDemo, StreamCandleDemo, StockPanelDemo, DepthDemo };
