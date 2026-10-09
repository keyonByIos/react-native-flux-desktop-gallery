// TIMEPICKER：时间选择。统一走 DemoPage 多段式，覆盖 基础 / 尺寸 / 校验状态 / 带秒 / 12小时制 / 步长 / 禁用 / 受控。
// 面板绝对定位覆盖，不占文档流；常驻展开段用固定高度容器预留空间。
import React from 'react';
import { TimePicker, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const DEF = new Date(1970, 0, 1, 9, 30, 0);

/** 受控：时间回显外部 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [d, setD] = React.useState<Date | undefined>(DEF);
  const fmt = (x?: Date): string => (x ? `${`${x.getHours()}`.padStart(2, '0')}:${`${x.getMinutes()}`.padStart(2, '0')}` : '未选');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
      <TimePicker value={d} onChange={setD} allowClear />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>当前：{fmt(d)}</Text>
    </View>
  );
}

/** 带秒：常驻展开显示三列 */
function SecondDemo(): React.ReactElement {
  return (
    <View style={{}}>
      <TimePicker defaultValue={new Date(1970, 0, 1, 9, 30, 45)} showSecond />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点触发器弹时 / 分两列点选，选完点空白收起；allowClear 可清除',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <TimePicker defaultValue={DEF} />
        <TimePicker placeholder="请选择时间" allowClear />
      </View>
    ),
    code: [
      'import { TimePicker } from "react-native-flux-desktop";',
      '',
      '// 点触发器弹时/分两列点选；allowClear 可清除',
      'const DEF = new Date(1970, 0, 1, 9, 30, 0);',
      '<TimePicker defaultValue={DEF} />',
      '<TimePicker placeholder="请选择时间" allowClear />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = large / middle / small',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <TimePicker defaultValue={DEF} size="large" />
        <TimePicker defaultValue={DEF} size="middle" />
        <TimePicker defaultValue={DEF} size="small" />
      </View>
    ),
    code: [
      'import { TimePicker } from "react-native-flux-desktop";',
      '',
      '// size = large / middle / small',
      '<TimePicker defaultValue={DEF} size="large" />',
      '<TimePicker defaultValue={DEF} size="small" />',
    ].join('\n'),
  },
  {
    name: '校验状态',
    desc: 'status = error / warning，描红 / 黄边',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <TimePicker defaultValue={DEF} status="error" />
        <TimePicker defaultValue={DEF} status="warning" />
      </View>
    ),
    code: [
      'import { TimePicker } from "react-native-flux-desktop";',
      '',
      '// status = error / warning 描红 / 黄边',
      '<TimePicker defaultValue={DEF} status="error" />',
      '<TimePicker defaultValue={DEF} status="warning" />',
    ].join('\n'),
  },
  {
    name: '带秒',
    desc: 'showSecond 追加秒列（此段常驻展开）',
    node: <SecondDemo />,
    code: [
      'import { TimePicker } from "react-native-flux-desktop";',
      '',
      '// showSecond 追加秒列',
      '<TimePicker defaultValue={new Date(1970, 0, 1, 9, 30, 45)} showSecond />',
    ].join('\n'),
  },
  {
    name: '12 小时制',
    desc: 'use12Hours 附上下午列，显示 1–12 + AM/PM',
    node: <TimePicker defaultValue={new Date(1970, 0, 1, 15, 20, 0)} use12Hours />,
    code: [
      'import { TimePicker } from "react-native-flux-desktop";',
      '',
      '// use12Hours 附上下午列，显示 1–12 + AM/PM',
      '<TimePicker defaultValue={new Date(1970, 0, 1, 15, 20, 0)} use12Hours />',
    ].join('\n'),
  },
  {
    name: '步长',
    desc: 'hourStep / minuteStep 控制列内间隔',
    node: <TimePicker defaultValue={DEF} hourStep={2} minuteStep={10} />,
    code: [
      'import { TimePicker } from "react-native-flux-desktop";',
      '',
      '// hourStep / minuteStep 控制列内间隔',
      '<TimePicker defaultValue={DEF} hourStep={2} minuteStep={10} />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 灰显不可点',
    node: <TimePicker defaultValue={DEF} disabled />,
    code: [
      'import { TimePicker } from "react-native-flux-desktop";',
      '',
      '// disabled 灰显不可点',
      '<TimePicker defaultValue={DEF} disabled />',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange，时间回显外部',
    node: <ControlledDemo />,
    code: [
      'import { TimePicker } from "react-native-flux-desktop";',
      '',
      '// 受控：value + onChange（清除回传 undefined）',
      'const [d, setD] = React.useState<Date>();',
      '<TimePicker value={d} onChange={setD} allowClear />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '受控 / 非受控时间', type: 'Date', default: '–' },
  { name: 'placeholder', desc: '未选占位符', type: 'string', default: "'请选择时间'" },
  { name: 'size', desc: '高度三档', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'status', desc: '校验状态', type: "'error' | 'warning'", default: '–' },
  { name: 'placement', desc: '弹出方向', type: "'bottomLeft'|'bottomRight'|'topLeft'|'topRight'", default: "'bottomLeft'" },
  { name: 'showSecond', desc: '显示秒列', type: 'boolean', default: 'false' },
  { name: 'use12Hours', desc: '12 小时制（上下午列）', type: 'boolean', default: 'false' },
  { name: 'hourStep / minuteStep / secondStep', desc: '各列间隔', type: 'number', default: '1' },
  { name: 'allowClear', desc: '允许清除', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '选时 / 清除回调（清除回传 undefined）', type: '(date?) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '触发器高度（middle）', default: '32' },
  { name: 'colorBgElevated', desc: '面板背景', default: '浮层底色' },
  { name: 'colorPrimary', desc: '选中项 / 聚焦描边', default: '主色' },
];

export function TimePickerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
