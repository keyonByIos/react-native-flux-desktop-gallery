// RESULT：状态结果页。success/error/info/warning 四态 + HTTP 404/403/500 + 自定义图标 + 附加内容。
import React from 'react';
import { Result, Button, Space, Card, Descriptions, Icon, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

function SuccessResult(): React.ReactElement {
  return (
    <Result
      status="success"
      title="提交成功"
      subTitle="订单号 200001118 × 2，将在 30 分钟内发货"
      extra={
        <Space size="small">
          <Button type="primary">查看详情</Button>
          <Button>继续购物</Button>
        </Space>
      }
    />
  );
}

function WithContent(): React.ReactElement {
  const { token } = useToken();
  return (
    <Result status="info" title="信息已提交" subTitle="客服将在 1 个工作日内联系你">
      <Card style={{ maxWidth: 460, alignSelf: 'center' }}>
        <Descriptions
          column={1}
          items={[
            { label: '联系人', children: '张三' },
            { label: '联系电话', children: '138****8888' },
            { label: '提交时间', children: '2026-09-26 10:30' },
          ]}
        />
      </Card>
      <View style={{ alignItems: 'center', marginTop: token.marginLG }}>
        <Button type="primary">返回首页</Button>
      </View>
    </Result>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '成功',
    desc: "status='success' + extra 操作",
    node: <SuccessResult />,
    code: [
      'import { Result, Button, Space } from "react-native-flux-desktop";',
      '',
      '<Result',
      '  status="success"',
      '  title="提交成功"',
      '  subTitle="订单号 200001118 × 2，将在 30 分钟内发货"',
      '  extra={',
      '    <Space size="small">',
      '      <Button type="primary">查看详情</Button>',
      '      <Button>继续购物</Button>',
      '    </Space>',
      '  }',
      '/>',
    ].join('\n'),
  },
  {
    name: '失败',
    desc: "status='error'",
    node: <Result status="error" title="提交失败" subTitle="请检查并修改以下信息后重试" />,
    code: [
      '<Result status="error" title="提交失败" subTitle="请检查并修改以下信息后重试" />',
    ].join('\n'),
  },
  {
    name: '信息',
    desc: "status='info'",
    node: <Result status="info" title="这是一条通知" subTitle="辅助说明文本，用于补充细节" />,
    code: [
      '<Result status="info" title="这是一条通知" subTitle="辅助说明文本，用于补充细节" />',
    ].join('\n'),
  },
  {
    name: '警告',
    desc: "status='warning'",
    node: <Result status="warning" title="请注意" subTitle="当前操作存在一定风险" />,
    code: [
      '<Result status="warning" title="请注意" subTitle="当前操作存在一定风险" />',
    ].join('\n'),
  },
  {
    name: '带附加内容',
    desc: 'children 承载详情区块',
    node: <WithContent />,
    code: [
      '// children：在标题下方放任意详情区块（Card / Descriptions 等）',
      '<Result status="info" title="信息已提交" subTitle="客服将在 1 个工作日内联系你">',
      '  <Card style={{ maxWidth: 460, alignSelf: \'center\' }}>',
      '    <Descriptions column={1} items={[{ label: \'联系人\', children: \'张三\' }]} />',
      '  </Card>',
      '</Result>',
    ].join('\n'),
  },
  {
    name: 'HTTP 状态',
    desc: "status='404' / '403' / '500'",
    node: (
      <Space direction="vertical" size={0} style={{ width: '100%' }}>
        <Result status="404" />
        <Result status="403" />
        <Result status="500" extra={<Button type="primary">返回上一页</Button>} />
      </Space>
    ),
    code: [
      '// 内置 HTTP 状态页（自带大字号与默认文案）',
      '<Result status="404" />',
      '<Result status="403" />',
      '<Result status="500" extra={<Button type="primary">返回上一页</Button>} />',
    ].join('\n'),
  },
  {
    name: '自定义图标',
    desc: 'icon 覆盖状态默认图标',
    node: (
      <Result
        title="收藏成功"
        subTitle="已加入你的收藏夹"
        icon={<Icon name="heart" size={56} color="#eb2f96" strokeWidth={1.5} />}
      />
    ),
    code: [
      'import { Result, Icon } from "react-native-flux-desktop";',
      '',
      '// icon 覆盖状态默认图标',
      '<Result',
      '  title="收藏成功"',
      '  subTitle="已加入你的收藏夹"',
      '  icon={<Icon name="heart" size={56} color="#eb2f96" strokeWidth={1.5} />}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'status', desc: '结果状态', type: "'success'|'error'|'info'|'warning'|'404'|'403'|'500'", default: "'info'" },
  { name: 'title', desc: '标题', type: 'ReactNode', default: '–' },
  { name: 'subTitle', desc: '副标题', type: 'ReactNode', default: '–' },
  { name: 'icon', desc: '自定义图标', type: 'ReactNode', default: '–' },
  { name: 'extra', desc: '操作区', type: 'ReactNode', default: '–' },
  { name: 'children', desc: '附加内容', type: 'ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSuccess', desc: 'success 图标色', default: '#52c41a' },
  { name: 'colorError', desc: 'error 图标色', default: '#ff4d4f' },
  { name: 'colorWarning', desc: 'warning 图标色', default: '#faad14' },
  { name: 'iconFontSize', desc: '图标尺寸（组件 token）', default: '72' },
];

export function ResultDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
