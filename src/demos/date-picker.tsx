// DATEPICKER：日期选择。统一走 DemoPage 多段式，覆盖 基础 / 尺寸 / 校验状态 / 禁用日期 / 弹出方向 / 受控。
import React from 'react';
import { DatePicker, View, Text, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 受控：日期回显到外部 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [d, setD] = React.useState<Date | undefined>(new Date());
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
      <DatePicker value={d} onChange={setD} allowClear />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>
        已选：{d ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` : '未选'}
      </Text>
    </View>
  );
}

/** 禁用日期：过去不可选（常驻展开便于展示灰显） */
function DisabledDateDemo(): React.ReactElement {
  const today = new Date();
  return (
    <View style={{}}>
      <DatePicker
        defaultValue={today}
        disabledDate={(c) => c.getTime() < today.getTime()}
      />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '点触发器弹出日历面板，选日即收起；allowClear 可清除',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <DatePicker placeholder="请选择日期" />
        <DatePicker defaultValue={new Date()} allowClear />
        <DatePicker defaultValue={new Date()} disabled />
      </View>
    ),
    code: [
      'import { DatePicker, View } from "react-native-flux-desktop";',
      '',
      '// 点触发器弹出日历面板，选日即收起；allowClear 可清除',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <DatePicker placeholder="请选择日期" />',
      '  <DatePicker defaultValue={new Date()} allowClear />',
      '  <DatePicker defaultValue={new Date()} disabled />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = large / middle / small',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <DatePicker defaultValue={new Date()} size="large" />
        <DatePicker defaultValue={new Date()} size="middle" />
        <DatePicker defaultValue={new Date()} size="small" />
      </View>
    ),
    code: [
      'import { DatePicker, View } from "react-native-flux-desktop";',
      '',
      '// size = large / middle / small',
      '<View style={{ flexDirection: \'row\', alignItems: \'flex-end\', gap: 24 }}>',
      '  <DatePicker defaultValue={new Date()} size="large" />',
      '  <DatePicker defaultValue={new Date()} size="middle" />',
      '  <DatePicker defaultValue={new Date()} size="small" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '校验状态',
    desc: 'status = error / warning，触发器描红 / 黄边',
    node: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <DatePicker defaultValue={new Date()} status="error" />
        <DatePicker defaultValue={new Date()} status="warning" />
      </View>
    ),
    code: [
      'import { DatePicker, View } from "react-native-flux-desktop";',
      '',
      '// status = error / warning，触发器描红 / 黄边',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <DatePicker defaultValue={new Date()} status="error" />',
      '  <DatePicker defaultValue={new Date()} status="warning" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '禁用日期',
    desc: 'disabledDate 让过去的日期灰显不可选（此段常驻展开）',
    node: <DisabledDateDemo />,
    code: [
      'import { DatePicker } from "react-native-flux-desktop";',
      '',
      '// disabledDate 让过去的日期灰显不可选',
      'const today = new Date();',
      '<DatePicker defaultValue={today} disabledDate={(c) => c.getTime() < today.getTime()} />',
    ].join('\n'),
  },
  {
    name: '弹出方向',
    desc: 'placement = bottomRight / topLeft / topRight',
    node: (
      <View style={{ flexDirection: 'row', gap: 24, paddingTop: 340 }}>
        <DatePicker defaultValue={new Date()} placement="bottomRight" />
        <DatePicker defaultValue={new Date()} placement="topLeft" />
        <DatePicker defaultValue={new Date()} placement="topRight" />
      </View>
    ),
    code: [
      'import { DatePicker, View } from "react-native-flux-desktop";',
      '',
      '// placement = bottomRight / topLeft / topRight',
      '<View style={{ flexDirection: \'row\', gap: 24 }}>',
      '  <DatePicker defaultValue={new Date()} placement="bottomRight" />',
      '  <DatePicker defaultValue={new Date()} placement="topLeft" />',
      '  <DatePicker defaultValue={new Date()} placement="topRight" />',
      '</View>',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'value + onChange，日期回显外部',
    node: <ControlledDemo />,
    code: [
      'import { DatePicker } from "react-native-flux-desktop";',
      '',
      '// value + onChange，日期回显外部',
      'const [d, setD] = useState<Date | undefined>(new Date());',
      '<DatePicker value={d} onChange={setD} allowClear />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value / defaultValue', desc: '受控 / 非受控日期', type: 'Date', default: '–' },
  { name: 'placeholder', desc: '未选占位符', type: 'string', default: "'请选择日期'" },
  { name: 'size', desc: '触发器尺寸', type: "'large'|'middle'|'small'", default: "'middle'" },
  { name: 'status', desc: '校验状态', type: "'error' | 'warning'", default: '–' },
  { name: 'placement', desc: '弹出方向', type: "'bottomLeft'|'bottomRight'|'topLeft'|'topRight'", default: "'bottomLeft'" },
  { name: 'disabledDate', desc: '禁用日期判定', type: '(current) => boolean', default: '–' },
  { name: 'allowClear', desc: '允许清除', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'open', desc: '面板常驻展开（嵌入场景）', type: 'boolean', default: '–' },
  { name: 'onChange', desc: '选日 / 清除回调（清除回传 undefined）', type: '(date?) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: '触发器高度（middle）', default: '32' },
  { name: 'colorPrimary', desc: '聚焦描边 / 选中格底色', default: '主色' },
  { name: 'colorError', desc: 'error 状态描边', default: '错误红' },
];

export function DatePickerDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
