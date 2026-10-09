// TIMELINE demo：DemoPage 多段式（基础 / 彩色 / 自定义节点 / 右侧 / 交替 / pending / 反序）。
import React from 'react';
import { Timeline, Text, Icon, useToken, type TimelineItem } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

function useNode(): (t: string) => React.ReactElement {
  const { token } = useToken();
  return (t: string) => <Text style={{ fontSize: token.fontSize, color: token.colorText }}>{t}</Text>;
}

function Basic(): React.ReactElement {
  const node = useNode();
  return (
    <Timeline
      items={[
        { key: '1', children: node('创建成功 2026-09-01') },
        { key: '2', children: node('解析资源') },
        { key: '3', children: node('提交审核') },
        { key: '4', children: node('发布上线') },
      ]}
    />
  );
}

function Colors(): React.ReactElement {
  const node = useNode();
  return (
    <Timeline
      items={[
        { key: '1', color: 'green', children: node('已完成：实名认证通过') },
        { key: '2', color: 'red', children: node('异常：资料被驳回') },
        { key: '3', color: 'blue', children: node('进行中：复审处理') },
        { key: '4', color: 'gray', children: node('待办：等待补充材料') },
      ]}
    />
  );
}

function CustomDot(): React.ReactElement {
  const node = useNode();
  return (
    <Timeline
      items={[
        { key: '1', dot: <Icon name="user" size={14} color="#1677ff" />, children: node('用户注册') },
        { key: '2', dot: <Icon name="check" size={14} color="#52c41a" />, children: node('邮箱验证') },
        { key: '3', dot: <Icon name="gift" size={14} color="#faad14" />, children: node('领取新人礼包') },
      ]}
    />
  );
}

function RightMode(): React.ReactElement {
  const node = useNode();
  return (
    <Timeline
      mode="right"
      items={[
        { key: '1', color: 'blue', children: node('右侧模式 · 步骤一') },
        { key: '2', color: 'blue', children: node('右侧模式 · 步骤二') },
        { key: '3', children: node('右侧模式 · 步骤三') },
      ]}
    />
  );
}

function Alternate(): React.ReactElement {
  const node = useNode();
  const items: TimelineItem[] = [
    { key: '1', color: 'blue', label: node('2026-09-01'), children: node('创建账号') },
    { key: '2', color: 'blue', label: node('2026-09-03'), children: node('初始配置') },
    { key: '3', color: 'green', label: node('2026-09-05'), children: node('首次部署成功') },
    { key: '4', label: node('2026-09-08'), children: node('灰度放量 20%') },
  ];
  return <Timeline mode="alternate" items={items} />;
}

function Pending(): React.ReactElement {
  const node = useNode();
  return (
    <Timeline
      pending={node('等待复审中…')}
      items={[
        { key: '1', color: 'green', children: node('提交资料') },
        { key: '2', color: 'blue', children: node('系统校验') },
      ]}
    />
  );
}

function Reverse(): React.ReactElement {
  const node = useNode();
  return (
    <Timeline
      reverse
      items={[
        { key: '1', children: node('最早：创建') },
        { key: '2', children: node('中间：审核') },
        { key: '3', color: 'green', children: node('最新：通过') },
      ]}
    />
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '默认 left 模式，圆点 + 连接线',
    node: <Basic />,
    code: [
      'import { Timeline } from "react-native-flux-desktop";',
      '',
      '// 默认 left 模式，圆点 + 连接线',
      '<Timeline',
      '  items={[',
      '    { key: \'1\', children: \'创建成功 2026-09-01\' },',
      '    { key: \'2\', children: \'解析资源\' },',
      '    { key: \'3\', children: \'发布上线\' },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '彩色',
    desc: 'item.color：green / red / blue / gray',
    node: <Colors />,
    code: [
      'import { Timeline } from "react-native-flux-desktop";',
      '',
      '// item.color 控制圆点颜色',
      '<Timeline',
      '  items={[',
      '    { key: \'1\', color: \'green\', children: \'已完成\' },',
      '    { key: \'2\', color: \'red\', children: \'异常\' },',
      '    { key: \'3\', color: \'blue\', children: \'进行中\' },',
      '    { key: \'4\', color: \'gray\', children: \'待办\' },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '自定义节点',
    desc: 'item.dot 用矢量图标替代圆点',
    node: <CustomDot />,
    code: [
      'import { Timeline, Icon } from "react-native-flux-desktop";',
      '',
      '// item.dot 用矢量图标替代圆点',
      '<Timeline',
      '  items={[',
      '    { key: \'1\', dot: <Icon name="user" size={14} color="#1677ff" />, children: \'用户注册\' },',
      '    { key: \'2\', dot: <Icon name="check" size={14} color="#52c41a" />, children: \'邮箱验证\' },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '右侧模式',
    desc: "mode='right' 轴线在右",
    node: <RightMode />,
    code: [
      'import { Timeline } from "react-native-flux-desktop";',
      '',
      '// mode=right 轴线在右侧',
      '<Timeline mode="right" items={[{ key: \'1\', color: \'blue\', children: \'步骤一\' }]} />',
    ].join('\n'),
  },
  {
    name: '交替模式',
    desc: "mode='alternate' 左右交替，label 在另一侧",
    node: <Alternate />,
    code: [
      'import { Timeline } from "react-native-flux-desktop";',
      '',
      '// mode=alternate 左右交替，label 在另一侧',
      '<Timeline',
      '  mode="alternate"',
      '  items={[',
      '    { key: \'1\', color: \'blue\', label: \'2026-09-01\', children: \'创建账号\' },',
      '    { key: \'3\', color: \'green\', label: \'2026-09-05\', children: \'首次部署成功\' },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '待定节点',
    desc: 'pending 尾部灰色占位',
    node: <Pending />,
    code: [
      'import { Timeline } from "react-native-flux-desktop";',
      '',
      '// pending 尾部追加灰色待定节点',
      '<Timeline',
      '  pending="等待复审中…"',
      '  items={[{ key: \'1\', color: \'green\', children: \'提交资料\' }]}',
      '/>',
    ].join('\n'),
  },
  {
    name: '反序',
    desc: 'reverse 倒序展示',
    node: <Reverse />,
    code: [
      'import { Timeline } from "react-native-flux-desktop";',
      '',
      '// reverse 倒序展示',
      '<Timeline reverse items={[{ key: \'1\', children: \'创建\' }, { key: \'3\', color: \'green\', children: \'通过\' }]} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'items', desc: '时间轴项', type: 'TimelineItem[]', default: '[]' },
  { name: 'mode', desc: '排布模式', type: "'left' | 'right' | 'alternate'", default: "'left'" },
  { name: 'pending', desc: '尾部待定节点', type: 'ReactNode', default: '–' },
  { name: 'reverse', desc: '反序展示', type: 'boolean', default: 'false' },
  { name: 'item.color', desc: '圆点颜色', type: "'blue'|'green'|'red'|'gray'|string", default: "'blue'" },
  { name: 'item.dot', desc: '自定义节点', type: 'ReactNode', default: '–' },
  { name: 'item.label', desc: '标签（alternate 另一侧）', type: 'ReactNode', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorSuccess / Error / Primary', desc: '语义圆点色', default: 'green/red/blue' },
  { name: 'colorBorderSecondary', desc: '连接线色', default: '浅边框' },
  { name: 'marginLG', desc: '项间距', default: '24' },
];

export function TimelineDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
