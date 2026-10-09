// Button demo：用通用容器 DemoPage 承载 —— 上代码演示、中 API、下 Token。
import React from 'react';
import { Button, Space, View, Icon, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

function TypeDemos(): React.ReactElement {
  const [n, setN] = React.useState(3);
  return (
    <Space size="small" wrap>
      <Button type="primary" onPress={() => setN(n + 1)}>Primary {n}</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="text">Text</Button>
      <Button type="link">Link</Button>
    </Space>
  );
}

function SizeDemos(): React.ReactElement {
  return (
    <Space size="small" align="center" wrap>
      <Button type="primary" size="large">Large</Button>
      <Button type="primary">Middle</Button>
      <Button type="primary" size="small">Small</Button>
    </Space>
  );
}

function ShapeDemos(): React.ReactElement {
  return (
    <Space size="small" align="center" wrap>
      <Button type="primary" shape="round" icon={<Icon name="plus" />}>Round</Button>
      <Button shape="round">Round</Button>
      <Button type="primary" shape="circle" icon={<Icon name="search" size={16} />} />
      <Button shape="circle" icon={<Icon name="setting" size={16} />} />
      <Button type="dashed" shape="circle" icon={<Icon name="edit" size={16} />} />
      <Button type="primary" danger shape="circle" icon={<Icon name="delete" size={16} />} />
    </Space>
  );
}

function IconDemos(): React.ReactElement {
  return (
    <Space size="small" wrap>
      <Button type="primary" icon={<Icon name="download" size={15} />}>Download</Button>
      <Button icon={<Icon name="setting" size={15} />}>Settings</Button>
      <Button type="primary" icon={<Icon name="search" size={15} />} />
      <Button type="text" icon={<Icon name="filter" size={15} />} />
      <Button type="link" icon={<Icon name="share" size={15} />}>Share</Button>
    </Space>
  );
}

function DangerDemos(): React.ReactElement {
  return (
    <Space size="small" wrap>
      <Button type="primary" danger>Danger Primary</Button>
      <Button danger>Danger Default</Button>
      <Button danger type="dashed">Danger Dashed</Button>
      <Button danger type="text">Danger Text</Button>
      <Button danger type="link">Danger Link</Button>
    </Space>
  );
}

function GhostDemos(): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: token.marginXS,
        padding: token.padding,
        backgroundColor: token.colorBgSpotlight,
      }}
    >
      <Button type="primary" ghost>Primary Ghost</Button>
      <Button ghost>Default Ghost</Button>
      <Button type="primary" ghost danger>Danger Ghost</Button>
    </View>
  );
}

function DisabledDemos(): React.ReactElement {
  return (
    <Space size="small" wrap>
      <Button type="primary" disabled>Primary</Button>
      <Button disabled>Default</Button>
      <Button type="dashed" disabled>Dashed</Button>
      <Button type="text" disabled>Text</Button>
      <Button type="primary" disabled icon={<Icon name="setting" size={15} />}>With Icon</Button>
    </Space>
  );
}

function LoadingDemos(): React.ReactElement {
  const { token } = useToken();
  const [busy, setBusy] = React.useState(false);
  const click = (): void => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => setBusy(false), 2000);
  };
  return (
    <Space size="small" align="center" wrap>
      <Button type="primary" loading>Loading</Button>
      <Button loading>Default</Button>
      <Button type="primary" shape="circle" loading />
      <View style={{ width: 1, height: token.controlHeight, backgroundColor: token.colorBorder }} />
      <Button type="primary" loading={busy} onClick={click}>{busy ? '提交中' : '点击加载 2s'}</Button>
    </Space>
  );
}

function ColorDemos(): React.ReactElement {
  return (
    <Space size="small" wrap>
      <Button type="primary" color="#14b8a6">Primary Teal</Button>
      <Button type="primary" color="#facc15">Primary Yellow</Button>
      <Button color="#8b5cf6">Default Purple</Button>
      <Button type="dashed" color="#ec4899">Dashed Pink</Button>
      <Button type="text" color="#22c55e">Text Green</Button>
      <Button type="link" color="#f97316">Link Orange</Button>
      <Button type="primary" ghost color="#06b6d4">Ghost Cyan</Button>
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '类型',
    desc: '五种 type：primary / default / dashed / text / link，通过 onPress / onClick 处理点击。',
    node: <TypeDemos />,
    code: [
      'import { Button, Space } from "react-native-flux-desktop";',
      '',
      '<Space size="small" wrap>',
      '  <Button type="primary" onClick={onSave}>Primary</Button>',
      '  <Button>Default</Button>',
      '  <Button type="dashed">Dashed</Button>',
      '  <Button type="text">Text</Button>',
      '  <Button type="link">Link</Button>',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: '三种 size：large / middle / small，高度与字号取自 token。',
    node: <SizeDemos />,
    code: [
      '<Button type="primary" size="large">Large</Button>',
      '<Button type="primary">Middle</Button>',
      '<Button type="primary" size="small">Small</Button>',
    ].join('\n'),
  },
  {
    name: '形状',
    desc: 'shape：default / round 胶囊 / circle 圆形（纯图标）。',
    node: <ShapeDemos />,
    code: [
      'import { Icon } from "react-native-flux-desktop";',
      '',
      '<Button type="primary" shape="round" icon={<Icon name="plus" />}>Round</Button>',
      '<Button shape="round">Round</Button>',
      '<Button type="primary" shape="circle" icon={<Icon name="search" size={16} />} />',
      '<Button type="primary" danger shape="circle" icon={<Icon name="delete" size={16} />} />',
    ].join('\n'),
  },
  {
    name: '图标按钮',
    desc: 'icon 传入矢量图标；只有图标无文字时自动收成方形。',
    node: <IconDemos />,
    code: [
      '<Button type="primary" icon={<Icon name="download" size={15} />}>Download</Button>',
      '<Button icon={<Icon name="setting" size={15} />}>Settings</Button>',
      '// 只有图标、无文字 → 自动收成方形',
      '<Button type="primary" icon={<Icon name="search" size={15} />} />',
    ].join('\n'),
  },
  {
    name: '危险按钮',
    desc: 'danger 将主色切换为错误色，适用于删除等破坏性操作。',
    node: <DangerDemos />,
    code: [
      '<Button type="primary" danger>Danger Primary</Button>',
      '<Button danger>Danger Default</Button>',
      '<Button danger type="dashed">Danger Dashed</Button>',
      '<Button danger type="text">Danger Text</Button>',
    ].join('\n'),
  },
  {
    name: '幽灵按钮',
    desc: 'ghost 背景透明、描边/文字取主色，用于深色或彩色底上。',
    node: <GhostDemos />,
    code: [
      '// ghost：背景透明、描边/文字取主色，适合深色或彩色底',
      '<Button type="primary" ghost>Primary Ghost</Button>',
      '<Button ghost>Default Ghost</Button>',
      '<Button type="primary" ghost danger>Danger Ghost</Button>',
    ].join('\n'),
  },
  {
    name: '自定义颜色',
    desc: 'color 传入任意色值，自动派生 hover/active 色阶；实底上文字按对比度自动选黑/白。',
    node: <ColorDemos />,
    code: [
      '// color 自动派生 hover/active；实底上文字按对比度自动选黑/白',
      '<Button type="primary" color="#14b8a6">Primary Teal</Button>',
      '<Button color="#8b5cf6">Default Purple</Button>',
      '<Button type="link" color="#f97316">Link Orange</Button>',
      '<Button type="primary" ghost color="#06b6d4">Ghost Cyan</Button>',
    ].join('\n'),
  },
  {
    name: '禁用状态',
    desc: 'disabled 置灰并拦截交互。',
    node: <DisabledDemos />,
    code: [
      '<Button type="primary" disabled>Primary</Button>',
      '<Button disabled>Default</Button>',
      '<Button type="primary" disabled icon={<Icon name="setting" size={15} />}>With Icon</Button>',
    ].join('\n'),
  },
  {
    name: '加载状态',
    desc: 'loading 显示旋转弧并拦截点击；可配合 onClick 做异步提交。',
    node: <LoadingDemos />,
    code: [
      'const [busy, setBusy] = React.useState(false);',
      'const click = (): void => {',
      '  setBusy(true);',
      '  setTimeout(() => setBusy(false), 2000);',
      '};',
      '',
      '<Button type="primary" loading>Loading</Button>',
      '<Button type="primary" loading={busy} onClick={click}>',
      '  {busy ? "提交中" : "点击加载 2s"}',
      '</Button>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'type', desc: '按钮类型', type: "'primary' | 'default' | 'dashed' | 'text' | 'link'", default: "'default'" },
  { name: 'size', desc: '按钮尺寸', type: "'large' | 'middle' | 'small'", default: "'middle'" },
  { name: 'shape', desc: '按钮形状', type: "'default' | 'circle' | 'round'", default: "'default'" },
  { name: 'danger', desc: '危险按钮，主色切换为错误色', type: 'boolean', default: 'false' },
  { name: 'ghost', desc: '幽灵按钮，背景透明', type: 'boolean', default: 'false' },
  { name: 'color', desc: '自定义主色，派生 hover/active 并覆盖 type/danger 默认配色', type: 'string', default: '–' },
  { name: 'disabled', desc: '禁用状态', type: 'boolean', default: 'false' },
  { name: 'loading', desc: '加载中，显示旋转弧并拦截点击', type: 'boolean', default: 'false' },
  { name: 'block', desc: '块级按钮，撑满父容器宽度', type: 'boolean', default: 'false' },
  { name: 'icon', desc: '按钮图标（ReactNode）', type: 'ReactNode', default: '–' },
  { name: 'onPress', desc: '点击回调', type: '() => void', default: '–' },
  { name: 'onClick', desc: '点击回调（antd 命名别名，等价 onPress）', type: '() => void', default: '–' },
  { name: 'style', desc: '外层容器样式覆盖', type: 'StyleProp<ViewStyle>', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeight', desc: 'middle 按钮高度（全局 token）', default: '32' },
  { name: 'controlHeightSM', desc: 'small 按钮高度', default: '24' },
  { name: 'controlHeightLG', desc: 'large 按钮高度', default: '40' },
  { name: 'contentFontSize', desc: 'middle 字号', default: '14' },
  { name: 'contentFontSizeSM', desc: 'small 字号', default: '12' },
  { name: 'contentFontSizeLG', desc: 'large 字号', default: '16' },
  { name: 'paddingInline', desc: '横向内边距', default: '15' },
  { name: 'borderRadius', desc: 'default 形状圆角', default: '6' },
  { name: 'fontWeight', desc: '文字字重', default: '500' },
  { name: 'defaultBg', desc: 'default 按钮背景', default: 'colorBgContainer' },
  { name: 'defaultBorderColor', desc: 'default 按钮描边', default: 'colorBorder' },
  { name: 'defaultColor', desc: 'default 按钮文字', default: 'colorText' },
  { name: 'solidTextColor', desc: 'primary 实底文字色', default: 'colorTextOnPrimaryBackground' },
];

export function ButtonDemo(): React.ReactElement {
  return (
    <DemoPage
      demos={DEMOS}
      api={API}
      tokens={TOKENS}
    />
  );
}
