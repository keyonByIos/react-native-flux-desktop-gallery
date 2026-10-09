// ALERT demo：DemoPage 多段式（四种类型 / 带描述 / 图标 / 可关闭 / 自定义图标 / 关闭文字 / 操作区 / banner）。
import React from 'react';
import { Alert, Space, Button, Icon } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const DEMOS: DemoItem[] = [
  {
    name: '四种类型',
    desc: 'success / info / warning / error 语义配色',
    node: (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Alert type="success" message="成功提示 Success" showIcon />
        <Alert type="info" message="信息提示 Info" showIcon />
        <Alert type="warning" message="警告提示 Warning" showIcon />
        <Alert type="error" message="错误提示 Error" showIcon />
      </Space>
    ),
    code: [
      'import { Alert } from "react-native-flux-desktop";',
      '',
      '// type：success / info / warning / error 四种语义色',
      '<Alert type="success" message="成功提示 Success" showIcon />',
      '<Alert type="info"    message="信息提示 Info"    showIcon />',
      '<Alert type="warning" message="警告提示 Warning" showIcon />',
      '<Alert type="error"   message="错误提示 Error"   showIcon />',
    ].join('\n'),
  },
  {
    name: '带描述',
    desc: 'description 补充细节，颜色取 colorTextSecondary',
    node: (
      <Alert
        type="success"
        showIcon
        message="带描述的提醒"
        description="描述文字用于补充细节，随主题换皮。"
      />
    ),
    code: [
      '// message 标题 + description 描述（次要色）',
      '<Alert',
      '  type="success"',
      '  showIcon',
      '  message="带描述的提醒"',
      '  description="描述文字用于补充细节，随主题换皮。"',
      '/>',
    ].join('\n'),
  },
  {
    name: '无图标',
    desc: '不传 showIcon 时仅文字',
    node: <Alert type="warning" message="这是一条不带图标的警告提示" />,
    code: [
      '// 不传 showIcon 则仅文字，无左侧图标',
      '<Alert type="warning" message="这是一条不带图标的警告提示" />',
    ].join('\n'),
  },
  {
    name: '可关闭',
    desc: 'closable 右侧 × 关闭，淡出后卸载',
    node: <Alert type="info" showIcon closable message="可关闭" description="点右侧叉号隐藏这条提醒。" />,
    code: [
      '// closable 右侧出 × ；onClose 可监听关闭',
      '<Alert',
      '  type="info"',
      '  showIcon',
      '  closable',
      '  message="可关闭"',
      '  description="点右侧叉号隐藏这条提醒。"',
      '  onClose={() => console.log(\'closed\')}',
      '/>',
    ].join('\n'),
  },
  {
    name: '自定义图标',
    desc: 'icon 覆盖默认语义图标',
    node: <Alert type="info" showIcon icon={<Icon name="gift" size={16} color="#1677ff" />} message="自定义图标的提示" />,
    code: [
      'import { Alert, Icon } from "react-native-flux-desktop";',
      '',
      '// icon 覆盖默认语义图标（需配合 showIcon）',
      '<Alert',
      '  type="info"',
      '  showIcon',
      '  icon={<Icon name="gift" size={16} color="#1677ff" />}',
      '  message="自定义图标的提示"',
      '/>',
    ].join('\n'),
  },
  {
    name: '关闭文字',
    desc: 'closeText 用文字代替 ×',
    node: <Alert type="error" showIcon closable closeText="关闭" message="带关闭文字的提示" />,
    code: [
      '// closeText：用文字按钮代替默认的 ×',
      '<Alert type="error" showIcon closable closeText="关闭" message="带关闭文字的提示" />',
    ].join('\n'),
  },
  {
    name: '操作区',
    desc: 'action 右侧放置按钮等操作',
    node: (
      <Alert
        type="warning"
        showIcon
        message="需要确认"
        action={<Button size="small" type="primary">去处理</Button>}
      />
    ),
    code: [
      'import { Alert, Button } from "react-native-flux-desktop";',
      '',
      '// action：右侧放操作区（按钮等）',
      '<Alert',
      '  type="warning"',
      '  showIcon',
      '  message="需要确认"',
      '  action={<Button size="small" type="primary">去处理</Button>}',
      '/>',
    ].join('\n'),
  },
  {
    name: 'Banner',
    desc: 'banner 通栏形态，无圆角无边框',
    node: <Alert type="info" banner showIcon message="顶部通告条 banner 形态：无圆角无边框。" />,
    code: [
      '// banner：通栏告警，无圆角无边框，适合页面顶部通告',
      '<Alert type="info" banner showIcon message="顶部通告条 banner 形态" />',
    ].join('\n'),
  },
  {
    name: '滚动文本',
    desc: 'marquee：message 超宽时横向循环滚动（窄容器演示）',
    node: (
      <Alert
        type="info"
        showIcon
        marquee
        style={{ width: 280 }}
        message="这是一条很长的通知文本，超出容器宽度后会从右向左循环滚动展示，适合通告栏空间有限但文字较长的场景。"
      />
    ),
    code: [
      '// marquee：纯文本 message 超宽时从右向左循环滚动（marqueeSpeed 控速 px/秒）',
      '<Alert',
      '  type="info"',
      '  showIcon',
      '  marquee',
      '  style={{ width: 280 }}',
      '  message="这是一条很长的通知文本，超出容器宽度后会循环滚动展示。"',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'type', desc: '语义类型', type: "'success'|'info'|'warning'|'error'", default: "'info'" },
  { name: 'message', desc: '标题', type: 'ReactNode', default: '–' },
  { name: 'description', desc: '描述', type: 'ReactNode', default: '–' },
  { name: 'showIcon', desc: '显示图标', type: 'boolean', default: 'false' },
  { name: 'icon', desc: '自定义图标', type: 'ReactNode', default: '–' },
  { name: 'closable', desc: '可关闭', type: 'boolean', default: 'false' },
  { name: 'closeText', desc: '关闭文字', type: 'ReactNode', default: '–' },
  { name: 'action', desc: '右侧操作区', type: 'ReactNode', default: '–' },
  { name: 'banner', desc: '通栏形态', type: 'boolean', default: 'false' },
  { name: 'marquee', desc: '长文本横向滚动（仅纯文本 message）', type: 'boolean', default: 'false' },
  { name: 'marqueeSpeed', desc: '滚动速度 px/秒', type: 'number', default: '50' },
  { name: 'onClose', desc: '关闭回调', type: '() => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSuccessBg / Border / Text', desc: 'success 三件套', default: '语义派生' },
  { name: 'colorInfoBg / WarningBg / ErrorBg', desc: '各类型底色', default: '语义派生' },
  { name: 'colorTextSecondary', desc: '描述文字色', default: '二级文本' },
];

export function AlertDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
