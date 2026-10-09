// CALENDAR：日历。统一走 DemoPage 多段式，覆盖 基础 / 自定义格内容 / 整格自定义 / 年历 / 限制选择 / 受控切换 / 时区。
import React from 'react';
import {
  Calendar,
  FluxProvider,
  type CalendarMode,
  type CalendarCellInfo,
  View,
  Text,
  useToken,
  useTimezone,
} from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const fmt = (x: Date): string => `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`;

/** 基础：受控选中 + 回显 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [d, setD] = React.useState<Date>(new Date());
  return (
    <View style={{ gap: token.marginSM }}>
      <Calendar value={d} onChange={setD} />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>已选：{fmt(d)}</Text>
    </View>
  );
}

// 有「日程」的日期（日号 → 角标色），演示 dateCellRender 追加内容
const EVENTS: Record<number, string> = { 3: '#1677ff', 9: '#52c41a', 16: '#fa8c16', 25: '#eb2f96' };

/** 自定义格内容：dateCellRender 在数字下方追加角标，选中/今天态由 info 传入 */
function CellRenderDemo(): React.ReactElement {
  const { token } = useToken();
  const [d, setD] = React.useState<Date>(new Date());
  const render = (info: CalendarCellInfo): React.ReactNode => {
    const color = EVENTS[info.day];
    if (!color) return null;
    return (
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: info.selected ? token.colorTextLightSolid : color,
        }}
      />
    );
  };
  return (
    <View style={{ gap: token.marginSM }}>
      <Calendar value={d} onChange={setD} dateCellRender={render} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        3 / 9 / 16 / 25 号下方有角标；选中格角标自动转成反白色（info.selected 传入渲染函数）
      </Text>
    </View>
  );
}

// 每日“营收”伪数据，演示整格自定义：选中与未选中明显不同的底色
function fakeAmount(day: number): number {
  return ((day * 37) % 9) * 120 + 260;
}

/** 整格自定义：dateFullCellRender 完全替换默认日期格，仍保持可点选 */
function FullCellDemo(): React.ReactElement {
  const { token } = useToken();
  const [d, setD] = React.useState<Date>(new Date());
  const render = (info: CalendarCellInfo): React.ReactNode => {
    const bg = info.selected
      ? token.colorPrimary
      : info.today
      ? token.colorPrimaryBg
      : token.colorFillQuaternary;
    const main = info.selected ? token.colorTextLightSolid : token.colorText;
    const sub = info.selected ? token.colorTextLightSolid : info.disabled ? token.colorTextQuaternary : token.colorTextTertiary;
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          borderRadius: token.borderRadius,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: info.disabled ? 0.4 : 1,
        }}
      >
        <Text style={{ fontSize: token.fontSizeSM, color: main, fontWeight: '600' }}>{info.day}</Text>
        <Text style={{ fontSize: 10, color: sub, marginTop: 1 }}>¥{fakeAmount(info.day)}</Text>
      </View>
    );
  };
  return (
    <View style={{ gap: token.marginSM }}>
      <Calendar value={d} onChange={setD} dateFullCellRender={render} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        每格显示日号 + 营收，选中走主色实底、今天浅底、未选中灰底（selected / today / disabled 均作参数传入）
      </Text>
    </View>
  );
}

/** 限制选择：validRange 区间 + disabledDate 禁周末，两栏并排 */
function RangeDemo(): React.ReactElement {
  const { token } = useToken();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 10);
  const end = new Date(now.getFullYear(), now.getMonth(), 20);
  const isWeekend = (x: Date): boolean => x.getDay() === 0 || x.getDay() === 6;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginLG, alignItems: 'flex-start' }}>
      <View style={{ gap: token.marginXS }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>validRange 10–20 号外禁用</Text>
        <Calendar validRange={[start, end]} defaultValue={start} />
      </View>
      <View style={{ gap: token.marginXS }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>disabledDate 禁周末</Text>
        <Calendar disabledDate={isWeekend} />
      </View>
    </View>
  );
}

/** 时区：并排两块，默认（上海）vs 嵌套 Provider 覆盖为纽约，「今天」高亮落在不同日 */
function TzBlock(props: { timezone: string; label: string }): React.ReactElement {
  const { token } = useToken();
  const tz = useTimezone();
  return (
    <View style={{ gap: token.marginXS }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        {props.label}（生效时区：{tz}）
      </Text>
      <Calendar />
    </View>
  );
}
function TimezoneDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginSM }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSize }}>
        全局 FluxProvider 未指定时，日期组件默认按 Asia/Shanghai 判定「今天」。下例右侧用嵌套 &lt;FluxProvider timezone="America/New_York"&gt; 覆盖，两块「今天」高亮可落在不同日历日。
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginLG, alignItems: 'flex-start' }}>
        <TzBlock timezone="Asia/Shanghai" label="默认 · 上海" />
        <FluxProvider timezone="America/New_York">
          <TzBlock timezone="America/New_York" label="覆盖 · 纽约" />
        </FluxProvider>
      </View>
    </View>
  );
}

/** 受控与切换：modeSwitch + onPanelChange 回显 */
function PanelDemo(): React.ReactElement {
  const { token } = useToken();
  const [panel, setPanel] = React.useState<Date>(new Date());
  const [mode, setMode] = React.useState<CalendarMode>('month');
  return (
    <View style={{ gap: token.marginSM }}>
      <Calendar modeSwitch defaultValue={panel} onPanelChange={(d, m) => { setPanel(d); setMode(m); }} />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>
        面板：{panel.getFullYear()} 年 {panel.getMonth() + 1} 月 · 模式：{mode === 'month' ? '月历' : '年历'}（点右上「选年 / 选月」切换）
      </Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点选日期，今天高亮、选中走主色；头部切换上/下月与「今天」',
    node: <BasicDemo />,
    code: [
      'import { Calendar } from "react-native-flux-desktop";',
      '',
      '// 受控选中，今天高亮、选中走主色',
      'const [d, setD] = useState<Date>(new Date());',
      '<Calendar value={d} onChange={setD} />',
    ].join('\n'),
  },
  {
    name: '自定义格内容 dateCellRender',
    desc: '保留默认数字，在格内追加角标 / 徽标',
    node: <CellRenderDemo />,
    code: [
      'import { Calendar } from "react-native-flux-desktop";',
      '',
      '// dateCellRender 在数字下方追加角标，info 传入选中/今天态',
      'const render = (info) => {',
      '  const color = EVENTS[info.day];',
      '  if (!color) return null;',
      '  return <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />;',
      '};',
      '',
      '<Calendar value={d} onChange={setD} dateCellRender={render} />',
    ].join('\n'),
  },
  {
    name: '整格自定义 dateFullCellRender',
    desc: '完全替换日期格，按选中 / 今天 / 禁用分别呈现',
    node: <FullCellDemo />,
    code: [
      'import { Calendar } from "react-native-flux-desktop";',
      '',
      '// dateFullCellRender 完全替换默认日期格，仍保持可点选',
      'const render = (info) => (',
      '  <View style={{ backgroundColor: info.selected ? token.colorPrimary : token.colorFillQuaternary }}>',
      '    <Text>{info.day}</Text>',
      '  </View>',
      ');',
      '',
      '<Calendar value={d} onChange={setD} dateFullCellRender={render} />',
    ].join('\n'),
  },
  {
    name: '年历模式',
    desc: "mode = 'year' 展示 12 个月网格，点月份进入该月",
    node: <Calendar mode="year" defaultValue={new Date()} />,
    code: [
      'import { Calendar } from "react-native-flux-desktop";',
      '',
      '// mode=year 展示 12 个月网格，点月份进入该月',
      '<Calendar mode="year" defaultValue={new Date()} />',
    ].join('\n'),
  },
  {
    name: '限制选择',
    desc: 'validRange 限定区间 / disabledDate 逐日禁用，禁用格灰显不可点',
    node: <RangeDemo />,
    code: [
      'import { Calendar } from "react-native-flux-desktop";',
      '',
      '// validRange 限定可选区间',
      '<Calendar validRange={[start, end]} defaultValue={start} />',
      '',
      '// disabledDate 逐日禁用（示例：禁周末）',
      'const isWeekend = (x) => x.getDay() === 0 || x.getDay() === 6;',
      '<Calendar disabledDate={isWeekend} />',
    ].join('\n'),
  },
  {
    name: '时区',
    desc: '默认按上海判定「今天」，可用嵌套 FluxProvider timezone 覆盖',
    node: <TimezoneDemo />,
    code: [
      'import { Calendar, FluxProvider } from "react-native-flux-desktop";',
      '',
      '// 默认按 Asia/Shanghai 判定「今天」',
      '<Calendar />',
      '',
      '// 嵌套 FluxProvider timezone 覆盖时区',
      '<FluxProvider timezone="America/New_York">',
      '  <Calendar />',
      '</FluxProvider>',
    ].join('\n'),
  },
  {
    name: '受控与切换',
    desc: 'modeSwitch 头部月/年切换 + onPanelChange 回显面板状态',
    node: <PanelDemo />,
    code: [
      'import { Calendar } from "react-native-flux-desktop";',
      '',
      '// modeSwitch 显示月/年切换按钮，onPanelChange 回显面板状态',
      '<Calendar',
      '  modeSwitch',
      '  defaultValue={panel}',
      '  onPanelChange={(d, m) => { setPanel(d); setMode(m); }}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '受控 / 非受控选中日期', type: 'Date', default: '–' },
  { name: 'mode', desc: '展示模式', type: "'month' | 'year'", default: "'month'" },
  { name: 'modeSwitch', desc: '头部显示月/年切换按钮', type: 'boolean', default: 'false' },
  { name: 'validRange', desc: '可选区间 [起, 止]', type: '[Date, Date]', default: '–' },
  { name: 'disabledDate', desc: '逐日禁用判定', type: '(current) => boolean', default: '–' },
  { name: 'dateCellRender', desc: '格内追加内容（保留默认数字）', type: '(info) => ReactNode', default: '–' },
  { name: 'dateFullCellRender', desc: '整格自定义渲染（替换默认格）', type: '(info) => ReactNode', default: '–' },
  { name: 'onChange', desc: '选中日期变化', type: '(date) => void', default: '–' },
  { name: 'onPanelChange', desc: '面板日期 / 模式变化', type: '(date, mode) => void', default: '–' },
  { name: 'info (CellInfo)', desc: '渲染函数入参：日期与状态', type: '{ date, year, month, day, selected, today, disabled }', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeightLG', desc: '日期格基准尺寸', default: '40' },
  { name: 'colorPrimary', desc: '选中格底色', default: '主色' },
  { name: 'colorPrimaryBg', desc: '今天格底色', default: '主色浅底' },
];

export function CalendarDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
