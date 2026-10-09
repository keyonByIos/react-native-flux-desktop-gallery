// SPACE：间距容器。统一走 DemoPage 三段式。靠 Yoga gap 排布子项，size 走 token 档；
// split 在子项间插入分隔符，block 占满宽度，wrap 自动换行。
import React from 'react';
import { Space, Button, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 一组示例按钮 */
function Btns(): React.ReactElement {
  return (
    <>
      <Button type="primary">主要</Button>
      <Button>默认</Button>
      <Button type="dashed">虚线</Button>
    </>
  );
}

/** 基础：水平排列，默认 small 间距 */
function BasicDemo(): React.ReactElement {
  return <Space>
    <Btns />
  </Space>;
}

/** 方向：vertical 纵向堆叠 */
function DirectionDemo(): React.ReactElement {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Button type="primary" block>纵向按钮 A</Button>
      <Button block>纵向按钮 B</Button>
    </Space>
  );
}

/** 尺寸：三档 + 自定义数字，逐行对比 */
function SizeRow(props: { label: string; size: 'small' | 'middle' | 'large' | number }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: token.margin }}>
      <Text style={{ width: 120, color: token.colorTextSecondary, fontSize: token.fontSize }}>{props.label}</Text>
      <Space size={props.size}>
        <Btns />
      </Space>
    </View>
  );
}

function SizeDemo(): React.ReactElement {
  return (
    <View>
      <SizeRow label="small" size="small" />
      <SizeRow label="middle" size="middle" />
      <SizeRow label="large" size="large" />
      <SizeRow label="自定义 28" size={28} />
    </View>
  );
}

/** 分隔符：split 在子项间插入竖线 */
function SplitDemo(): React.ReactElement {
  const { token } = useToken();
  const sep = <View style={{ width: token.lineWidth, height: token.fontSize, backgroundColor: token.colorSplit }} />;
  return (
    <Space split={sep}>
      <Text style={{ color: token.colorText }}>提交</Text>
      <Text style={{ color: token.colorText }}>保存</Text>
      <Text style={{ color: token.colorTextSecondary }}>取消</Text>
    </Space>
  );
}

/** 自动换行：wrap + 行列间距分别设定 */
function WrapDemo(): React.ReactElement {
  const tags = ['标签一', '标签二', '标签三', '标签四', '标签五', '标签六', '标签七'];
  return (
    <View style={{ width: 360 }}>
      <Space size={[8, 12]} wrap>
        {tags.map((t) => (
          <Button key={t} size="small">
            {t}
          </Button>
        ))}
      </Space>
    </View>
  );
}

/** 对齐：align 控制交叉轴 */
function AlignDemo(): React.ReactElement {
  const { token } = useToken();
  const box = (h: number, bg: string) => (
    <View style={{ width: 48, height: h, backgroundColor: bg, borderRadius: token.borderRadius }} />
  );
  return (
    <Space align="center" size="middle">
      {box(60, token.colorPrimaryBg)}
      {box(36, token.colorSuccessBg)}
      {box(48, token.colorWarningBg)}
    </Space>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础间距',
    desc: '水平排列，默认 small 间隙；不额外包盒，纯 gap 驱动',
    node: <BasicDemo />,
    code: [
      'import { Space, Button } from "react-native-flux-desktop";',
      '',
      '// 水平排列，默认 small 间隙（靠 Yoga gap 驱动）',
      '<Space>',
      '  <Button type="primary">主要</Button>',
      '  <Button>默认</Button>',
      '  <Button type="dashed">虚线</Button>',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '纵向排列',
    desc: 'direction="vertical" 改为上下堆叠',
    node: <DirectionDemo />,
    code: [
      '// direction=vertical 上下堆叠',
      '<Space direction="vertical" size="middle" style={{ width: "100%" }}>',
      '  <Button type="primary" block>纵向按钮 A</Button>',
      '  <Button block>纵向按钮 B</Button>',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '尺寸档位',
    desc: 'size 支持 small/middle/large 或自定义数字（走 token）',
    node: <SizeDemo />,
    code: [
      "// size：'small' | 'middle' | 'large' | 数字",
      '<Space size="small">…</Space>',
      '<Space size="middle">…</Space>',
      '<Space size="large">…</Space>',
      '<Space size={28}>…</Space>',
    ].join('\n'),
  },
  {
    name: '分隔符',
    desc: 'split 在相邻子项之间插入分隔线',
    node: <SplitDemo />,
    code: [
      '// split 在相邻子项之间插入分隔符',
      'const sep = <View style={{ width: 1, height: 14, backgroundColor: token.colorSplit }} />;',
      '<Space split={sep}>',
      '  <Text>提交</Text>',
      '  <Text>保存</Text>',
      '  <Text>取消</Text>',
      '</Space>',
    ].join('\n'),
  },
  {
    name: '自动换行',
    desc: 'wrap 换行，size 传 [水平, 垂直] 分设行列间距',
    node: <WrapDemo />,
    code: [
      '// wrap 换行；size 传 [水平, 垂直] 分设行列间距',
      '<Space size={[8, 12]} wrap>',
      "  {tags.map((t) => <Button key={t} size=\"small\">{t}</Button>)}",
      '</Space>',
    ].join('\n'),
  },
  {
    name: '交叉轴对齐',
    desc: 'align 控制子项在交叉轴上的对齐方式',
    node: <AlignDemo />,
    code: [
      "// align 控制交叉轴对齐：start / end / center / baseline",
      '<Space align="center" size="middle">',
      '  <View style={{ height: 60 }} />',
      '  <View style={{ height: 36 }} />',
      '  <View style={{ height: 48 }} />',
      '</Space>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'direction', desc: '排列方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
  { name: 'size', desc: '间距，元组分设 [水平, 垂直]', type: "number | 'small'|'middle'|'large' | [h, v]", default: "'small'" },
  { name: 'align', desc: '交叉轴对齐', type: "'start' | 'end' | 'center' | 'baseline'", default: '–' },
  { name: 'wrap', desc: '超出是否换行', type: 'boolean', default: 'false' },
  { name: 'split', desc: '子项之间的分隔符', type: 'ReactNode', default: '–' },
  { name: 'block', desc: '占满父容器宽度', type: 'boolean', default: 'false' },
];

const TOKENS: TokenRow[] = [
  { name: 'marginXS / margin / marginLG', desc: 'size 三档对应的间距', default: '8 / 16 / 24' },
  { name: 'colorSplit', desc: 'split 分隔线常用色', default: '–' },
];

export function SpaceDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
