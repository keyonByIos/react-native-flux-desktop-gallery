// cases/calendar-schedule.tsx —— 「日程日历 Calendar & Schedule」案例。
// 左：Calendar 月历（dateCellRender 在含日程的日期下方打彩色点，选中日走主色），下方本周概览。
// 右：选中日的议程时间线（Timeline 自定义 dot + 分类色）+ 事件卡片列表（时间 / 标题 / 地点 / 分类标签）。
// 秀能力：Calendar（dateCellRender + 受控切换）+ Timeline（彩色节点 + label）+ Tag 分类 + 明暗 token 自适应。
import React from 'react';
import {
  View,
  Text,
  Tag,
  Icon,
  Calendar,
  Timeline,
  useToken,
  type CalendarCellInfo,
} from 'react-native-flux-desktop';

type FluxToken = ReturnType<typeof useToken>['token'];

interface Ev {
  time: string;
  title: string;
  place: string;
  cat: '会议' | '工作' | '个人' | '学习';
}

const CAT_PRESET: Record<Ev['cat'], string> = {
  会议: 'blue',
  工作: 'green',
  个人: 'orange',
  学习: 'purple',
};
const CAT_COLOR: Record<Ev['cat'], keyof FluxToken> = {
  会议: 'colorPrimary',
  工作: 'colorSuccess',
  个人: 'colorWarning',
  学习: 'colorPurple' as keyof FluxToken,
};

// 当前月内有日程的日期（日号 → 事件）
const EVENTS: Record<number, Ev[]> = {
  2: [{ time: '09:30', title: '产品周会', place: '会议室 A', cat: '会议' }, { time: '14:00', title: '需求评审', place: '线上 · 飞书', cat: '工作' }],
  5: [{ time: '10:00', title: '季度 OKR 对齐', place: '大会议室', cat: '会议' }, { time: '19:00', title: '健身房', place: 'Body Company', cat: '个人' }],
  9: [{ time: '11:00', title: '与设计组走查', place: '会议室 B', cat: '工作' }, { time: '15:30', title: '客户演示', place: '线上 · Zoom', cat: '会议' }, { time: '20:00', title: 'React 性能进阶', place: '极客时间', cat: '学习' }],
  12: [{ time: '09:00', title: '晨会 · 迭代计划', place: '工位区', cat: '会议' }, { time: '13:30', title: '虚拟化模块开发', place: '专注时段', cat: '工作' }, { time: '16:00', title: 'Code Review', place: '线上', cat: '工作' }, { time: '18:30', title: '与家人晚餐', place: '家里', cat: '个人' }],
  15: [{ time: '10:30', title: '技术分享：Skia 渲染管线', place: '报告厅', cat: '学习' }, { time: '14:00', title: '1:1 沟通', place: '小会议室', cat: '会议' }],
  18: [{ time: '09:30', title: '上线评审', place: '会议室 A', cat: '会议' }, { time: '15:00', title: '缺陷修复', place: '专注时段', cat: '工作' }],
  22: [{ time: '11:00', title: '招聘面试', place: '会议室 C', cat: '工作' }, { time: '20:00', title: '读书《设计数据密集型》', place: '线上', cat: '学习' }],
  27: [{ time: '10:00', title: '月度复盘', place: '大会议室', cat: '会议' }, { time: '14:30', title: '体检', place: '美年大健康', cat: '个人' }],
};

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function AgendaCard(props: { ev: Ev; token: FluxToken; last: boolean }): React.ReactElement {
  const { token } = props;
  const color = (token[CAT_COLOR[props.ev.cat]] as string) ?? token.colorPrimary;
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: token.marginSM,
        padding: token.paddingSM,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorFillQuaternary,
      }}
    >
      <View style={{ width: 3, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 52 }}>
        <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{props.ev.time}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={{ fontSize: token.fontSize, fontWeight: '500', color: token.colorText }} numberOfLines={1}>{props.ev.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
          <Icon name="folder" size={11} color={token.colorTextTertiary} />
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }} numberOfLines={1}>{props.ev.place}</Text>
        </View>
      </View>
      <Tag color={CAT_PRESET[props.ev.cat]}>{props.ev.cat}</Tag>
    </View>
  );
}

export function CalendarScheduleDemo(): React.ReactElement {
  const { token } = useToken();
  const now = new Date();
  const [d, setD] = React.useState<Date>(new Date(now.getFullYear(), now.getMonth(), 12));

  const day = d.getDate();
  const evs = EVENTS[day] ?? [];
  const sorted = [...evs].sort((a, b) => a.time.localeCompare(b.time));
  const busyDays = Object.keys(EVENTS).map(Number);

  const renderCell = (info: CalendarCellInfo): React.ReactNode => {
    if (!busyDays.includes(info.day)) return null;
    const items = EVENTS[info.day];
    const first = items[0];
    return (
      <View style={{ flexDirection: 'row', gap: 2, marginTop: 1 }}>
        {items.slice(0, 3).map((e, i) => (
          <View
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: info.selected ? token.colorTextLightSolid : ((token[CAT_COLOR[e.cat]] as string) ?? token.colorPrimary),
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', padding: token.paddingLG, gap: token.marginLG, backgroundColor: token.colorBgLayout }}>
      {/* 左：月历 */}
      <View style={{ width: 380, flexShrink: 0, gap: token.margin }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Icon name="calendar" size={18} color={token.colorPrimary} />
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>日程</Text>
        </View>
        <View style={{ borderRadius: token.borderRadiusLG, borderWidth: token.lineWidth, borderColor: token.colorBorderSecondary, backgroundColor: token.colorBgContainer, padding: token.paddingSM }}>
          <Calendar value={d} onChange={setD} dateCellRender={renderCell} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginSM }}>
          {(Object.keys(CAT_PRESET) as Ev['cat'][]).map((c) => (
            <View key={c} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: (token[CAT_COLOR[c]] as string) ?? token.colorPrimary }} />
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 右：当日议程 */}
      <View style={{ flex: 1, minWidth: 0, gap: token.margin }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: token.marginSM }}>
          <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>{d.getMonth() + 1} 月 {day} 日</Text>
          <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>{WEEK[d.getDay()]}</Text>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{evs.length} 个日程</Text>
        </View>

        {sorted.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: token.marginSM }}>
            <Icon name="calendar" size={48} color={token.colorTextQuaternary} />
            <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>这一天暂无安排</Text>
          </View>
        ) : (
          <View style={{ flex: 1, minHeight: 0, gap: token.margin }}>
            <View style={{ flexDirection: 'row', gap: token.marginLG }}>
              <View style={{ width: 150 }}>
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorTextSecondary, marginBottom: token.marginXS }}>时间线</Text>
                <Timeline
                  items={sorted.map((e, i) => ({
                    key: i,
                    color: CAT_PRESET[e.cat] === 'blue' ? 'blue' : CAT_PRESET[e.cat] === 'green' ? 'green' : CAT_PRESET[e.cat] === 'orange' ? 'red' : 'gray',
                    children: <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{e.time}</Text>,
                  }))}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: token.marginXS }}>
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorTextSecondary, marginBottom: token.marginXS }}>安排详情</Text>
                {sorted.map((e, i) => (
                  <AgendaCard key={i} ev={e} token={token} last={i === sorted.length - 1} />
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
