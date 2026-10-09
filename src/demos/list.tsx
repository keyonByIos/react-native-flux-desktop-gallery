// LIST：数据列表。统一走 DemoPage 多段式，覆盖 基础 / 边框与尺寸 / 无分隔 / 水平布局 / 操作区 / 加载 / 加载更多。
import React from 'react';
import { List, Text, View, Avatar, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const SIMPLE = ['发布 v0.3.0 版本', '完成 Table 组件抓帧验证', '优化 painter 文本缓存', '调研浮层 z 栈方案'];

const PEOPLE = [
  { name: '王大锤', role: '前端工程师', desc: '负责渲染管线与组件库建设', color: '#1677ff' },
  { name: '李小龙', role: '后端工程师', desc: '服务端接口与数据库设计', color: '#52c41a' },
  { name: '张三丰', role: '产品设计师', desc: '交互与视觉规范制定', color: '#fa8c16' },
];

/** 基础 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <List
      header="待办事项"
      bordered
      style={{ maxWidth: 560 }}
      dataSource={SIMPLE}
      renderItem={(t) => <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{t}</Text>}
    />
  );
}

/** 边框与尺寸 */
function SizeDemo(): React.ReactElement {
  const { token } = useToken();
  const it = (t: string) => <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{t}</Text>;
  return (
    <View style={{ gap: 16, maxWidth: 560 }}>
      <List size="large" bordered dataSource={['large 尺寸 · 更宽松内边距一', 'large 尺寸二']} renderItem={it} />
      <List size="small" bordered dataSource={['small 尺寸 · 紧凑内边距一', 'small 尺寸二']} renderItem={it} />
    </View>
  );
}

/** 无分隔线 */
function NoSplitDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <List
      style={{ maxWidth: 560 }}
      split={false}
      dataSource={SIMPLE}
      renderItem={(t) => <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{t}</Text>}
      footer={<Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>共 {SIMPLE.length} 条 · 无分隔线</Text>}
    />
  );
}

/** 水平布局 + extra */
function HorizontalDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <List
      header="团队成员"
      bordered
      itemLayout="horizontal"
      style={{ maxWidth: 560 }}
      dataSource={PEOPLE}
      renderItem={(p) => (
        <List.Item
          extra={<Avatar style={{ backgroundColor: p.color }}>{p.name[0]}</Avatar>}
        >
          <Text style={{ fontSize: token.fontSize, fontWeight: '500', color: token.colorText }}>
            {p.name} · {p.role}
          </Text>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: 2 }}>{p.desc}</Text>
        </List.Item>
      )}
    />
  );
}

/** 操作区 */
function ActionsDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <List
      header="带操作"
      bordered
      itemLayout="horizontal"
      style={{ maxWidth: 560 }}
      dataSource={PEOPLE}
      renderItem={(p) => (
        <List.Item
          extra={<Avatar style={{ backgroundColor: p.color }}>{p.name[0]}</Avatar>}
          actions={[
            <Text key="e" style={{ fontSize: token.fontSize, color: token.colorPrimary }}>编辑</Text>,
            <Text key="m" style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>消息</Text>,
            <Text key="d" style={{ fontSize: token.fontSize, color: token.colorError }}>删除</Text>,
          ]}
        >
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{p.name}</Text>
        </List.Item>
      )}
    />
  );
}

/** 加载 */
function LoadingDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <List
      header="加载中示例"
      bordered
      loading
      style={{ maxWidth: 560 }}
      dataSource={['数据会在 Spin 遮罩下变暗']}
      renderItem={(t) => <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{t}</Text>}
    />
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'header + 简单文本项 + bordered',
    node: <BasicDemo />,
    code: [
      'import { List, Text } from "react-native-flux-desktop";',
      '',
      '<List',
      '  header="待办事项"',
      '  bordered',
      '  dataSource={[\'发布 v0.3.0 版本\', \'完成 Table 组件抓帧验证\']}',
      '  renderItem={(t) => <Text>{t}</Text>}',
      '/>',
    ].join('\n'),
  },
  {
    name: '边框与尺寸',
    desc: "size='large' / 'small' 调整内边距",
    node: <SizeDemo />,
    code: [
      'import { List, Text } from "react-native-flux-desktop";',
      '',
      '// size=large / small 调整项内边距',
      '<List size="large" bordered dataSource={data} renderItem={(t) => <Text>{t}</Text>} />',
      '<List size="small" bordered dataSource={data} renderItem={(t) => <Text>{t}</Text>} />',
    ].join('\n'),
  },
  {
    name: '无分隔线',
    desc: 'split=false 去掉项间横线，footer 收尾',
    node: <NoSplitDemo />,
    code: [
      'import { List, Text } from "react-native-flux-desktop";',
      '',
      '// split=false 去掉项间横线，footer 收尾',
      '<List',
      '  split={false}',
      '  dataSource={data}',
      '  renderItem={(t) => <Text>{t}</Text>}',
      '  footer={<Text>共 {data.length} 条</Text>}',
      '/>',
    ].join('\n'),
  },
  {
    name: '水平布局',
    desc: 'itemLayout=horizontal + List.Item extra（头像在右）',
    node: <HorizontalDemo />,
    code: [
      'import { List, Avatar, Text } from "react-native-flux-desktop";',
      '',
      '<List',
      '  header="团队成员"',
      '  bordered',
      '  itemLayout="horizontal"',
      '  dataSource={people}',
      '  renderItem={(p) => (',
      '    <List.Item extra={<Avatar style={{ backgroundColor: p.color }}>{p.name[0]}</Avatar>}>',
      '      <Text>{p.name} · {p.role}</Text>',
      '    </List.Item>',
      '  )}',
      '/>',
    ].join('\n'),
  },
  {
    name: '操作区',
    desc: 'List.Item actions 一排可点项，竖线分隔',
    node: <ActionsDemo />,
    code: [
      'import { List, Avatar, Text } from "react-native-flux-desktop";',
      '',
      '// List.Item actions 一排可点项，竖线分隔',
      '<List.Item',
      '  extra={<Avatar>{p.name[0]}</Avatar>}',
      '  actions={[',
      '    <Text key="e" style={{ color: \'#1677ff\' }}>编辑</Text>,',
      '    <Text key="d" style={{ color: \'#ff4d4f\' }}>删除</Text>,',
      '  ]}',
      '>',
      '  <Text>{p.name}</Text>',
      '</List.Item>',
    ].join('\n'),
  },
  {
    name: '加载中',
    desc: 'loading 复用 Spin 遮罩',
    node: <LoadingDemo />,
    code: [
      'import { List, Text } from "react-native-flux-desktop";',
      '',
      '// loading 复用 Spin 遮罩',
      '<List header="加载中示例" bordered loading dataSource={data} renderItem={(t) => <Text>{t}</Text>} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'dataSource / renderItem', desc: '数据源 / 渲染函数', type: 'T[] / (item,i)', default: '–' },
  { name: 'header / footer', desc: '头 / 尾', type: 'ReactNode', default: '–' },
  { name: 'bordered', desc: '外框', type: 'boolean', default: 'false' },
  { name: 'split', desc: '项间分隔线', type: 'boolean', default: 'true' },
  { name: 'size', desc: '尺寸', type: "'large' | 'default' | 'small'", default: "'default'" },
  { name: 'loading', desc: '加载遮罩', type: 'boolean', default: 'false' },
  { name: 'itemLayout', desc: '项内部布局', type: "'horizontal' | 'vertical'", default: "'vertical'" },
  { name: 'List.Item.actions', desc: '操作区', type: 'ReactNode[]', default: '–' },
  { name: 'List.Item.extra', desc: '右侧额外内容', type: 'ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgContainer', desc: '列表底色', default: '容器背景' },
  { name: 'colorSplit', desc: '分隔线', default: '分隔色' },
  { name: 'paddingSM', desc: 'default 内边距', default: '12' },
];

export function ListDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
