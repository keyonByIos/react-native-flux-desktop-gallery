// QRCODE demo：DemoPage 多段式（基础 / 尺寸配色 / 中心 logo / 状态 / 自定义遮罩 / 无边框）。
import React from 'react';
import { QRCode, Space, Button, Icon, Text } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 失效可刷新（受控 status 演示） */
function ExpiredDemo(): React.ReactElement {
  const [status, setStatus] = React.useState<'active' | 'expired'>('expired');
  return (
    <Space direction="vertical" align="center" size={12}>
      <QRCode value="flux-refresh-demo" status={status} onRefresh={() => setStatus('active')} />
      <Button size="small" onPress={() => setStatus('expired')}>
        置为失效
      </Button>
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'value 映射为稳定的类 QR 矩阵图案',
    node: <QRCode value="https://flux.ui/getting-started" />,
    code: [
      'import { QRCode } from "react-native-flux-desktop";',
      '',
      '// value 映射为稳定的类 QR 矩阵图案',
      '<QRCode value="https://flux.ui/getting-started" />',
    ].join('\n'),
  },
  {
    name: '尺寸与配色',
    desc: 'size 控制边长；color / bgColor 自定义前景背景',
    node: (
      <Space size="large" align="start" wrap>
        <QRCode value="FLUX-SMALL" size={120} />
        <QRCode value="FLUX-PRIMARY" size={140} color="#1677ff" />
        <QRCode value="FLUX-DARK" size={140} color="#f0f0f0" bgColor="#141414" />
      </Space>
    ),
    code: [
      'import { QRCode, Space } from "react-native-flux-desktop";',
      '',
      '// size 控制边长；color / bgColor 自定义前景背景',
      '<Space size="large" align="start" wrap>',
      '  <QRCode value="FLUX-SMALL" size={120} />',
      '  <QRCode value="FLUX-PRIMARY" size={140} color="#1677ff" />',
      '  <QRCode value="FLUX-DARK" size={140} color="#f0f0f0" bgColor="#141414" />',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '中心 logo',
    desc: 'icon 叠加中心徽标；iconSize 控制其占位尺寸',
    node: (
      <Space size="large" align="start" wrap>
        <QRCode value="flux-logo-1" icon={<Icon name="check" size={20} color="#52c41a" />} />
        <QRCode value="flux-logo-2" size={160} iconSize={40} icon={<Icon name="database" size={32} color="#1677ff" />} />
      </Space>
    ),
    code: [
      'import { QRCode, Space, Icon } from "react-native-flux-desktop";',
      '',
      '// icon 叠加中心徽标；iconSize 控制其占位尺寸',
      '<Space size="large" align="start" wrap>',
      '  <QRCode value="flux-logo-1" icon={<Icon name="check" size={20} color="#52c41a" />} />',
      '  <QRCode value="flux-logo-2" size={160} iconSize={40} icon={<Icon name="database" size={32} />} />',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '状态',
    desc: 'status：loading / scanned / expired',
    node: (
      <Space size="large" align="start" wrap>
        <QRCode value="loading" status="loading" />
        <QRCode value="scanned" status="scanned" />
        <ExpiredDemo />
      </Space>
    ),
    code: [
      'import { QRCode, Space } from "react-native-flux-desktop";',
      '',
      '// status：loading / scanned / expired，expired 可配 onRefresh',
      '<Space size="large" align="start" wrap>',
      '  <QRCode value="loading" status="loading" />',
      '  <QRCode value="scanned" status="scanned" />',
      '  <QRCode value="x" status="expired" onRefresh={() => setStatus(\'active\')} />',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '自定义遮罩',
    desc: 'statusRender 接管状态区域渲染',
    node: (
      <QRCode
        value="custom-status"
        status="expired"
        statusRender={({ onRefresh }) => (
          <Space direction="vertical" align="center" size={8}>
            <Text style={{ fontSize: 13 }}>已过期</Text>
            <Button size="small" type="primary" onPress={onRefresh}>
              点击刷新
            </Button>
          </Space>
        )}
      />
    ),
    code: [
      'import { QRCode, Space, Button, Text } from "react-native-flux-desktop";',
      '',
      '// statusRender 接管状态区域渲染',
      '<QRCode',
      '  value="custom-status"',
      '  status="expired"',
      '  statusRender={({ onRefresh }) => (',
      '    <Space direction="vertical" align="center" size={8}>',
      '      <Text style={{ fontSize: 13 }}>已过期</Text>',
      '      <Button size="small" type="primary" onPress={onRefresh}>点击刷新</Button>',
      '    </Space>',
      '  )}',
      '/>',
    ].join('\n'),
  },
  {
    name: '无边框',
    desc: 'bordered=false 去掉外描边',
    node: <QRCode value="no-border" bordered={false} />,
    code: [
      'import { QRCode } from "react-native-flux-desktop";',
      '',
      '// bordered=false 去掉外描边',
      '<QRCode value="no-border" bordered={false} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'value', desc: '编码内容（决定图案）', type: 'string', default: "''" },
  { name: 'type', desc: '渲染方式（本实现为矢量 path）', type: "'svg'", default: "'svg'" },
  { name: 'size', desc: '边长（px）', type: 'number', default: 'controlHeightLG×4' },
  { name: 'color / bgColor', desc: '前景 / 背景色', type: 'string', default: 'colorText / colorBgContainer' },
  { name: 'bordered', desc: '是否显示边框', type: 'boolean', default: 'true' },
  { name: 'status', desc: '状态', type: "'active' | 'expired' | 'loading' | 'scanned'", default: "'active'" },
  { name: 'icon / iconSize', desc: '中心 logo 及尺寸', type: 'ReactNode / number', default: '–' },
  { name: 'onRefresh', desc: '失效点击刷新', type: '() => void', default: '–' },
  { name: 'statusRender', desc: '自定义状态遮罩', type: '(info) => ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorText', desc: '默认前景色', default: '主文本色' },
  { name: 'colorBgContainer', desc: '默认背景色', default: '容器底色' },
  { name: 'borderRadiusLG', desc: '外框圆角', default: '8' },
];

export function QRCodeDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
