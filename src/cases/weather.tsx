// 案例 / 天气：Open-Meteo 公共 API 直连（无需 Key），对标 MSN 天气整页布局，全走主题 token 明暗自适应。
// 数据管线：预报端点（current + hourly + daily，timezone=auto）+ 空气质量端点（us_aqi / pm2_5）；
// 网络不可达自动降级为确定性模拟数据（页面常活）。单位 °C/°F 切换、城市切换、重取。
// 版式：左侧主卡（实况大字 + 天气 emoji + 高低温 → 7 日条 → 逐时温度面积曲线 + 降水概率）；
//       右侧指标瓦片 2 列栅格（能见度 / 风 / 气压 / 空气质量 / 湿度 / 紫外线 / 日照），同排等高。
import React from 'react';
import {
  View, Text, Card, Tag, Segmented, Button, Pressable, Icon, AreaChart, Progress,
  useToken, fade,
} from 'react-native-flux-desktop';

/** Node24 全局 fetch（@types/node@20 无类型，统一走 any 垫片） */
const G = globalThis as any;

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality';

interface City { name: string; admin: string; lat: number; lon: number }
const CITIES: City[] = [
  { name: '北京市', admin: '北京', lat: 39.9042, lon: 116.4074 },
  { name: '上海市', admin: '上海', lat: 31.2304, lon: 121.4737 },
  { name: '南京市', admin: '江苏省', lat: 32.0603, lon: 118.7969 },
  { name: '广州市', admin: '广东省', lat: 23.1291, lon: 113.2644 },
  { name: '成都市', admin: '四川省', lat: 30.5728, lon: 104.0668 },
  { name: '杭州市', admin: '浙江省', lat: 30.2741, lon: 120.1551 },
];

/* ────────────────────────── 数据模型 ────────────────────────── */
interface Cur { temp: number; feels: number; humidity: number; code: number; isDay: number; wind: number; gust: number; dir: number; pressure: number; vis: number }
interface Day { date: string; code: number; isDay: number; tmax: number; tmin: number; sunrise: string; sunset: string; prob: number; uv: number }
interface Hour { time: string; temp: number; prob: number; code: number }
interface WX { cur: Cur; days: Day[]; hours: Hour[]; aqi: number | null; pm25: number | null }

/* ────────────────────────── WMO 天气码 → emoji + 文案 ────────────────────────── */
function wmo(code: number, isDay: number): { icon: string; label: string } {
  if (code === 0) return { icon: isDay ? '☀️' : '🌙', label: '晴' };
  if (code === 1) return { icon: isDay ? '🌤️' : '🌙', label: '大部晴朗' };
  if (code === 2) return { icon: '⛅', label: '多云' };
  if (code === 3) return { icon: '☁️', label: '阴' };
  if (code === 45 || code === 48) return { icon: '🌫️', label: '雾' };
  if (code >= 51 && code <= 57) return { icon: '🌦️', label: '毛毛雨' };
  if (code >= 61 && code <= 67) return { icon: '🌧️', label: '雨' };
  if (code >= 71 && code <= 77) return { icon: '❄️', label: '雪' };
  if (code >= 80 && code <= 82) return { icon: '🌧️', label: '阵雨' };
  if (code === 85 || code === 86) return { icon: '🌨️', label: '阵雪' };
  if (code >= 95) return { icon: '⛈️', label: '雷阵雨' };
  return { icon: '🌡️', label: '未知' };
}

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const DIRS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
const dirLabel = (deg: number): string => DIRS[Math.round(deg / 45) % 8];
/** 蒲福风级（按 km/h 粗分）→ { 文案, 语义色 key } */
function windLevel(kmh: number): { label: string; color: string } {
  if (kmh < 1) return { label: '无风', color: 'success' };
  if (kmh < 6) return { label: '1 级 · 软风', color: 'success' };
  if (kmh < 12) return { label: '2 级 · 轻风', color: 'success' };
  if (kmh < 20) return { label: '3 级 · 微风', color: 'primary' };
  if (kmh < 29) return { label: '4 级 · 和风', color: 'primary' };
  if (kmh < 39) return { label: '5 级 · 清风', color: 'warning' };
  if (kmh < 50) return { label: '6 级 · 强风', color: 'warning' };
  if (kmh < 62) return { label: '7 级 · 疾风', color: 'error' };
  return { label: '8 级以上 · 大风', color: 'error' };
}
function visLevel(km: number): { label: string; color: string } {
  if (km >= 20) return { label: '极好', color: 'success' };
  if (km >= 10) return { label: '好', color: 'success' };
  if (km >= 5) return { label: '中等', color: 'primary' };
  if (km >= 2) return { label: '较差', color: 'warning' };
  return { label: '差', color: 'error' };
}
/** 相对湿度分级 → { 文案, 语义色 key } */
function humLevel(pct: number): { label: string; color: string } {
  if (pct < 30) return { label: '干燥', color: 'warning' };
  if (pct < 70) return { label: '舒适', color: 'success' };
  return { label: '潮湿', color: 'primary' };
}
/** US AQI 分级 → { 文案, 语义色 key } */
function aqiLevel(aqi: number | null): { label: string; color: string } {
  if (aqi == null) return { label: '暂无', color: 'text' };
  if (aqi <= 50) return { label: '优', color: 'success' };
  if (aqi <= 100) return { label: '良', color: 'primary' };
  if (aqi <= 150) return { label: '轻度污染', color: 'warning' };
  if (aqi <= 200) return { label: '中度污染', color: 'error' };
  return { label: '重度污染', color: 'error' };
}
function uvLevel(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: '低', color: 'success' };
  if (uv < 6) return { label: '中等', color: 'primary' };
  if (uv < 8) return { label: '高', color: 'warning' };
  if (uv < 11) return { label: '很高', color: 'error' };
  return { label: '强', color: 'error' };
}

const hhmm = (iso: string): string => (iso && iso.length >= 16 ? iso.slice(11, 16) : '--:--');
/** ISO/HH:mm 字符串 → 当日分钟数（无效返回 NaN） */
const toMin = (s: string): number => (s && s.length >= 5 ? +s.slice(11, 13) * 60 + +s.slice(14, 16) : NaN);
const weekday = (date: string, i: number): string => (i === 0 ? '今天' : WEEK[new Date(date + 'T00:00:00').getDay()]);

/* ────────────────────────── 拉取 + 映射 ────────────────────────── */
function withTimeout(p: any, ms: number): Promise<any> {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

function mapWX(j: any, aqi: number | null, pm25: number | null): WX {
  const c = j.current;
  const h = j.hourly;
  const d = j.daily;
  // 当前小时在 hourly 数组中的索引（current.time 形如 2026-10-01T19:00）
  const nowIso: string = c.time ?? '';
  let start = h.time.findIndex((t: string) => t.slice(0, 13) === nowIso.slice(0, 13));
  if (start < 0) start = 0;
  const cur: Cur = {
    temp: +c.temperature_2m, feels: +c.apparent_temperature, humidity: +c.relative_humidity_2m,
    code: +c.weather_code, isDay: +(c.is_day ?? 1), wind: +c.wind_speed_10m, gust: +c.wind_gusts_10m,
    dir: +c.wind_direction_10m, pressure: Math.round(+c.pressure_msl), vis: (h.visibility?.[start] ?? 20000) / 1000,
  };
  const days: Day[] = d.time.map((date: string, i: number) => ({
    date, code: +d.weather_code[i], isDay: 1, tmax: +d.temperature_2m_max[i], tmin: +d.temperature_2m_min[i],
    sunrise: d.sunrise?.[i] ?? '', sunset: d.sunset?.[i] ?? '', prob: +(d.precipitation_probability_max?.[i] ?? 0), uv: +(d.uv_index_max?.[i] ?? 0),
  }));
  const hours: Hour[] = [];
  for (let i = start; i < Math.min(start + 24, h.time.length); i++) {
    hours.push({ time: h.time[i].slice(11, 16), temp: +h.temperature_2m[i], prob: +(h.precipitation_probability?.[i] ?? 0), code: +h.weather_code[i] });
  }
  return { cur, days, hours, aqi, pm25 };
}

async function fetchCity(city: City): Promise<WX> {
  const fUrl = `${FORECAST}?latitude=${city.lat}&longitude=${city.lon}`
    + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m'
    + '&hourly=temperature_2m,precipitation_probability,weather_code,visibility'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max'
    + '&timezone=auto&forecast_days=7';
  const r = await withTimeout(G.fetch(fUrl), 8000);
  const j = await r.json();
  let aqi: number | null = null;
  let pm25: number | null = null;
  try {
    const ar = await withTimeout(G.fetch(`${AIR}?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi,pm2_5`), 6000);
    const aj = await ar.json();
    aqi = aj?.current?.us_aqi ?? null;
    pm25 = aj?.current?.pm2_5 ?? null;
  } catch { /* 空气质量失败不阻断主数据 */ }
  return mapWX(j, aqi, pm25);
}

/** 离线降级：按城市维度生成确定性模拟数据（页面常活） */
function simCity(city: City): WX {
  const base = Math.round(28 - Math.abs(city.lat - 25) * 0.6);
  const cur: Cur = {
    temp: base, feels: base - 1, humidity: 55 + Math.round(Math.abs(city.lon) % 30), code: 2, isDay: 1,
    wind: 8 + (Math.round(city.lat) % 10), gust: 15 + (Math.round(city.lon) % 12), dir: (Math.round(city.lat * 7) % 8) * 45,
    pressure: 1008 + (Math.round(city.lon) % 20), vis: 18 + (Math.round(city.lat) % 12),
  };
  const now = new Date();
  const days: Day[] = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(now.getTime() + i * 864e5);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    const tmax = base + 3 + ((i * 3) % 6);
    return { date: iso, code: [0, 1, 2, 3, 61, 2, 0][i % 7], isDay: 1, tmax, tmin: tmax - 6, sunrise: '06:12', sunset: '17:50', prob: (i * 11) % 40, uv: 2 + (i % 7) };
  });
  const hours: Hour[] = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now.getTime() + i * 36e5);
    const temp = base + Math.round(Math.sin((t.getHours() - 6) / 24 * Math.PI * 2) * 4);
    return { time: `${String(t.getHours()).padStart(2, '0')}:00`, temp, prob: (i * 7) % 35, code: 2 };
  });
  return { cur, days, hours, aqi: 40 + (Math.round(city.lat) % 60), pm25: 12 + (Math.round(city.lon) % 40) };
}

/* ────────────────────────── 指标瓦片壳 ────────────────────────── */
function Metric(props: { title: string; children: React.ReactNode; style?: any }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flex: 1, minWidth: 0, backgroundColor: token.colorBgContainer, borderWidth: 1, borderColor: token.colorBorderSecondary, borderRadius: token.borderRadiusLG, padding: token.padding, gap: token.marginXS, ...props.style }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{props.title}</Text>
      {props.children}
    </View>
  );
}

/* ────────────────────────── 主体 ────────────────────────── */
function WeatherBody(props: { wx: WX; unit: 'C' | 'F'; city: City }): React.ReactElement {
  const { token } = useToken();
  const { wx, unit, city } = props;
  const conv = (c: number): number => (unit === 'C' ? c : (c * 9) / 5 + 32);
  const fmtT = (c: number): string => `${Math.round(conv(c))}°`;
  const sem = (key: string): string =>
    key === 'success' ? token.colorSuccess : key === 'warning' ? token.colorWarning : key === 'error' ? token.colorError : key === 'primary' ? token.colorPrimary : token.colorText;

  const cond = wmo(wx.cur.code, wx.cur.isDay);
  const today = wx.days[0];
  const aqiInfo = aqiLevel(wx.aqi);
  const uvInfo = uvLevel(today?.uv ?? wx.cur.code);
  const visInfo = visLevel(wx.cur.vis);
  const windInfo = windLevel(wx.cur.wind);
  const humInfo = humLevel(wx.cur.humidity);

  // 日照轨迹：以城市当前时刻（取逐时首点）在日出→日落区间中的占比定位太阳
  const srMin = today ? toMin(today.sunrise) : NaN;
  const ssMin = today ? toMin(today.sunset) : NaN;
  const nowH = wx.hours[0]?.time ?? '';
  const nowM = nowH.length >= 5 ? +nowH.slice(0, 2) * 60 + +nowH.slice(3, 5) : NaN;
  const sunPct = isFinite(srMin) && isFinite(ssMin) && ssMin > srMin && isFinite(nowM)
    ? Math.max(5, Math.min(95, ((nowM - srMin) / (ssMin - srMin)) * 100))
    : 0;

  // 逐时温度面积曲线数据（按当前单位换算；每 2 小时取一点，避免 x 轴时间标签挤叠）
  const areaData = wx.hours.filter((_, i) => i % 2 === 0).map((h) => ({ x: h.time, y: Math.round(conv(h.temp)) }));
  const probRow = wx.hours.filter((_, i) => i % 3 === 0).slice(0, 8);

  const cardBg = token.colorBgContainer;
  const border = token.colorBorderSecondary;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: token.margin }}>
      {/* ── 左：主卡 ── */}
      <View style={{ flex: 3, minWidth: 0, gap: token.margin }}>
        <View style={{ backgroundColor: cardBg, borderWidth: 1, borderColor: border, borderRadius: token.borderRadiusLG, padding: token.paddingLG, gap: token.marginLG }}>
          {/* 城市 + 更新时间 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
            <Icon name="location" size={token.fontSize} color={token.colorPrimary} />
            <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>{city.admin} {city.name}</Text>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>· 几分钟前更新</Text>
          </View>

          {/* 实况大字 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
            <Text style={{ fontSize: 64, lineHeight: 72 }}>{cond.icon}</Text>
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 56, fontWeight: '700', color: token.colorText, lineHeight: 62 }}>{fmtT(wx.cur.temp)}</Text>
            </View>
            <View style={{ gap: token.marginXXS }}>
              <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText }}>{cond.label}</Text>
              <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>高温 {fmtT(today?.tmax ?? wx.cur.temp)} 低温 {fmtT(today?.tmin ?? wx.cur.temp)}</Text>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>体感 {fmtT(wx.cur.feels)} · 湿度 {Math.round(wx.cur.humidity)}%</Text>
            </View>
          </View>

          {/* 7 日预报条 */}
          <View style={{ flexDirection: 'row', gap: token.marginXXS }}>
            {wx.days.map((d, i) => {
              const c = wmo(d.code, 1);
              return (
                <View key={d.date} style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: token.marginXXS, paddingVertical: token.paddingXS, borderRadius: token.borderRadius, backgroundColor: i === 0 ? fade(token.colorPrimary, 0.1) : 'transparent' }}>
                  <Text style={{ fontSize: token.fontSizeSM, color: i === 0 ? token.colorPrimary : token.colorText, fontWeight: i === 0 ? '600' : '400' }}>{weekday(d.date, i)}</Text>
                  <Text style={{ fontSize: 22, lineHeight: 26 }}>{c.icon}</Text>
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{fmtT(d.tmax)}</Text>
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{fmtT(d.tmin)}</Text>
                </View>
              );
            })}
          </View>

          {/* 逐时温度曲线 */}
          <View style={{ gap: token.marginXS }}>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>未来 24 小时温度</Text>
            <View style={{ overflow: 'hidden', cacheAsBitmap: true }}>
              <AreaChart
                data={areaData}
                xField="x"
                yField="y"
                height={150}
                smooth
                gradient
                legend={false}
                yAxisFormatter={(v) => `${v}°`}
                color={[token.colorPrimary]}
              />
            </View>
            {/* 降水概率行 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {probRow.map((h) => (
                <View key={h.time} style={{ alignItems: 'center', gap: 2 }}>
                  <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{h.time}</Text>
                  <Text style={{ fontSize: token.fontSizeSM, color: h.prob >= 30 ? token.colorPrimary : token.colorTextQuaternary }}>💧{h.prob}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ── 右：指标瓦片栅格（2 列，同排等高） ── */}
      <View style={{ flex: 2, minWidth: 0, gap: token.margin }}>
        {/* 行 A：能见度 / 风 */}
        <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.margin }}>
          <Metric title="能见度">
            <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>{wx.cur.vis.toFixed(1)}<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}> 公里</Text></Text>
            <Text style={{ fontSize: token.fontSize, color: sem(visInfo.color) }}>{visInfo.label}</Text>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: fade(token.colorText, 0.08), marginTop: 'auto' }}>
              <View style={{ height: 6, borderRadius: 3, width: `${Math.min(100, (wx.cur.vis / 40) * 100)}%`, backgroundColor: sem(visInfo.color) }} />
            </View>
          </Metric>
          <Metric title="风">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: border, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="navigation" size={22} color={sem(windInfo.color)} rotate={wx.cur.dir - 45} />
              </View>
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorText }}>{Math.round(wx.cur.wind)}<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}> 公里/小时</Text></Text>
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>阵风 {Math.round(wx.cur.gust)} · {dirLabel(wx.cur.dir)}风</Text>
              </View>
            </View>
            <Text style={{ fontSize: token.fontSize, color: sem(windInfo.color), marginTop: 'auto' }}>风力：{windInfo.label}</Text>
          </Metric>
        </View>

        {/* 行 B：气压 / 空气质量 */}
        <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.margin }}>
          <Metric title="气压">
            <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>{wx.cur.pressure}<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}> hPa</Text></Text>
            <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>稳定</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 'auto', height: 22 }}>
              {[0.4, 0.6, 0.5, 0.75, 0.9, 0.85].map((f, i) => (
                <View key={i} style={{ width: 6, height: 22 * f, borderRadius: 2, backgroundColor: fade(token.colorPrimary, 0.5) }} />
              ))}
            </View>
          </Metric>
          <Metric title="空气质量">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
              <Progress type="circle" percent={Math.min(100, ((wx.aqi ?? 0) / 200) * 100)} width={54} strokeWidth={6} strokeColor={sem(aqiInfo.color)} trailColor={fade(token.colorText, 0.08)} format={() => `${wx.aqi ?? '--'}`} />
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: sem(aqiInfo.color) }}>{aqiInfo.label}</Text>
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>PM2.5 {wx.pm25 != null ? Math.round(wx.pm25) : '--'}</Text>
              </View>
            </View>
          </Metric>
        </View>

        {/* 行 C：湿度 / 紫外线 */}
        <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: token.margin }}>
          <Metric title="湿度">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
              <Progress type="dashboard" percent={Math.round(wx.cur.humidity)} width={54} strokeWidth={6} strokeColor={sem(humInfo.color)} trailColor={fade(token.colorText, 0.08)} gapDegree={75} />
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorText }}>{Math.round(wx.cur.humidity)}%</Text>
                <Text style={{ fontSize: token.fontSizeSM, color: sem(humInfo.color) }}>{humInfo.label}</Text>
              </View>
            </View>
          </Metric>
          <Metric title="紫外线">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
              <Progress type="dashboard" percent={Math.min(100, ((today?.uv ?? 0) / 11) * 100)} width={54} strokeWidth={6} strokeColor={sem(uvInfo.color)} trailColor={fade(token.colorText, 0.08)} gapDegree={75} format={() => `${today?.uv ?? 0}`} />
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: sem(uvInfo.color) }}>{uvInfo.label}</Text>
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>指数 {today?.uv ?? 0}</Text>
              </View>
            </View>
          </Metric>
        </View>

        {/* 行 D：日照轨迹（整行：总时长标题 + 轨迹条 + 两端时刻） */}
        <View style={{ flexDirection: 'row' }}>
          <Metric title="日照时长">
            <View style={{ gap: token.marginXS }}>
              <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>{daylight(today?.sunrise, today?.sunset)}</Text>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: fade(token.colorText, 0.08), justifyContent: 'center' }}>
                <View style={{ width: `${sunPct}%`, height: 6, borderRadius: 3, backgroundColor: fade(token.colorWarning, 0.55), alignItems: 'flex-end', justifyContent: 'center' }}>
                  <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center', transform: [{ translateX: 11 }] }}>
                    <Icon name="sun" size={20} color={token.colorWarning} />
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
                  <Icon name="arrowUp" size={token.fontSizeSM} color={token.colorTextTertiary} />
                  <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>日出 {hhmm(today?.sunrise ?? '')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
                  <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>日落 {hhmm(today?.sunset ?? '')}</Text>
                  <Icon name="arrowDown" size={token.fontSizeSM} color={token.colorTextTertiary} />
                </View>
              </View>
            </View>
          </Metric>
        </View>
      </View>
    </View>
  );
}

function daylight(sunrise: string | undefined, sunset: string | undefined): string {
  if (!sunrise || !sunset) return '--';
  const a = new Date(sunrise).getTime();
  const b = new Date(sunset).getTime();
  if (isNaN(a) || isNaN(b) || b <= a) return '--';
  const mins = Math.round((b - a) / 60000);
  return `${Math.floor(mins / 60)} 小时 ${mins % 60} 分钟`;
}

/* ────────────────────────── 外壳（状态条 + 城市切换 + 单位 + 重取） ────────────────────────── */
export function WeatherDemo(): React.ReactElement {
  const { token } = useToken();
  const [cityIdx, setCityIdx] = React.useState(2); // 默认南京
  const [unit, setUnit] = React.useState<'C' | 'F'>('C');
  const [mode, setMode] = React.useState<'boot' | 'live' | 'sim'>('boot');
  const [wx, setWx] = React.useState<WX | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  const city = CITIES[cityIdx];

  React.useEffect(() => {
    let dead = false;
    setMode('boot');
    (async (): Promise<void> => {
      try {
        const data = await fetchCity(city);
        if (!dead) { setWx(data); setMode('live'); }
      } catch {
        if (!dead) { setWx(simCity(city)); setMode('sim'); }
      }
    })();
    return (): void => { dead = true; };
  }, [city, reloadKey]);

  return (
    <View style={{ gap: token.marginLG }}>
      {/* 状态条 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, flexWrap: 'wrap' }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mode === 'live' ? token.colorSuccess : mode === 'sim' ? token.colorWarning : token.colorTextQuaternary }} />
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>天气 Weather</Text>
        <Tag color={mode === 'live' ? 'success' : mode === 'sim' ? 'warning' : 'default'}>
          {mode === 'live' ? 'Open-Meteo 实时' : mode === 'sim' ? '离线演示 · 本地模拟' : '加载中…'}
        </Tag>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>公共 API · 无需 Key</Text>
        <View style={{ flex: 1 }} />
        <View style={{ flexShrink: 0 }}>
          <Segmented
            size="small"
            value={unit}
            onChange={(v) => setUnit(v as 'C' | 'F')}
            options={[{ label: '°C', value: 'C' }, { label: '°F', value: 'F' }]}
          />
        </View>
        <View style={{ flexShrink: 0 }}>
          <Button size="small" icon={<Icon name="refreshCw" />} onPress={(): void => setReloadKey((k) => k + 1)}>刷新</Button>
        </View>
      </View>

      {/* 城市切换 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, flexWrap: 'wrap' }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>城市</Text>
        {CITIES.map((c, i) => (
          <Pressable key={c.name} onPress={(): void => setCityIdx(i)} style={{ cursor: 'pointer' }}>
            <View style={{ paddingHorizontal: token.paddingSM, paddingVertical: token.paddingXXS, borderRadius: token.borderRadiusSM, borderWidth: 1, borderColor: i === cityIdx ? token.colorPrimary : token.colorBorder, backgroundColor: i === cityIdx ? fade(token.colorPrimary, 0.1) : 'transparent' }}>
              <Text style={{ fontSize: token.fontSizeSM, color: i === cityIdx ? token.colorPrimary : token.colorText, fontWeight: i === cityIdx ? '600' : '400' }}>{c.name}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* 主体 */}
      {mode === 'boot' || !wx ? (
        <View style={{ paddingVertical: token.paddingXL * 2, alignItems: 'center' }}>
          <Text style={{ color: token.colorTextTertiary }}>正在获取天气数据…</Text>
        </View>
      ) : (
        <WeatherBody wx={wx} unit={unit} city={city} />
      )}
    </View>
  );
}

export default WeatherDemo;
