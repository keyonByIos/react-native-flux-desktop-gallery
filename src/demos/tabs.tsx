// TABS：标签页。统一走 DemoPage 多段式，覆盖 antd v5 基础 / 卡片 / 可增删 / 位置四向 / 大小 / 图标 / 禁用 / 额外内容 / 图片预热。
import React from 'react';
import { Tabs, View, Text, ImageBox, useToken, usePreloadImages, type TabItem } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 简单占位内容（自带 token） */
function Pane(props: { text: string }): React.ReactElement {
  const { token } = useToken();
  return <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>{props.text}</Text>;
}

const BASIC: TabItem[] = [
  { key: '1', label: '首页', children: <Pane text="首页内容 —— line 型带下划线滑动墨条" /> },
  { key: '2', label: '订单', children: <Pane text="订单内容" /> },
  { key: '3', label: '设置', children: <Pane text="设置内容" /> },
  { key: '4', label: '禁用', disabled: true, children: <Pane text="不该被看到" /> },
];

/** 可增删：editable-card，items 与 activeKey 由外部 state 管理 */
function EditableDemo(): React.ReactElement {
  const [panes, setPanes] = React.useState<TabItem[]>([
    { key: '1', label: '标签一', children: <Pane text="标签一的内容" /> },
    { key: '2', label: '标签二', children: <Pane text="标签二的内容" /> },
  ]);
  const [active, setActive] = React.useState('1');
  const idxRef = React.useRef(2);

  const onEdit = (targetKey: string | undefined, action: 'add' | 'remove'): void => {
    if (action === 'add') {
      idxRef.current += 1;
      const key = String(idxRef.current);
      setPanes((prev) => [...prev, { key, label: `新标签 ${key}`, children: <Pane text={`新标签 ${key} 的内容`} /> }]);
      setActive(key);
    } else if (targetKey != null) {
      setPanes((prev) => prev.filter((p) => p.key !== targetKey));
      setActive((cur) => (cur === targetKey ? (panes.find((p) => p.key !== targetKey)?.key ?? '') : cur));
    }
  };

  return <Tabs type="editable-card" items={panes} activeKey={active} onChange={setActive} onEdit={onEdit} />;
}

/** 位置：竖向（左 / 右）与底部 */
function PositionDemo(): React.ReactElement {
  const { token } = useToken();
  const items: TabItem[] = [
    { key: '1', label: '账号', children: <Pane text="账号设置面板" /> },
    { key: '2', label: '安全', children: <Pane text="安全设置面板" /> },
    { key: '3', label: '通知', children: <Pane text="通知设置面板" /> },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: token.marginLG, flexWrap: 'wrap' }}>
      <View style={{ width: 260 }}>
        <Tabs tabPosition="left" items={items} />
      </View>
      <View style={{ width: 260 }}>
        <Tabs tabPosition="right" items={items} />
      </View>
    </View>
  );
}

/** 大小：large / middle / small */
function SizeDemo(): React.ReactElement {
  const { token } = useToken();
  const mk = (): TabItem[] => [
    { key: '1', label: '选项卡' },
    { key: '2', label: '选项卡二' },
    { key: '3', label: '选项卡三' },
  ];
  return (
    <View style={{ gap: token.marginLG }}>
      <Tabs size="large" items={mk()} />
      <Tabs size="middle" items={mk()} />
      <Tabs size="small" items={mk()} />
    </View>
  );
}

/** 图片标签页：每个标签放一张 Lorem Picsum 随机图（同瀑布流/走马灯图源）。
 * 关键：组件挂载时用 usePreloadImages 一次性预热全部图，切到未激活标签时直接命中缓存、无首帧留白。 */
function ImageTabDemo(): React.ReactElement {
  const { token } = useToken();
  const seeds = [10, 24, 33];
  const uris = seeds.map((s) => `https://picsum.photos/seed/${s}/640/360`);
  usePreloadImages(uris); // 预热未激活标签的图，避免切过去才加载而闪白
  const items: TabItem[] = seeds.map((s, i) => ({
    key: String(s),
    label: `图 #${s}`,
    children: (
      <View style={{ gap: token.marginXS }}>
        <ImageBox src={uris[i]} width="100%" height={240} radius={8} />
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          Picsum seed={s} · 已随组件挂载 usePreloadImages 预热，切到此页直接显示
        </Text>
      </View>
    ),
  }));
  return (
    <View style={{ maxWidth: 640 }}>
      <Tabs items={items} />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'line 型，下划线墨条随选中滑动',
    node: <Tabs items={BASIC} />,
    code: [
      'import { Tabs } from "react-native-flux-desktop";',
      '',
      '// line 型（默认），下划线墨条随选中滑动；disabled 禁用页',
      "const items = [",
      "  { key: '1', label: '首页', children: <div>首页内容</div> },",
      "  { key: '2', label: '订单', children: <div>订单内容</div> },",
      "  { key: '4', label: '禁用', disabled: true },",
      '];',
      '<Tabs items={items} />',
    ].join('\n'),
  },
  {
    name: '卡片式',
    desc: 'type=card，选中项有边框与背景',
    node: (
      <Tabs
        type="card"
        defaultActiveKey="2"
        items={[
          { key: '1', label: '卡片 A', children: <Pane text="card 型：选中项有边框与背景" /> },
          { key: '2', label: '卡片 B', children: <Pane text="卡片 B 内容" /> },
          { key: '3', label: '卡片 C', children: <Pane text="卡片 C 内容" /> },
        ]}
      />
    ),
    code: ['// type=card：选中项有边框与背景', '<Tabs type="card" defaultActiveKey="2" items={items} />'].join('\n'),
  },
  {
    name: '可增删',
    desc: 'type=editable-card，点 + 新增、点 × 移除（onEdit）',
    node: <EditableDemo />,
    code: [
      '// type=editable-card：点 + 新增、点 × 移除（onEdit）',
      "const [panes, setPanes] = React.useState<TabItem[]>([\u2026]);",
      "const [active, setActive] = React.useState('1');",
      'const onEdit = (targetKey, action) => {',
      "  if (action === 'add') {\n    setPanes((prev) => [...prev, { key, label, children }]);",
      "  } else if (action === 'remove') {\n    setPanes((prev) => prev.filter((p) => p.key !== targetKey));",
      '  }',
      '};',
      '<Tabs type="editable-card" items={panes} activeKey={active} onChange={setActive} onEdit={onEdit} />',
    ].join('\n'),
  },
  {
    name: '标签位置',
    desc: 'tabPosition=left / right，标签栏移到侧边',
    node: <PositionDemo />,
    code: [
      '// tabPosition：top / bottom / left / right',
      '<Tabs tabPosition="left" items={items} />',
      '<Tabs tabPosition="right" items={items} />',
    ].join('\n'),
  },
  {
    name: '大小',
    desc: 'size=large / middle / small',
    node: <SizeDemo />,
    code: ['// size：large / middle / small', '<Tabs size="large" items={items} />', '<Tabs size="small" items={items} />'].join('\n'),
  },
  {
    name: '带图标',
    desc: 'items[].icon 传图标名或 ReactNode',
    node: (
      <Tabs
        items={[
          { key: '1', label: '首页', icon: 'home', children: <Pane text="首页" /> },
          { key: '2', label: '购物车', icon: 'shoppingCart', children: <Pane text="购物车" /> },
          { key: '3', label: '图表', icon: 'pieChart', children: <Pane text="图表" /> },
        ]}
      />
    ),
    code: [
      "// items[].icon 传图标名或 ReactNode",
      "const items = [",
      "  { key: '1', label: '首页', icon: 'home', children: <div>首页</div> },",
      "  { key: '2', label: '购物车', icon: 'shoppingCart', children: <div>购物车</div> },",
      '];',
      '<Tabs items={items} />',
    ].join('\n'),
  },
  {
    name: '居中',
    desc: 'centered 让标签栏居中',
    node: <Tabs centered items={BASIC.slice(0, 3)} />,
    code: ['// centered 让标签栏居中', '<Tabs centered items={items} />'].join('\n'),
  },
  {
    name: '图片标签页（预热）',
    desc: '标签内容放 Picsum 随机图，usePreloadImages 挂载即预热，切页无首帧留白',
    node: <ImageTabDemo />,
    code: [
      '// 挂载即用 usePreloadImages 预热未激活标签的图，切页直接命中缓存',
      'import { Tabs, ImageBox, usePreloadImages } from "react-native-flux-desktop";',
      '',
      'const uris = seeds.map((s) => `https://picsum.photos/seed/${s}/640/360`);',
      'usePreloadImages(uris); // 预热',
      'const items = seeds.map((s, i) => ({ key: String(s), label: `图 #${s}`,',
      '  children: <ImageBox src={uris[i]} width="100%" height={240} radius={8} /> }));',
      '<Tabs items={items} />',
    ].join('\n'),
  },
  {
    name: '额外内容',
    desc: 'tabBarExtraContent 在标签栏另一端放操作',
    node: (
      <Tabs
        items={BASIC.slice(0, 3)}
        tabBarExtraContent={<Text style={{ fontSize: 12, color: '#1677ff' }}>查看更多 →</Text>}
      />
    ),
    code: [
      '// tabBarExtraContent 在标签栏另一端放操作',
      '<Tabs',
      '  items={items}',
      '  tabBarExtraContent={<Text style={{ color: "#1677ff" }}>查看更多 →</Text>}',
      '/>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'items', desc: '标签项数组', type: 'TabItem[]', default: '[]' },
  { name: 'activeKey / defaultActiveKey', desc: '受控 / 非受控当前激活标签', type: 'string', default: '第一项' },
  { name: 'onChange', desc: '切换标签回调', type: '(key) => void', default: '–' },
  { name: 'type', desc: '样式类型', type: "'line' | 'card' | 'editable-card'", default: "'line'" },
  { name: 'tabPosition', desc: '标签栏位置', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'" },
  { name: 'size', desc: '标签大小', type: "'large' | 'middle' | 'small'", default: "'middle'" },
  { name: 'centered', desc: '标签栏居中', type: 'boolean', default: 'false' },
  { name: 'tabBarGutter', desc: '相邻标签间距', type: 'number', default: '组件 token' },
  { name: 'tabBarExtraContent', desc: '标签栏额外内容', type: 'ReactNode', default: '–' },
  { name: 'onEdit', desc: 'editable-card 增删回调', type: '(targetKey, action) => void', default: '–' },
  { name: 'hideAdd', desc: '隐藏添加按钮', type: 'boolean', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'itemPaddingInline', desc: '标签项横向内边距', default: 'padding' },
  { name: 'itemPaddingBlock', desc: '标签项纵向内边距', default: 'paddingSM' },
  { name: 'inkBarSize', desc: '下划线墨条粗细', default: 'lineWidth × 2' },
  { name: 'horizontalItemGutter', desc: '相邻标签默认间距', default: 'marginLG' },
];

export function TabsDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
