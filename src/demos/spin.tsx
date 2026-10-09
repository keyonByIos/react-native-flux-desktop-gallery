// SPIN：加载中指示器。弧线绕心旋转 / 三尺寸 / tip / 自定义指示器 / 包裹内容遮罩态 / 受控开关。
import React from 'react';
import { Spin, View, Card, Text, Space, Button, Icon, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

function Sizes(): React.ReactElement {
  const { token } = useToken();
  return (
    <Space size={token.marginLG} align="center">
      <Spin size="small" />
      <Spin />
      <Spin size="large" />
    </Space>
  );
}

function Nested(): React.ReactElement {
  const { token } = useToken();
  return (
    <Card style={{ padding: token.paddingLG }}>
      <Spin tip="加载中…">
        <View style={{ height: token.controlHeightLG * 3, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: token.fontSize, color: token.colorText, textAlign: 'center' }}>
            这段内容在加载态下会被遮罩变暗，指示器居中浮现。
          </Text>
        </View>
      </Spin>
    </Card>
  );
}

function Controlled(): React.ReactElement {
  const { token } = useToken();
  const [spinning, setSpinning] = React.useState(true);
  return (
    <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
      <Button type="primary" onPress={() => setSpinning((v) => !v)}>
        {spinning ? '停止' : '开始'}加载
      </Button>
      <Card style={{ padding: token.paddingLG }}>
        <Spin spinning={spinning}>
          <View style={{ height: token.controlHeightLG * 2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: token.fontSize, color: token.colorText }}>受控 spinning 内容区</Text>
          </View>
        </Spin>
      </Card>
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '三种尺寸',
    desc: 'size small / default / large',
    node: <Sizes />,
    code: [
      'import { Spin } from "react-native-flux-desktop";',
      '',
      '<Spin size="small" />',
      '<Spin />            // default',
      '<Spin size="large" />',
    ].join('\n'),
  },
  {
    name: '带提示文字',
    desc: 'tip 位于指示器下方',
    node: <Spin tip="加载中…" />,
    code: ['<Spin tip="加载中…" />'].join('\n'),
  },
  {
    name: '自定义指示器',
    desc: 'indicator 传入任意节点',
    node: <Spin indicator={<Icon name="sync" size={24} color="#1677ff" animate="spin" />} />,
    code: [
      'import { Spin, Icon } from "react-native-flux-desktop";',
      '',
      '// indicator 传入任意节点（这里用带 spin 动画的 Icon）',
      '<Spin indicator={<Icon name="sync" size={24} color="#1677ff" animate="spin" />} />',
    ].join('\n'),
  },
  {
    name: '包裹内容',
    desc: '内容变暗 + 指示器居中覆盖',
    node: <Nested />,
    code: [
      '// 传 children → 内容变暗、指示器居中覆盖（遮罩态）',
      '<Spin tip="加载中…">',
      '  <View style={{ height: 120 }}>{/* 被包裹的内容 */}</View>',
      '</Spin>',
    ].join('\n'),
  },
  {
    name: '受控开关',
    desc: 'spinning 切换加载态',
    node: <Controlled />,
    code: [
      '// spinning 受控：为 false 时直接显示 children、不转',
      'const [spinning, setSpinning] = React.useState(true);',
      '<Button type="primary" onPress={() => setSpinning((v) => !v)}>',
      '  {spinning ? \'停止\' : \'开始\'}加载',
      '</Button>',
      '<Spin spinning={spinning}>',
      '  <View style={{ height: 64 }}>受控 spinning 内容区</View>',
      '</Spin>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'spinning', desc: '是否旋转', type: 'boolean', default: 'true' },
  { name: 'size', desc: '尺寸', type: "'small'|'default'|'large'", default: "'default'" },
  { name: 'tip', desc: '提示文字', type: 'ReactNode', default: '–' },
  { name: 'indicator', desc: '自定义指示器', type: 'ReactNode', default: '旋转弧线' },
  { name: 'children', desc: '包裹内容（遮罩态）', type: 'ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary', desc: '弧线颜色', default: '主色' },
  { name: 'controlHeightSM', desc: 'small 尺寸', default: '24' },
  { name: 'controlHeight', desc: 'default 尺寸', default: '32' },
  { name: 'controlHeightLG', desc: 'large 尺寸', default: '40' },
];

export function SpinDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
