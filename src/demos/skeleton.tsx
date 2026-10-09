// SKELETON：加载占位（头像 + 标题 + 正文行），active 呼吸脉冲；含 Avatar/Button/Input/Image 元素变体。
import React from 'react';
import { Skeleton, Space, Text, Button, Card, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

function LoadingToggle(): React.ReactElement {
  const { token } = useToken();
  const [loading, setLoading] = React.useState(true);
  return (
    <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
      <Button type="primary" onPress={() => setLoading((v) => !v)}>
        {loading ? '加载完成' : '重新加载'}
      </Button>
      <Skeleton loading={loading} active avatar>
        <Card>
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>真实内容已加载完成，此处为 children 的实际渲染。</Text>
        </Card>
      </Skeleton>
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基本',
    desc: '头像 + 标题 + 3 行正文',
    node: <Skeleton />,
    code: ['import { Skeleton } from "react-native-flux-desktop";', '', '// 默认：头像 + 标题 + 3 行正文占位', '<Skeleton />'].join('\n'),
  },
  {
    name: '动效',
    desc: 'active 呼吸脉冲',
    node: <Skeleton active />,
    code: ['// active：占位块呼吸脉冲动画', '<Skeleton active />'].join('\n'),
  },
  {
    name: '无头像',
    desc: 'avatar=false',
    node: <Skeleton active avatar={false} paragraph={2} />,
    code: ['// avatar=false 去掉头像占位；paragraph 控制正文行数', '<Skeleton active avatar={false} paragraph={2} />'].join('\n'),
  },
  {
    name: '无标题',
    desc: 'title=false',
    node: <Skeleton active title={false} paragraph={4} />,
    code: ['<Skeleton active title={false} paragraph={4} />'].join('\n'),
  },
  {
    name: '自定义行数',
    desc: 'paragraph 支持数字或 { rows }',
    node: <Skeleton active paragraph={{ rows: 5 }} />,
    code: ['// paragraph 支持数字或 { rows }', '<Skeleton active paragraph={{ rows: 5 }} />'].join('\n'),
  },
  {
    name: '加载完成切换',
    desc: 'loading=false 渲染 children',
    node: <LoadingToggle />,
    code: [
      '// loading=true 显占位；false 则渲染 children',
      'const [loading, setLoading] = React.useState(true);',
      '<Button type="primary" onPress={() => setLoading((v) => !v)}>',
      '  {loading ? \'加载完成\' : \'重新加载\'}',
      '</Button>',
      '<Skeleton loading={loading} active avatar>',
      '  <Card>真实内容（loading=false 时才渲染）</Card>',
      '</Skeleton>',
    ].join('\n'),
  },
  {
    name: '元素变体',
    desc: 'Avatar / Button / Input / Image',
    node: (
      <Space size="small" align="center" wrap>
        <Skeleton.Avatar active size={40} />
        <Skeleton.Avatar active shape="square" size={40} />
        <Skeleton.Button active />
        <Skeleton.Button active size="large" />
        <Skeleton.Input active />
        <Skeleton.Image active />
      </Space>
    ),
    code: [
      '// 子组件：Avatar / Button / Input / Image 占位变体',
      '<Skeleton.Avatar active size={40} />',
      '<Skeleton.Avatar active shape="square" size={40} />',
      '<Skeleton.Button active />',
      '<Skeleton.Button active size="large" />',
      '<Skeleton.Input active />',
      '<Skeleton.Image active />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'loading', desc: '是否显示占位', type: 'boolean', default: 'true' },
  { name: 'active', desc: '呼吸动画', type: 'boolean', default: 'false' },
  { name: 'avatar', desc: '显示头像占位', type: 'boolean', default: 'true' },
  { name: 'title', desc: '显示标题占位', type: 'boolean', default: 'true' },
  { name: 'paragraph', desc: '正文行数', type: 'number | { rows }', default: '3' },
  { name: 'children', desc: 'loading=false 时渲染', type: 'ReactNode', default: '–' },
  { name: 'Skeleton.Avatar', desc: '头像变体', type: '{ shape, size }', default: '–' },
  { name: 'Skeleton.Button / Input', desc: '控件变体', type: '{ size }', default: '–' },
  { name: 'Skeleton.Image', desc: '图片占位变体', type: '–', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'gradientFromColor', desc: '占位块底色（组件 token）', default: '浅灰' },
  { name: 'controlHeightLG', desc: '头像尺寸基准', default: '40' },
  { name: 'borderRadius', desc: '占位块圆角', default: '6' },
];

export function SkeletonDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
