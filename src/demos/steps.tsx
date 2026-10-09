// STEPS：步骤条。统一走 DemoPage 多段式，覆盖 antd v5 基础 / 迷你 / 点状 / 竖向 / 标题在下 / 自定义图标 / 可点击 / 错误。
import React from 'react';
import { Steps, View, Text, useToken, Icon, type StepItem } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const BASE: StepItem[] = [
  { key: 's1', title: '填写信息', description: '账户与基本资料' },
  { key: 's2', title: '确认订单', description: '核对商品与金额' },
  { key: 's3', title: '完成', description: '下单成功' },
];

/** 可点击：current 由外部 state 驱动 */
function ClickableDemo(): React.ReactElement {
  const { token } = useToken();
  const [cur, setCur] = React.useState(1);
  return (
    <View>
      <Steps current={cur} items={BASE} onChange={setCur} />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: token.marginXS }}>
        点击任意步骤可跳转，当前第 {cur + 1} 步
      </Text>
    </View>
  );
}

/** 自定义图标：icon 传任意 ReactNode */
function IconDemo(): React.ReactElement {
  const { token } = useToken();
  const items: StepItem[] = [
    { key: 'c1', title: '开始', description: '初始化任务', icon: <Icon name="check" size={20} color={token.colorPrimary} /> },
    { key: 'c2', title: '上传', description: '传输文件中', icon: <Icon name="upload" size={20} color={token.colorPrimary} /> },
    { key: 'c3', title: '报表', description: '等待生成', icon: <Icon name="pieChart" size={20} color={token.colorTextQuaternary} /> },
  ];
  return <Steps current={1} items={items} />;
}

/** 连接线定制：实/虚/点线型 + 颜色/粗细/留白 */
function LineDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View>
      <Steps current={1} items={BASE} line={{ style: 'dashed', width: 2, gap: 12 }} />
      <View style={{ height: token.marginLG }} />
      <Steps
        current={1}
        items={BASE}
        line={{ style: 'dotted', width: 3, color: token.colorBorder, activeColor: token.colorSuccess, gap: 10 }}
      />
      <View style={{ height: token.marginLG }} />
      <Steps
        current={1}
        items={BASE}
        line={{ style: 'solid', width: 4, color: token.colorFill, activeColor: token.colorPrimary, gap: 16 }}
      />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '三步流程，当前进行到第二步',
    node: <Steps current={1} items={BASE} />,
    code: [
      'import { Steps } from "react-native-flux-desktop";',
      '',
      "const items = [",
      "  { key: 's1', title: '填写信息', description: '账户与基本资料' },",
      "  { key: 's2', title: '确认订单', description: '核对商品与金额' },",
      "  { key: 's3', title: '完成', description: '下单成功' },",
      '];',
      '// current 从 0 开始（当前第二步）',
      '<Steps current={1} items={items} />',
    ].join('\n'),
  },
  {
    name: '迷你',
    desc: 'size=small，适合紧凑区域',
    node: <Steps size="small" current={1} items={BASE} />,
    code: ['// size=small 紧凑区域', '<Steps size="small" current={1} items={items} />'].join('\n'),
  },
  {
    name: '点状',
    desc: 'progressDot 以小圆点替代序号圆圈',
    node: <Steps progressDot current={1} items={BASE} />,
    code: ['// progressDot 以小圆点替代序号圆圈', '<Steps progressDot current={1} items={items} />'].join('\n'),
  },
  {
    name: '竖向',
    desc: 'direction=vertical，纵向排列',
    node: <Steps direction="vertical" current={1} items={BASE} />,
    code: ['// direction=vertical 纵向排列', '<Steps direction="vertical" current={1} items={items} />'].join('\n'),
  },
  {
    name: '标题在下',
    desc: 'labelPlacement=vertical，标题居中于圆点下方',
    node: (
      <Steps
        labelPlacement="vertical"
        current={1}
        items={[
          { key: 'v1', title: '注册', description: '创建账号' },
          { key: 'v2', title: '实名认证', description: '上传证件' },
          { key: 'v3', title: '绑定银行卡', description: '完成开户' },
          { key: 'v4', title: '开通成功', description: '' },
        ]}
      />
    ),
    code: [
      '// labelPlacement=vertical：标题居中于圆点下方',
      '<Steps labelPlacement="vertical" current={1} items={items} />',
    ].join('\n'),
  },
  {
    name: '自定义图标',
    desc: 'items[].icon 传任意 ReactNode',
    node: <IconDemo />,
    code: [
      '// items[].icon 传任意 ReactNode',
      '{ key: \'c2\', title: "上传", icon: <Icon name="upload" size={20} color={token.colorPrimary} /> }',
    ].join('\n'),
  },
  {
    name: '可点击',
    desc: 'onChange 受控跳转（readOnly=false 时生效）',
    node: <ClickableDemo />,
    code: [
      '// onChange 受控跳转（readOnly=false 时生效）',
      "const [cur, setCur] = React.useState(1);",
      '<Steps current={cur} items={items} onChange={setCur} />',
    ].join('\n'),
  },
  {
    name: '连接线定制',
    desc: 'line 配置线型（实/虚/点）/ 颜色 / 粗细 / 与节点留白',
    node: <LineDemo />,
    code: [
      '// line 配置线型 / 颜色 / 粗细 / 与节点留白',
      '<Steps',
      '  current={1}',
      '  items={items}',
      '  line={{ style: "dashed", width: 2, gap: 12 }}',
      '/>',
      "// style: 'solid' | 'dashed' | 'dotted'；activeColor 已过段颜色",
    ].join('\n'),
  },
  {
    name: '错误状态',
    desc: 'status=error，当前步骤标红',
    node: (
      <Steps
        current={1}
        status="error"
        items={[
          { key: 'e1', title: '支付', description: '已完成' },
          { key: 'e2', title: '发货', description: '发货失败，请重试' },
          { key: 'e3', title: '签收', description: '待处理' },
        ]}
      />
    ),
    code: [
      "// status='error'：当前步骤标红",
      '<Steps current={1} status="error" items={items} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'current', desc: '指定当前步骤（从 0 开始）', type: 'number', default: '0' },
  { name: 'initial', desc: '起始序号偏移', type: 'number', default: '0' },
  { name: 'items', desc: '步骤数据数组', type: 'StepItem[]', default: '[]' },
  { name: 'status', desc: '当前步骤状态', type: "'wait' | 'process' | 'finish' | 'error'", default: "'process'" },
  { name: 'size', desc: '步骤条大小', type: "'default' | 'small'", default: "'default'" },
  { name: 'direction', desc: '方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
  { name: 'labelPlacement', desc: '标题位置（横向时）', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
  { name: 'progressDot', desc: '点状步骤条', type: 'boolean', default: 'false' },
  { name: 'readOnly', desc: '只读，禁用点击', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '点击步骤回调', type: '(current) => void', default: '–' },
  { name: 'line', desc: '连接线外观：style(solid/dashed/dotted) / width / color / activeColor / gap', type: 'StepsLineConfig', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'iconSize', desc: '步骤圆点直径（default）', default: 'fontSize × 2' },
  { name: 'iconSizeSM', desc: '步骤圆点直径（small）', default: 'fontSize + 10' },
  { name: 'iconFontSize', desc: '圆点内序号字号', default: 'fontSizeLG' },
  { name: 'titleFontSize', desc: '步骤标题字号', default: 'fontSize' },
];

export function StepsDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
