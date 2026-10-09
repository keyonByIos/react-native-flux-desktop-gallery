// PROGRESS：线性 / 环形 / 仪表盘。对齐 antd v5：steps 分格 / success 叠加 / gapDegree 缺口 / format 自定义。
import React from 'react';
import { Progress, Space, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const BLUE = '#1677ff';

function LineDemos(): React.ReactElement {
  const { token } = useToken();
  return (
    <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
      <View style={{ width: '100%' }}>
        <Progress percent={62} />
      </View>
      <Progress percent={100} />
      <Progress percent={40} status="exception" />
      <Progress percent={76} status="active" />
    </Space>
  );
}

function Sizes(): React.ReactElement {
  const { token } = useToken();
  return (
    <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
      <Progress percent={30} size="small" />
      <Progress percent={80} size="large" />
      <Progress percent={55} showInfo={false} />
    </Space>
  );
}

function Steps(): React.ReactElement {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Progress percent={66} steps={10} />
      <Progress percent={40} steps={20} strokeColor={BLUE} />
    </Space>
  );
}

function Success(): React.ReactElement {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Progress percent={80} success={{ percent: 30 }} />
      <Progress percent={50} success={{ percent: 50 }} />
    </Space>
  );
}

function Circles(): React.ReactElement {
  const { token } = useToken();
  return (
    <Space size="large" align="center" wrap>
      <Progress type="circle" percent={75} />
      <Progress type="circle" percent={100} status="success" />
      <Progress type="circle" percent={45} status="exception" />
      <Progress type="circle" percent={60} width={90} strokeWidth={6} strokeColor={token.colorInfo} />
    </Space>
  );
}

function Dashboards(): React.ReactElement {
  return (
    <Space size="large" align="center" wrap>
      <Progress type="dashboard" percent={70} />
      <Progress type="dashboard" percent={92} width={90} format={(p) => `${p}分`} />
      <Progress type="dashboard" percent={55} gapDegree={120} />
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '线性进度条',
    desc: 'status 语义色 · active 呼吸',
    node: <LineDemos />,
    code: [
      'import { Progress } from "react-native-flux-desktop";',
      '',
      '<Progress percent={62} />',
      '<Progress percent={100} />                 // 100% 自动转 success',
      '<Progress percent={40} status="exception" /> // 失败态转红',
      '<Progress percent={76} status="active" />    // 呼吸动效',
    ].join('\n'),
  },
  {
    name: '尺寸 / 隐藏文字',
    desc: 'size small / large · showInfo=false',
    node: <Sizes />,
    code: [
      '<Progress percent={30} size="small" />',
      '<Progress percent={80} size="large" />',
      '<Progress percent={55} showInfo={false} />  // 不显示右侧百分比',
    ].join('\n'),
  },
  {
    name: '分格进度条',
    desc: 'steps 拆分为等宽色块',
    node: <Steps />,
    code: [
      '// steps：拆成等宽色块（仅 line）',
      '<Progress percent={66} steps={10} />',
      '<Progress percent={40} steps={20} strokeColor="#1677ff" />',
    ].join('\n'),
  },
  {
    name: '分段进度',
    desc: 'success 已完成部分绿色叠加',
    node: <Success />,
    code: [
      '// success：已完成分段以绿色叠加在主进度上',
      '<Progress percent={80} success={{ percent: 30 }} />',
    ].join('\n'),
  },
  {
    name: '环形进度条',
    desc: 'type=circle · 自定义宽高与色',
    node: <Circles />,
    code: [
      '<Progress type="circle" percent={75} />',
      '<Progress type="circle" percent={100} status="success" />',
      '<Progress type="circle" percent={45} status="exception" />',
      '// width 直径 / strokeWidth 线宽 / strokeColor 前景色',
      '<Progress type="circle" percent={60} width={90} strokeWidth={6} strokeColor="#1677ff" />',
    ].join('\n'),
  },
  {
    name: '仪表盘',
    desc: 'type=dashboard · gapDegree 缺口 · format',
    node: <Dashboards />,
    code: [
      '<Progress type="dashboard" percent={70} />',
      '// format 自定义中心文本',
      '<Progress type="dashboard" percent={92} width={90} format={(p) => `${p}分`} />',
      '// gapDegree 自定义缺口角度',
      '<Progress type="dashboard" percent={55} gapDegree={120} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'type', desc: '进度条类型', type: "'line'|'circle'|'dashboard'", default: "'line'" },
  { name: 'percent', desc: '百分比进度', type: 'number', default: '0' },
  { name: 'status', desc: '状态', type: "'normal'|'success'|'exception'|'active'", default: "'normal'" },
  { name: 'steps', desc: '分格数（line）', type: 'number', default: '–' },
  { name: 'success', desc: '已完成分段（line）', type: '{ percent, strokeColor }', default: '–' },
  { name: 'gapDegree / gapPosition', desc: '仪表盘缺口', type: 'number / 方位', default: '75 / bottom' },
  { name: 'format', desc: '自定义文本', type: '(percent) => ReactNode', default: '–' },
  { name: 'strokeColor / trailColor', desc: '前景 / 轨道色', type: 'string', default: 'token 派生' },
  { name: 'size', desc: 'line 粗细档', type: "'small'|'default'|'large'", default: "'default'" },
  { name: 'width / strokeWidth', desc: '环形直径 / 线宽', type: 'number', default: '120 / 自动' },
  { name: 'showInfo', desc: '显示百分比文字', type: 'boolean', default: 'true' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary', desc: 'normal 前景色', default: '主色' },
  { name: 'colorSuccess', desc: 'success / 100% 色', default: '#52c41a' },
  { name: 'colorError', desc: 'exception 色', default: '#ff4d4f' },
  { name: 'remainingColor', desc: '轨道底色（组件 token）', default: '浅灰' },
];

export function ProgressDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
