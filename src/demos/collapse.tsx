// COLLAPSE：折叠面板。统一走 DemoPage 多段式，覆盖 基础 / 手风琴 / 无边框与幽灵 / 尺寸 / 箭头位置 / 自定义箭头 / 触发区域 / 禁用。
import React from 'react';
import { Collapse, Text, View, Icon, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const BASE_ITEMS = [
  { key: '1', label: '这是一项面板标题', children: '展开内容 —— 面板体用 height 补间做 240ms 下滑展开，收起时上滑折叠。' },
  { key: '2', label: '第二项面板', icon: 'setting', children: '左侧可带图标；箭头随展开态旋转 90°。' },
  { key: '3', label: '第三项面板', children: '默认多展开，同时点开多个互不影响。' },
];

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'items 配置式，defaultActiveKey 指定初始展开项，可同时展开多个',
    node: <Collapse defaultActiveKey={['1']} items={BASE_ITEMS} style={{ maxWidth: 560 }} />,
    code: [
      'import { Collapse } from "react-native-flux-desktop";',
      '',
      'const ITEMS = [',
      '  { key: \'1\', label: \'这是一项面板标题\', children: \'展开内容……\' },',
      '  { key: \'2\', label: \'第二项面板\', icon: \'setting\', children: \'左侧可带图标\' },',
      '];',
      '',
      '// items 配置式，defaultActiveKey 指定初始展开项，可同时展开多个',
      '<Collapse defaultActiveKey={[\'1\']} items={ITEMS} style={{ maxWidth: 560 }} />',
    ].join('\n'),
  },
  {
    name: '手风琴',
    desc: 'accordion 同时只允许展开一个，点新的自动收起旧的',
    node: (
      <Collapse
        accordion
        bordered={false}
        defaultActiveKey={['2']}
        style={{ maxWidth: 560 }}
        items={[
          { key: '1', label: '手风琴 · 面板 A', children: '同一时刻只展开一个。' },
          { key: '2', label: '手风琴 · 面板 B', children: '点击切换，其余自动收起。' },
          { key: '3', label: '手风琴 · 面板 C', children: '无边框形态。' },
        ]}
      />
    ),
    code: [
      'import { Collapse } from "react-native-flux-desktop";',
      '',
      '// accordion 同时只允许展开一个，点新的自动收起旧的',
      '<Collapse',
      '  accordion',
      '  bordered={false}',
      '  defaultActiveKey={[\'2\']}',
      '  items={ITEMS}',
      '/>',
    ].join('\n'),
  },
  {
    name: '无边框与幽灵',
    desc: 'bordered=false 去外框；ghost 透出背景色',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <Collapse bordered={false} defaultActiveKey={['1']} style={{ flex: 1, minWidth: 240 }} items={BASE_ITEMS.slice(0, 2)} />
        <GhostDemo />
      </View>
    ),
    code: [
      'import { Collapse } from "react-native-flux-desktop";',
      '',
      '// bordered=false 去外框；ghost 透出背景色',
      '<Collapse bordered={false} defaultActiveKey={[\'1\']} items={ITEMS} />',
      '<Collapse ghost defaultActiveKey={[\'1\']} items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: "size='large" + "' 头部更宽松、字号更大",
    node: <Collapse size="large" defaultActiveKey={['1']} style={{ maxWidth: 560 }} items={BASE_ITEMS} />,
    code: [
      'import { Collapse } from "react-native-flux-desktop";',
      '',
      '// size=large 头部更宽松、字号更大',
      '<Collapse size="large" defaultActiveKey={[\'1\']} items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '箭头位置',
    desc: "expandIconPosition='end' 把折叠箭头移到头部右侧",
    node: <Collapse expandIconPosition="end" defaultActiveKey={['1']} style={{ maxWidth: 560 }} items={BASE_ITEMS} />,
    code: [
      'import { Collapse } from "react-native-flux-desktop";',
      '',
      '// expandIconPosition=end 把折叠箭头移到头部右侧',
      '<Collapse expandIconPosition="end" defaultActiveKey={[\'1\']} items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '自定义箭头',
    desc: 'expandIcon 依 isActive 渲染自定义图标',
    node: (
      <Collapse
        expandIcon={({ isActive }) => <Icon name={isActive ? 'minus' : 'plus'} size={14} color="#8c8c8c" />}
        defaultActiveKey={['1']}
        style={{ maxWidth: 560 }}
        items={BASE_ITEMS}
      />
    ),
    code: [
      'import { Collapse, Icon } from "react-native-flux-desktop";',
      '',
      '// expandIcon 依 isActive 渲染自定义图标',
      '<Collapse',
      '  expandIcon={({ isActive }) => <Icon name={isActive ? \'minus\' : \'plus\'} size={14} />}',
      '  defaultActiveKey={[\'1\']}',
      '  items={ITEMS}',
      '/>',
    ].join('\n'),
  },
  {
    name: '触发区域',
    desc: "collapsible='icon' 仅点箭头才展开；点标题无反应",
    node: (
      <Collapse
        collapsible="icon"
        defaultActiveKey={[]}
        style={{ maxWidth: 560 }}
        items={[
          { key: '1', label: '只有箭头可点（试试点标题）', children: '点左侧箭头才展开。' },
          { key: '2', label: '同上', children: '整行不再响应，触发区收窄到箭头。' },
        ]}
      />
    ),
    code: [
      'import { Collapse } from "react-native-flux-desktop";',
      '',
      '// collapsible=icon 仅点箭头才展开；点标题无反应',
      '<Collapse collapsible="icon" defaultActiveKey={[]} items={ITEMS} />',
    ].join('\n'),
  },
  {
    name: '禁用面板',
    desc: 'item.disabled 或 collapsible=disabled 禁止展开',
    node: (
      <Collapse
        style={{ maxWidth: 560 }}
        items={[
          { key: '1', label: '可正常展开', children: '内容。' },
          { key: '2', label: '禁用面板', disabled: true, children: '不可点击' },
        ]}
      />
    ),
    code: [
      'import { Collapse } from "react-native-flux-desktop";',
      '',
      '// item.disabled 禁止展开',
      '<Collapse',
      '  items={[',
      '    { key: \'1\', label: \'可正常展开\', children: \'内容\' },',
      '    { key: \'2\', label: \'禁用面板\', disabled: true, children: \'不可点击\' },',
      '  ]}',
      '/>',
    ].join('\n'),
  },
];

/** ghost 演示：透出容器背景 */
function GhostDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flex: 1, minWidth: 240, backgroundColor: token.colorFillTertiary, padding: token.paddingXS }}>
      <Collapse
        ghost
        defaultActiveKey={['1']}
        items={[
          { key: '1', label: '幽灵面板 A', children: '透明背景，融入父容器。' },
          { key: '2', label: '幽灵面板 B', children: '仅保留分隔线。' },
        ]}
      />
    </View>
  );
}

const API: ApiRow[] = [
  { name: 'items', desc: '面板配置数组', type: 'CollapseItem[]', default: '–' },
  { name: 'accordion', desc: '手风琴模式', type: 'boolean', default: 'false' },
  { name: 'bordered', desc: '显示外框', type: 'boolean', default: 'true' },
  { name: 'ghost', desc: '幽灵（透背景）', type: 'boolean', default: 'false' },
  { name: 'size', desc: '尺寸', type: "'large' | 'default'", default: "'default'" },
  { name: 'expandIconPosition', desc: '箭头位置', type: "'start' | 'end'", default: "'start'" },
  { name: 'expandIcon', desc: '自定义箭头', type: '(info) => ReactNode', default: '–' },
  { name: 'collapsible', desc: '触发区域', type: "'header' | 'icon' | 'disabled'", default: "'header'" },
  { name: 'activeKey / onChange', desc: '受控展开', type: 'string[] / (keys)', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorBgContainer', desc: '面板底色', default: '容器背景' },
  { name: 'colorFillQuaternary', desc: '头部悬停底色', default: '极浅填充' },
  { name: 'colorBorderSecondary', desc: '面板描边', default: '浅分隔色' },
];

export function CollapseDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
