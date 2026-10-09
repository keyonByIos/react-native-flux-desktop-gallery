// FLOAT_BUTTON：悬浮按钮。对齐 antd API（icon/description/type/shape/badge/onClick + Group），
// 用 DemoPage 承载；每个 demo 放一块虚线 relative 画布，浮动按钮锚定到画布右下角。
import React from 'react';
import { FloatButton, View, Text, Icon, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 定位画布：relative 容器，给绝对定位的 FloatButton 一个锚点边界（透明底、虚线描边） */
function Canvas(props: { children: React.ReactNode; height?: number }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        position: 'relative',
        height: props.height ?? 140,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderStyle: 'dashed',
        borderColor: token.colorBorder,
      }}
    >
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, padding: token.paddingXS }}>
        内容区域
      </Text>
      {props.children}
    </View>
  );
}

function BasicDemo(): React.ReactElement {
  return (
    <Canvas>
      <FloatButton icon="up" />
    </Canvas>
  );
}

function TypeDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Canvas>
      <FloatButton icon="heart" type="primary" style={{ right: token.margin, bottom: token.margin }} />
      <FloatButton icon="heart" style={{ right: token.margin + 64, bottom: token.margin }} />
    </Canvas>
  );
}

function ShapeDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Canvas>
      <FloatButton icon="edit" type="primary" shape="square" style={{ right: token.margin, bottom: token.margin }} />
      <FloatButton icon="edit" type="primary" shape="circle" style={{ right: token.margin + 64, bottom: token.margin }} />
    </Canvas>
  );
}

function DescDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Canvas height={160}>
      <FloatButton icon="star" description="收藏" type="primary" style={{ right: token.margin, bottom: token.margin }} />
      <FloatButton icon="share" description="分享" shape="square" style={{ right: token.margin + 72, bottom: token.margin }} />
    </Canvas>
  );
}

function BadgeDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Canvas>
      <FloatButton icon="bell" badge={5} type="primary" style={{ right: token.margin, bottom: token.margin }} />
      <FloatButton icon="mail" badge={42} style={{ right: token.margin + 64, bottom: token.margin }} />
    </Canvas>
  );
}

function TooltipDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Canvas>
      <FloatButton icon="up" tooltip="回到顶部" style={{ right: token.margin, bottom: token.margin }} />
      <FloatButton icon="questionCircle" title="需要帮助？" type="primary" style={{ right: token.margin + 64, bottom: token.margin }} />
    </Canvas>
  );
}

function GroupDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Canvas height={260}>
      {/* 常驻堆叠组 */}
      <FloatButton.Group style={{ right: token.margin, bottom: token.margin }}>
        <FloatButton icon="star" style={{ position: 'relative', right: 0, bottom: 0 }} />
        <FloatButton icon="edit" type="primary" style={{ position: 'relative', right: 0, bottom: 0, marginTop: token.paddingXXS }} />
        <FloatButton icon="up" style={{ position: 'relative', right: 0, bottom: 0, marginTop: token.paddingXXS }} />
      </FloatButton.Group>
      {/* 点击展开组 */}
      <FloatButton.Group trigger="click" icon="menu" closeIcon="close" defaultOpen style={{ right: token.margin + 96, bottom: token.margin }}>
        <FloatButton icon="star" style={{ position: 'relative', right: 0, bottom: 0, marginBottom: token.paddingXXS }} />
        <FloatButton icon="heart" type="primary" style={{ position: 'relative', right: 0, bottom: 0, marginBottom: token.paddingXXS }} />
        <FloatButton icon="bell" badge={3} style={{ position: 'relative', right: 0, bottom: 0 }} />
      </FloatButton.Group>
    </Canvas>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '默认圆形、次级样式，锚定到容器右下角。',
    node: <BasicDemo />,
    code: [
      'import { FloatButton } from "react-native-flux-desktop";',
      '',
      '// 放进一个 relative 容器，FloatButton 默认绝对定位、自动锚定右下角',
      '<FloatButton icon="up" />',
    ].join('\n'),
  },
  {
    name: '主要类型',
    desc: 'type：primary 实底主色 · default 描边底色。',
    node: <TypeDemo />,
    code: [
      '<FloatButton icon="heart" type="primary" />  // 实底主色',
      '<FloatButton icon="heart" />                 // default 描边底色',
    ].join('\n'),
  },
  {
    name: '形状',
    desc: 'shape：circle 圆形 · square 方形。',
    node: <ShapeDemo />,
    code: [
      '<FloatButton icon="edit" type="primary" shape="square" />',
      '<FloatButton icon="edit" type="primary" shape="circle" />',
    ].join('\n'),
  },
  {
    name: '带描述文字',
    desc: 'description 在图标下方显示文字，按钮自动增高。',
    node: <DescDemo />,
    code: [
      '<FloatButton icon="star" description="收藏" type="primary" />',
      '<FloatButton icon="share" description="分享" shape="square" />',
    ].join('\n'),
  },
  {
    name: '徽标',
    desc: 'badge 传入数字，右上角红点计数。',
    node: <BadgeDemo />,
    code: [
      '<FloatButton icon="bell" badge={5} type="primary" />',
      '<FloatButton icon="mail" badge={42} />',
    ].join('\n'),
  },
  {
    name: '气泡提示',
    desc: 'tooltip / title 悬停在按钮左侧显示提示（需鼠标悬停查看）。',
    node: <TooltipDemo />,
    code: [
      '// tooltip（title 为其别名）：悬停在按钮左侧弹出提示',
      '<FloatButton icon="up" tooltip="回到顶部" />',
      '<FloatButton icon="questionCircle" title="需要帮助？" type="primary" />',
    ].join('\n'),
  },
  {
    name: '按钮组',
    desc: 'FloatButton.Group：常驻堆叠 · trigger="click" 点击展开，icon 收起态 / closeIcon 展开态。',
    node: <GroupDemo />,
    code: [
      '// 常驻堆叠组：子项直接平铺堆叠',
      '<FloatButton.Group>',
      '  <FloatButton icon="star" />',
      '  <FloatButton icon="edit" type="primary" />',
      '  <FloatButton icon="up" />',
      '</FloatButton.Group>',
      '',
      '// trigger="click" 点击展开：icon 为收起态主按钮、closeIcon 为展开态',
      '<FloatButton.Group trigger="click" icon="menu" closeIcon="close" defaultOpen>',
      '  <FloatButton icon="star" />',
      '  <FloatButton icon="heart" type="primary" />',
      '  <FloatButton icon="bell" badge={3} />',
      '</FloatButton.Group>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'icon', desc: '按钮图标（图标名字符串或 ReactNode）', type: 'ReactNode | string', default: '–' },
  { name: 'description', desc: '图标下方描述文字（text 为其别名）', type: 'ReactNode', default: '–' },
  { name: 'type', desc: '按钮类型', type: "'default' | 'primary'", default: "'default'" },
  { name: 'shape', desc: '按钮形状', type: "'circle' | 'square'", default: "'circle'" },
  { name: 'badge', desc: '右上角徽标计数', type: 'ReactNode | number', default: '–' },
  { name: 'tooltip', desc: '悬停左侧提示（title 为其别名）', type: 'string', default: '–' },
  { name: 'onClick', desc: '点击回调（onPress 为别名）', type: '() => void', default: '–' },
  { name: 'size', desc: '按钮尺寸（px），缺省取 controlHeightLG + 8', type: 'number', default: '–' },
  { name: 'Group.trigger', desc: '组展开触发方式，不传则子项常驻堆叠', type: "'click' | 'hover'", default: '–' },
  { name: 'Group.icon', desc: '收起态主按钮图标', type: 'ReactNode | string', default: "'menu'" },
  { name: 'Group.closeIcon', desc: '展开态主按钮图标', type: 'ReactNode | string', default: "'close'" },
  { name: 'Group.defaultOpen', desc: '默认展开态', type: 'boolean', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeightLG', desc: '按钮基准尺寸来源（+8 为边距）', default: '40' },
  { name: 'colorPrimary', desc: 'primary 类型底色', default: 'colorPrimary' },
  { name: 'colorBgContainer', desc: 'default 类型底色', default: 'colorBgContainer' },
  { name: 'colorError', desc: '徽标底色', default: 'colorError' },
  { name: 'marginLG', desc: '默认 right / bottom 锚定偏移', default: '24' },
  { name: 'borderRadiusLG', desc: 'square 形状圆角', default: '8' },
];

export function FloatButtonDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
