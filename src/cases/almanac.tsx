// 案例 / 万年历：公历月历 + 农历/干支/生肖/节气/节日/宜忌/月相/方位 的桌面老黄历整页。
// 换算全部走 lunar-typescript（Solar/Lunar/HolidayUtil），已用春节/国庆等锚点校验；全走主题 token 明暗自适应。
// 版式（参考中华万年历 / 51万年历）：
//   顶部产品化标题 + 农历岁次 + 分段翻页条 + 今天；
//   左主区月历栅格（公历数字 + 农历小字；今天实心圆、选中高亮块、周末/节日染红、非本月淡化、休/班角标）；
//   右侧经典老黄历日卡（宜忌彩色块 + 财神喜神福神方位三柱 + 五行/胎神/九星/冲煞/纳音/彭祖/月相）；
//   底部本月节气 & 节日概览。
import React from 'react';
import {
  View, Text, Tag, Button, Pressable, Icon, Divider,
  useToken, fade,
} from 'react-native-flux-desktop';
import { Solar, HolidayUtil, Lunar } from 'lunar-typescript';

const WEEK_HEAD = ['日', '一', '二', '三', '四', '五', '六'];

/* ────────────────────────── 农历信息（带缓存） ────────────────────────── */
type SubKind = 'festival' | 'jieqi' | 'month' | 'lunar';
type HolidayBadge = 'rest' | 'work' | null;   // rest=休(放假) work=班(调休上班)
interface DayInfo {
  y: number; m: number; d: number;
  week: number;
  lunarDayNum: number;
  lunarMonthNum: number;
  lunarDayCn: string;
  lunarMonthCn: string;
  ganZhiYear: string; shengXiao: string;
  ganZhiMonth: string; ganZhiDay: string;
  naYin: string;
  jieqi: string | null;
  festival: string | null;
  festivals: string[];
  sub: string;
  subKind: SubKind;
  isWeekend: boolean;
  phase: string;
  yi: string[]; ji: string[];
  jiShen: string[]; xiongSha: string[];
  chong: string;
  pengZuGan: string; pengZuZhi: string;
  caiXi: string; xiShen: string; fuShen: string;
  xingZuo: string;
  wuXing: string; taiShen: string; nineStar: string; xunKong: string;
  tianShen: string; tianShenLuck: string; xiu: string; xiuLuck: string;
  zhiXing: string; liuYao: string; wuHou: string; dayLu: string;
  yangGui: string; yinGui: string;
  holidayName: string | null;
  badge: HolidayBadge;
}

const CACHE = new Map<string, DayInfo>();

/** 按农历日近似月相 */
function moonPhase(day: number): string {
  if (day <= 1 || day >= 30) return '新月';
  if (day <= 4) return '蛾眉月';
  if (day <= 9) return '上弦月';
  if (day <= 13) return '盈凸月';
  if (day <= 17) return '满月';
  if (day <= 22) return '亏凸月';
  if (day <= 26) return '下弦月';
  return '残月';
}

function getDayInfo(y: number, m: number, d: number): DayInfo {
  const key = `${y}-${m}-${d}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const s = Solar.fromYmd(y, m, d);
  const l = s.getLunar();
  const lunarMonthNum = l.getMonth();               // 负数=闰月
  const lunarDayNum = Math.abs(l.getDay());
  const jieQi = l.getCurrentJieQi();
  const festivals: string[] = (s.getFestivals() as string[]).concat(l.getFestivals() as string[]);
  const festival = festivals.length ? festivals[0] : null;
  const jieqi = jieQi ? jieQi.getName() : null;
  const lunarDayCn = l.getDayInChinese();
  const lunarMonthCn = `${l.getMonthInChinese()}月`;
  // 单元格小字优先级：节日 > 节气 > 初一(显示月名) > 农历日
  let sub: string; let subKind: SubKind;
  if (festival) { sub = festival; subKind = 'festival'; }
  else if (jieqi) { sub = jieqi; subKind = 'jieqi'; }
  else if (lunarDayNum === 1) { sub = (lunarMonthNum < 0 ? '闰' : '') + lunarMonthCn; subKind = 'month'; }
  else { sub = lunarDayCn; subKind = 'lunar'; }
  const week = s.getWeek();
  // 法定节假日 / 调休角标
  const hol = HolidayUtil.getHoliday(y, m, d);
  const badge: HolidayBadge = hol ? (hol.isWork() ? 'work' : 'rest') : null;
  const holidayName = hol ? hol.getName() : null;
  const info: DayInfo = {
    y, m, d, week, lunarDayNum, lunarMonthNum: Math.abs(l.getMonth()), lunarDayCn, lunarMonthCn,
    ganZhiYear: l.getYearInGanZhi(), shengXiao: l.getYearShengXiao(),
    ganZhiMonth: l.getMonthInGanZhi(), ganZhiDay: l.getDayInGanZhi(),
    naYin: l.getDayNaYin(), jieqi, festival, festivals, sub, subKind,
    isWeekend: week === 0 || week === 6,
    phase: moonPhase(lunarDayNum),
    yi: l.getDayYi(), ji: l.getDayJi(),
    jiShen: l.getDayJiShen(), xiongSha: l.getDayXiongSha(),
    chong: l.getDayChongShengXiao(),
    pengZuGan: l.getPengZuGan(), pengZuZhi: l.getPengZuZhi(),
    caiXi: l.getDayPositionCai(), xiShen: l.getDayPositionXi(), fuShen: l.getDayPositionFu(),
    xingZuo: s.getXingZuo(),
    wuXing: l.getBaZiWuXing()[2] || '', taiShen: l.getDayPositionTai(),
    nineStar: l.getDayNineStar().getNameInBeiDou(), xunKong: l.getDayXunKong(),
    tianShen: l.getDayTianShen(), tianShenLuck: l.getDayTianShenLuck(),
    xiu: l.getXiu(), xiuLuck: l.getXiuLuck(),
    zhiXing: l.getZhiXing(), liuYao: l.getLiuYao(), wuHou: l.getWuHou(), dayLu: l.getDayLu(),
    yangGui: l.getDayPositionYangGui(), yinGui: l.getDayPositionYinGui(),
    holidayName, badge,
  };
  CACHE.set(key, info);
  return info;
}

/* ────────────────────────── 月历栅格 ────────────────────────── */
interface Cell { info: DayInfo; inMonth: boolean }

function buildMonth(year: number, month: number): Cell[][] {
  const first = getDayInfo(year, month, 1);
  const lead = first.week; // 前置补上月尾
  const dim = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];
  const prevDim = new Date(year, month - 1, 0).getDate();
  for (let i = lead; i > 0; i--) {
    const dm = month === 1 ? 12 : month - 1;
    const dy = month === 1 ? year - 1 : year;
    cells.push({ info: getDayInfo(dy, dm, prevDim - i + 1), inMonth: false });
  }
  for (let d = 1; d <= dim; d++) cells.push({ info: getDayInfo(year, month, d), inMonth: true });
  let n = 1;
  while (cells.length % 7 !== 0) {
    const nm = month === 12 ? 1 : month + 1;
    const ny = month === 12 ? year + 1 : year;
    cells.push({ info: getDayInfo(ny, nm, n), inMonth: false });
    n++;
  }
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* ────────────────────────── 小工具 ────────────────────────── */
function sameDay(a: { y: number; m: number; d: number }, y: number, m: number, d: number): boolean {
  return a.y === y && a.m === m && a.d === d;
}

/** 详情面板里一行「标签：值」 */
function InfoRow(props: { label: string; children: React.ReactNode }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', gap: token.marginSM }}>
      <Text style={{ width: 52, fontSize: token.fontSizeSM, color: token.colorTextTertiary, lineHeight: token.fontSizeLG * 1.5 }}>{props.label}</Text>
      <View style={{ flex: 1, minWidth: 0 }}>{props.children}</View>
    </View>
  );
}

/* ────────────────────────── 单元格 ────────────────────────── */
function DayCell(props: {
  cell: Cell; today: { y: number; m: number; d: number }; sel: { y: number; m: number; d: number };
  onPick: (y: number, m: number, d: number) => void;
}): React.ReactElement {
  const { token } = useToken();
  const { cell, today, sel, onPick } = props;
  const { info, inMonth } = cell;
  const isToday = sameDay(info, today.y, today.m, today.d);
  const isSel = sameDay(info, sel.y, sel.m, sel.d);

  const subColor =
    info.subKind === 'festival' ? token.colorError
      : info.subKind === 'jieqi' ? token.colorSuccess
        : info.subKind === 'month' ? token.colorTextSecondary
          : token.colorTextTertiary;

  // 数字颜色：今天走实心圆内白字；非本月淡化；周末/节日红；其余主文本
  const numColor = !inMonth
    ? token.colorTextQuaternary
    : isToday ? token.colorTextLightSolid
      : info.isWeekend || info.subKind === 'festival' ? token.colorError
        : token.colorText;

  const badgeColor = info.badge === 'rest' ? token.colorError : token.colorInfo;

  return (
    <Pressable onPress={(): void => onPick(info.y, info.m, info.d)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
      <View style={{
        position: 'relative',
        height: 82, borderRadius: token.borderRadiusLG,
        alignItems: 'center', justifyContent: 'center', gap: 3,
        borderWidth: 1,
        borderColor: isSel ? token.colorPrimary : 'transparent',
        backgroundColor: isSel
          ? fade(token.colorPrimary, isToday ? 0.16 : 0.1)
          : isToday ? fade(token.colorPrimary, 0.06)
            : 'transparent',
      }}>
        {/* 廿八宿 角标（左上，极简淡化） */}
        {inMonth ? (
          <View style={{ position: 'absolute', top: 4, left: 5 }}>
            <Text style={{ fontSize: 10, color: token.colorTextQuaternary, lineHeight: 12 }}>{info.xiu}</Text>
          </View>
        ) : null}

        {/* 休/班 角标 */}
        {inMonth && info.badge ? (
          <View style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: token.borderRadiusXS, alignItems: 'center', justifyContent: 'center', backgroundColor: fade(badgeColor, 0.14) }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: badgeColor, lineHeight: 12 }}>{info.badge === 'rest' ? '休' : '班'}</Text>
          </View>
        ) : null}

        {/* 公历数字（今天=实心圆） */}
        {isToday ? (
          <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: token.colorPrimary }}>
            <Text style={{ fontSize: token.fontSize, fontWeight: '700', color: token.colorTextLightSolid, lineHeight: token.fontSize * 1.3 }}>{info.d}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: numColor, lineHeight: token.fontSizeLG * 1.25 }}>{info.d}</Text>
        )}

        {/* 农历 / 节气 / 节日 */}
        <Text numberOfLines={1} style={{ fontSize: token.fontSizeSM, color: subColor, maxWidth: 62 }}>{info.sub}</Text>
      </View>
    </Pressable>
  );
}

/* ────────────────────────── 宜/忌彩色块 ────────────────────────── */
function YiJiBlock(props: { kind: 'yi' | 'ji'; items: string[] }): React.ReactElement {
  const { token } = useToken();
  const isYi = props.kind === 'yi';
  const c = isYi ? token.colorSuccess : token.colorError;
  return (
    <View style={{ flexDirection: 'row', gap: token.marginSM, borderRadius: token.borderRadiusLG, padding: token.paddingXS, backgroundColor: fade(c, 0.07) }}>
      <View style={{ width: 30, height: 30, borderRadius: token.borderRadius, alignItems: 'center', justifyContent: 'center', backgroundColor: c }}>
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: '#fff', lineHeight: token.fontSizeLG * 1.2 }}>{isYi ? '宜' : '忌'}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', alignContent: 'center', gap: token.marginXXS }}>
        {props.items.length ? props.items.map((t, i) => (
          <Text key={i} style={{ fontSize: token.fontSizeSM, color: c, paddingHorizontal: 6, paddingVertical: 1, borderRadius: token.borderRadiusSM, backgroundColor: fade(c, 0.12) }}>{t}</Text>
        )) : (<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>诸事不宜</Text>)}
      </View>
    </View>
  );
}

/* ────────────────────────── 方位三柱 ────────────────────────── */
function PositionCol(props: { label: string; value: string; color: string }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 2, paddingVertical: token.paddingXS, borderRadius: token.borderRadius, backgroundColor: fade(props.color, 0.08) }}>
      {/* <Icon name="compass" size={token.fontSize} color={props.color} /> */}
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{props.label}</Text>
      <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: props.color }}>{props.value}</Text>
    </View>
  );
}

/* ────────────────────────── 右侧：老黄历日卡 ────────────────────────── */
function DetailPanel(props: { info: DayInfo }): React.ReactElement {
  const { token } = useToken();
  const { info } = props;
  const gz = [
    { k: '年', v: info.ganZhiYear },
    { k: '月', v: info.ganZhiMonth },
    { k: '日', v: info.ganZhiDay },
  ];
  return (
    <View style={{ backgroundColor: token.colorBgContainer, borderWidth: 1, borderColor: token.colorBorderSecondary, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
      {/* 卡头：日期 */}
      <View style={{ padding: token.padding, gap: token.marginXS, backgroundColor: fade(token.colorPrimary, 0.05), borderBottomWidth: 1, borderBottomColor: token.colorBorderSecondary }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: token.marginXS, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>{String(info.m).padStart(2, '0')}月{String(info.d).padStart(2, '0')}日</Text>
          <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>{info.y}年</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>星期{WEEK_HEAD[info.week] === '日' ? '天' : WEEK_HEAD[info.week]} · {info.xingZuo}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorPrimary }}>{info.ganZhiYear}【{info.shengXiao}】年 {info.lunarMonthCn}{info.lunarDayCn}</Text>
        </View>
        {(info.festivals.length || info.jieqi || info.holidayName) ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXXS }}>
            {info.jieqi ? <Tag color="success">{info.jieqi}</Tag> : null}
            {info.festivals.map((f) => (<Tag key={f} color="error">{f}</Tag>))}
            {info.holidayName && info.holidayName !== info.festival ? <Tag color="processing">{info.holidayName}</Tag> : null}
          </View>
        ) : null}
      </View>

      <View style={{ padding: token.padding, gap: token.margin }}>
        {/* 干支三柱 */}
        <View style={{ flexDirection: 'row', gap: token.marginXS }}>
          {gz.map((g) => (
            <View key={g.k} style={{ flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: token.paddingXS, borderRadius: token.borderRadius, backgroundColor: fade(token.colorPrimary, 0.06), gap: 2 }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{g.k}柱</Text>
              <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText, letterSpacing: 2 }}>{g.v}</Text>
            </View>
          ))}
        </View>

        {/* 宜 / 忌 */}
        <View style={{ gap: token.marginXS }}>
          <YiJiBlock kind="yi" items={info.yi} />
          <YiJiBlock kind="ji" items={info.ji} />
        </View>

        {/* 财神 / 喜神 / 福神 方位 */}
        <View style={{ gap: token.marginXXS }}>
          <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorTextSecondary }}>今日吉神方位</Text>
          <View style={{ flexDirection: 'row', gap: token.marginXS }}>
            <PositionCol label="财神" value={info.caiXi} color={token.colorWarning} />
            <PositionCol label="喜神" value={info.xiShen} color={token.colorError} />
            <PositionCol label="福神" value={info.fuShen} color={token.colorSuccess} />
          </View>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>阳贵 {info.yangGui} · 阴贵 {info.yinGui}</Text>
        </View>

        <Divider style={{ marginVertical: 2 }} />

        {/* 结构化条目 */}
        <View style={{ gap: token.marginXXS }}>
          <InfoRow label="值神"><View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.tianShen}</Text><Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: info.tianShenLuck === '凶' ? token.colorError : token.colorSuccess }}>{info.tianShenLuck}</Text></View></InfoRow>
          <InfoRow label="吉神宜趋"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.jiShen.join(' · ') || '—'}</Text></InfoRow>
          <InfoRow label="凶煞宜忌"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.xiongSha.join(' · ') || '—'}</Text></InfoRow>
          <InfoRow label="冲煞"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>冲（{info.chong}）</Text></InfoRow>
          <InfoRow label="五行"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.wuXing} · 纳音 {info.naYin}</Text></InfoRow>
          <InfoRow label="建星"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.zhiXing}日（十二建星）</Text></InfoRow>
          <InfoRow label="廿八宿"><View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.xiu}</Text><Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: info.xiuLuck === '凶' ? token.colorError : token.colorSuccess }}>{info.xiuLuck}</Text></View></InfoRow>
          <InfoRow label="六曜"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.liuYao}</Text></InfoRow>
          <InfoRow label="物候"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.wuHou}</Text></InfoRow>
          <InfoRow label="日禄"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.dayLu}</Text></InfoRow>
          <InfoRow label="胎神"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.taiShen}</Text></InfoRow>
          <InfoRow label="九星"><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.nineStar} · 旬空 {info.xunKong}</Text></InfoRow>
          <InfoRow label="月相"><View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}><Icon name={info.lunarDayNum >= 15 || info.lunarDayNum === 1 ? 'moon' : 'sun'} size={token.fontSizeSM} color={token.colorTextSecondary} /><Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{info.phase}</Text></View></InfoRow>
          <InfoRow label="彭祖"><Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, lineHeight: token.fontSizeSM * 1.5 }}>{info.pengZuGan}；{info.pengZuZhi}</Text></InfoRow>
        </View>
      </View>
    </View>
  );
}

/* ────────────────────────── 本月概览（节气 / 节日） ────────────────────────── */
function MonthDigest(props: { year: number; month: number }): React.ReactElement {
  const { token } = useToken();
  const dim = new Date(props.year, props.month, 0).getDate();
  const jqs: { d: number; name: string }[] = [];
  const fes: { d: number; name: string }[] = [];
  for (let d = 1; d <= dim; d++) {
    const info = getDayInfo(props.year, props.month, d);
    if (info.jieqi) jqs.push({ d, name: info.jieqi });
    if (info.festival) fes.push({ d, name: info.festival });
  }
  const Chip = (p: { d: number; name: string; color: string }): React.ReactElement => (
    <View key={`${p.d}-${p.name}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: token.borderRadiusSM, backgroundColor: fade(p.color, 0.1) }}>
      <Text style={{ fontSize: token.fontSizeSM, color: p.color, fontWeight: '600' }}>{p.d}日</Text>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{p.name}</Text>
    </View>
  );
  return (
    <View style={{ gap: token.margin }}>
      <View style={{ gap: token.marginXS }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
          <Icon name="sun" size={token.fontSizeSM} color={token.colorSuccess} />
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>本月节气</Text>
        </View>
        {jqs.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>{jqs.map((x) => <Chip key={x.d} d={x.d} name={x.name} color={token.colorSuccess} />)}</View>
        ) : (<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>本月无节气交接</Text>)}
      </View>
      <View style={{ gap: token.marginXS }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
          <Icon name="gift" size={token.fontSizeSM} color={token.colorError} />
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>本月节日</Text>
        </View>
        {fes.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>{fes.map((x) => <Chip key={x.d} d={x.d} name={x.name} color={token.colorError} />)}</View>
        ) : (<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>本月无节日</Text>)}
      </View>
    </View>
  );
}

/* ────────────────────────── 择吉 ────────────────────────── */
const ZERI_ACTIVITIES = ['嫁娶', '入宅', '搬家', '开业', '交易', '出行', '祭祀', '动土', '安床', '求医'];

function findAuspicious(activity: string, from: { y: number; m: number; d: number }, count = 5): DayInfo[] {
  const res: DayInfo[] = [];
  let cur = Solar.fromYmd(from.y, from.m, from.d).nextDay(1);
  for (let i = 0; i < 180 && res.length < count; i++) {
    const info = getDayInfo(cur.getYear(), cur.getMonth(), cur.getDay());
    if (info.yi.includes(activity)) res.push(info);
    cur = cur.nextDay(1);
  }
  return res;
}

function ZeJiCard(props: { today: { y: number; m: number; d: number } }): React.ReactElement {
  const { token } = useToken();
  const [act, setAct] = React.useState(ZERI_ACTIVITIES[0]);
  const list = React.useMemo(() => findAuspicious(act, props.today), [act, props.today.y, props.today.m, props.today.d]);
  return (
    <View style={{ backgroundColor: token.colorBgContainer, borderWidth: 1, borderColor: token.colorBorderSecondary, borderRadius: token.borderRadiusLG, padding: token.padding, gap: token.marginSM }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
        <Icon name="star" size={token.fontSize} color={token.colorWarning} />
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>择吉 · 最近宜「{act}」</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXXS }}>
        {ZERI_ACTIVITIES.map((a) => {
          const on = a === act;
          return (
            <Pressable key={a} onPress={(): void => setAct(a)} style={{ cursor: 'pointer' }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: token.borderRadiusSM, borderWidth: 1, borderColor: on ? token.colorPrimary : token.colorBorderSecondary, backgroundColor: on ? fade(token.colorPrimary, 0.1) : 'transparent' }}>
                <Text style={{ fontSize: token.fontSizeSM, color: on ? token.colorPrimary : token.colorTextSecondary }}>{a}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Divider style={{ marginVertical: 2 }} />
      {list.length ? list.map((x) => (
        <View key={`${x.y}-${x.m}-${x.d}`} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Text style={{ width: 88, fontSize: token.fontSize, fontWeight: '600', color: token.colorText, flexShrink: 0 }}>{x.m}月{x.d}日</Text>
          <Text style={{ width: 36, fontSize: token.fontSizeSM, color: token.colorTextSecondary, flexShrink: 0 }}>周{WEEK_HEAD[x.week] === '日' ? '天' : WEEK_HEAD[x.week]}</Text>
          <Text style={{ flex: 1, minWidth: 0, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{x.lunarMonthCn}{x.lunarDayCn}</Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorPrimary, flexShrink: 0 }}>{x.ganZhiDay}日</Text>
        </View>
      )) : (<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>近半年无合适吉日</Text>)}
    </View>
  );
}

/* ────────────────────────── 农历生日（以选中日为准） ────────────────────────── */
function nextLunarBirthday(lunarMonthNum: number, lunarDayNum: number, today: { y: number; m: number; d: number }): { info: DayInfo; days: number } | null {
  const todaySolar = Solar.fromYmd(today.y, today.m, today.d);
  const lunarYear = todaySolar.getLunar().getYear();
  for (let yy = lunarYear; yy <= lunarYear + 1; yy++) {
    let solar: Solar | null = null;
    try { solar = Lunar.fromYmd(yy, lunarMonthNum, lunarDayNum).getSolar(); } catch { continue; }
    if (!solar || solar.isBefore(todaySolar)) continue;
    const days = solar.subtract(todaySolar);
    return { info: getDayInfo(solar.getYear(), solar.getMonth(), solar.getDay()), days };
  }
  return null;
}

function BirthdayCard(props: { sel: DayInfo; today: { y: number; m: number; d: number } }): React.ReactElement {
  const { token } = useToken();
  const next = React.useMemo(
    () => nextLunarBirthday(props.sel.lunarMonthNum, props.sel.lunarDayNum, props.today),
    [props.sel.lunarMonthNum, props.sel.lunarDayNum, props.today.y, props.today.m, props.today.d],
  );
  return (
    <View style={{ backgroundColor: token.colorBgContainer, borderWidth: 1, borderColor: token.colorBorderSecondary, borderRadius: token.borderRadiusLG, padding: token.padding, gap: token.marginSM }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
        <Icon name="heart" size={token.fontSize} color={token.colorError} />
        <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>农历生日 · {props.sel.lunarMonthCn}{props.sel.lunarDayCn}</Text>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>以选中日的农历为准，推算下一次农历生日</Text>
      {next ? (
        <View style={{ gap: token.marginXS }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: token.marginSM, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorPrimary }}>{next.info.m}月{next.info.d}日</Text>
            <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>周{WEEK_HEAD[next.info.week] === '日' ? '天' : WEEK_HEAD[next.info.week]} · {next.info.y}年</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, flexWrap: 'wrap' }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: token.borderRadiusSM, backgroundColor: fade(token.colorError, 0.12) }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorError, fontWeight: '600' }}>还有 {next.days} 天</Text>
            </View>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{next.info.ganZhiYear}（{next.info.shengXiao}）年 · {next.info.ganZhiDay}日</Text>
          </View>
          <Text numberOfLines={2} style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, lineHeight: token.fontSizeSM * 1.5 }}>当日宜：{next.info.yi.slice(0, 8).join(' · ') || '—'}</Text>
        </View>
      ) : (<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>该农历日近年无对应公历（闰月/三十差异）</Text>)}
    </View>
  );
}

/* ────────────────────────── 主体 ────────────────────────── */
function NavBtn(props: { icon: string; onPress: () => void }): React.ReactElement {
  const { token } = useToken();
  return (
    <Pressable onPress={props.onPress} style={{ cursor: 'pointer' }}>
      <View style={{ width: 26, height: 26, borderRadius: token.borderRadiusSM, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={props.icon} size={token.fontSizeSM} color={token.colorTextSecondary} />
      </View>
    </Pressable>
  );
}

export function AlmanacDemo(): React.ReactElement {
  const { token } = useToken();
  const now = new Date();
  const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  const [cursor, setCursor] = React.useState({ y: today.y, m: today.m });
  const [sel, setSel] = React.useState({ y: today.y, m: today.m, d: today.d });

  const weeks = React.useMemo(() => buildMonth(cursor.y, cursor.m), [cursor.y, cursor.m]);
  const selInfo = getDayInfo(sel.y, sel.m, sel.d);
  const monthFirst = getDayInfo(cursor.y, cursor.m, 1);
  // 下一节气倒计时
  const todaySolar = Solar.fromYmd(today.y, today.m, today.d);
  const nextJie = todaySolar.getLunar().getNextJieQi();
  const nextJieName = nextJie ? nextJie.getName() : null;
  const nextJieDays = nextJie ? nextJie.getSolar().subtract(todaySolar) : 0;

  const shift = (delta: number): void => {
    let y = cursor.y; let m = cursor.m + delta;
    if (m < 1) { m = 12; y -= 1; } else if (m > 12) { m = 1; y += 1; }
    setCursor({ y, m });
  };
  const shiftYear = (delta: number): void => setCursor({ y: cursor.y + delta, m: cursor.m });
  const goToday = (): void => { setCursor({ y: today.y, m: today.m }); setSel({ y: today.y, m: today.m, d: today.d }); };
  const pick = (y: number, m: number, d: number): void => {
    setSel({ y, m, d });
    if (m !== cursor.m || y !== cursor.y) setCursor({ y, m });
  };

  return (
    <View style={{ gap: token.marginLG }}>
      {/* 产品化标题栏 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, flexWrap: 'wrap' }}>
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: token.marginXS }}>
            <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>{cursor.y} 年 {cursor.m} 月</Text>
            <Icon name="calendar" size={token.fontSize} color={token.colorPrimary} />
          </View>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
            农历{monthFirst.ganZhiYear}【{monthFirst.shengXiao}】年 · {monthFirst.lunarMonthCn} · 万年历 Almanac{nextJieName ? ` · 距「${nextJieName}」还有 ${nextJieDays} 天` : ''}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        {/* 分段翻页条 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: token.borderRadiusLG, backgroundColor: fade(token.colorTextBase ?? token.colorText, 0.05), padding: 2 }}>
          <NavBtn icon="arrowLeft" onPress={(): void => shiftYear(-1)} />
          <NavBtn icon="left" onPress={(): void => shift(-1)} />
          <View style={{ width: 1, height: 16, backgroundColor: token.colorBorderSecondary, marginHorizontal: 2 }} />
          <NavBtn icon="right" onPress={(): void => shift(1)} />
          <NavBtn icon="arrowRight" onPress={(): void => shiftYear(1)} />
        </View>
        <View style={{ flexShrink: 0 }}>
          <Button size="small" icon={<Icon name="target" />} onPress={goToday}>今天</Button>
        </View>
      </View>

      {/* 主区：左（月历 + 择吉/农历生日）+ 右详情 */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: token.margin }}>
        {/* 左：月历，其下并排择吉 & 农历生日 */}
        <View style={{ flex: 3, minWidth: 0, gap: token.margin }}>
          <View style={{ backgroundColor: token.colorBgContainer, borderWidth: 1, borderColor: token.colorBorderSecondary, borderRadius: token.borderRadiusLG, padding: token.padding }}>
            {/* 星期头 */}
            <View style={{ marginBottom: token.marginXXS }}>
              <View style={{ flexDirection: 'row' }}>
                {WEEK_HEAD.map((w, i) => (
                  <View key={w} style={{ flex: 1, alignItems: 'center', paddingVertical: token.paddingXS }}>
                    <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: i === 0 || i === 6 ? token.colorError : token.colorTextSecondary }}>{w}</Text>
                  </View>
                ))}
              </View>
            </View>
            {/* 栅格 */}
            <View style={{ gap: 4 }}>
              {weeks.map((wk, wi) => (
                <View key={wi} style={{ flexDirection: 'row', gap: 4 }}>
                  {wk.map((c) => (
                    <DayCell key={`${c.info.y}-${c.info.m}-${c.info.d}`} cell={c} today={today} sel={sel} onPick={pick} />
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* 择吉 & 农历生日（移到日历下方，纵向堆叠避开 wrap+flex:1 塔陷） */}
          <View style={{ gap: token.margin }}>
            <ZeJiCard today={today} />
            <BirthdayCard sel={selInfo} today={today} />
          </View>
        </View>

        {/* 右：选中日老黄历 + 本月概览（移到黄历卡下方，节气/节日分两行） */}
        <View style={{ flex: 2, minWidth: 0, gap: token.margin }}>
          <DetailPanel info={selInfo} />
          <View style={{ backgroundColor: token.colorBgContainer, borderWidth: 1, borderColor: token.colorBorderSecondary, borderRadius: token.borderRadiusLG, padding: token.padding }}>
            <MonthDigest year={cursor.y} month={cursor.m} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default AlmanacDemo;
