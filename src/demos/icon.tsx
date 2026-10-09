// ICON：矢量图标总览。统一走 DemoPage 三段式容器（demo 列表 → API 表 → Token 表）。
// 名字 → SVG path，走 Skia Path2D 光栅化，跨平台一致、无缺字；从 iconPaths 字典动态取全部图标。
import React from 'react';
import { Icon, Text, View, useToken, iconPaths } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 按 mode 把全部图标拆成两组：实底（fill）与线框（stroke，含未标 mode 的默认） */
function partitionIcons(): { stroke: string[]; fill: string[] } {
  const stroke: string[] = [];
  const fill: string[] = [];
  for (const name of Object.keys(iconPaths)) {
    if (iconPaths[name].mode === 'fill') fill.push(name);
    else stroke.push(name);
  }
  stroke.sort();
  fill.sort();
  return { stroke, fill };
}

/** 自动找出「线框 / 实底」成对的名字：凡 X-filled 存在且 X（线框）也存在，即为一对 */
function findPairs(): { stroke: string; fill: string }[] {
  const pairs: { stroke: string; fill: string }[] = [];
  for (const name of Object.keys(iconPaths)) {
    if (!name.endsWith('-filled')) continue;
    const base = name.slice(0, -'-filled'.length);
    const def = iconPaths[base];
    if (def && def.mode !== 'fill') pairs.push({ stroke: base, fill: name });
  }
  pairs.sort((a, b) => a.stroke.localeCompare(b.stroke));
  return pairs;
}

const { stroke: STROKE, fill: FILL } = partitionIcons();
const PAIRS = findPairs();

/** 图标网格墙：给定名字列表铺格，每格图标 + 名称标签 */
function IconWall(props: { names: string[] }): React.ReactElement {
  const { token } = useToken();
  const cell = 84;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {props.names.map((n) => (
        <View key={n} style={{ width: cell, alignItems: 'center', paddingVertical: 8 }}>
          <Icon name={n} size={24} color={token.colorText} />
          <Text
            style={{ fontSize: 10, color: token.colorTextTertiary, marginTop: 4, textAlign: 'center' }}
            numberOfLines={1}
          >
            {n}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** 成对对照墙：每格左线框、右实底（主色），下方标基名 */
function PairWall(): React.ReactElement {
  const { token } = useToken();
  const cell = 110;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {PAIRS.map((p) => (
        <View key={p.fill} style={{ width: cell, alignItems: 'center', paddingVertical: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name={p.stroke} size={22} color={token.colorText} />
            <Icon name={p.fill} size={22} color={token.colorText} />
          </View>
          <Text
            style={{ fontSize: 10, color: token.colorTextTertiary, marginTop: 4, textAlign: 'center' }}
            numberOfLines={1}
          >
            {p.stroke}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** 尺寸梯度：同一图标按 size 等比缩放 */
function SizeWall(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: token.marginMD }}>
      <Icon name="star" size={14} />
      <Icon name="star" size={18} />
      <Icon name="star" size={24} />
      <Icon name="star" size={32} />
      <Icon name="star" size={40} />
    </View>
  );
}

/** 语义配色：color 走 token，随主题 / 主色联动 */
function SemanticWall(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginMD }}>
      <Icon name="infoCircle-filled" size={24} color={token.colorPrimary} />
      <Icon name="checkCircle-filled" size={24} color={token.colorSuccess} />
      <Icon name="warning" size={24} color={token.colorWarning} />
      <Icon name="closeCircle-filled" size={24} color={token.colorError} />
      <Icon name="star-filled" size={24} color={token.colorWarning} />
      <Icon name="heart-filled" size={24} color={token.colorError} />
    </View>
  );
}

/** color 支持的字符串写法样例：十六进制（3/6/8 位）· rgb/rgba · 颜色名 */
const COLOR_SAMPLES: { label: string; value: string }[] = [
  { label: '#f00', value: '#f00' },
  { label: '#22c55e', value: '#22c55e' },
  { label: '#3b82f680', value: '#3b82f680' },
  { label: 'rgb(249,115,22)', value: 'rgb(249,115,22)' },
  { label: 'rgba(236,72,153,.5)', value: 'rgba(236,72,153,0.5)' },
  { label: 'tomato', value: 'tomato' },
];

/** 颜色取值：同一图标用不同 CSS 颜色串着色，浅底 chip 上凸显带 alpha 的写法 */
function ColorWall(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginMD }}>
      {COLOR_SAMPLES.map((c) => (
        <View key={c.label} style={{ alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: token.borderRadius,
              backgroundColor: token.colorFillSecondary,
            }}
          >
            <Icon name="heart-filled" size={28} color={c.value} />
          </View>
          <Text style={{ fontSize: 10, color: token.colorTextTertiary }}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

/** 动画：spin 绕心旋转 · breath 呼吸脉动 */
function AnimWall(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: token.marginXL }}>
      <View style={{ alignItems: 'center', gap: token.marginXS }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginMD }}>
          <Icon name="loading" size={28} color={token.colorPrimary} animate="spin" />
          <Icon name="setting" size={28} color={token.colorTextSecondary} animate="spin" animateDuration={2400} />
          <Icon name="sync" size={28} color={token.colorTextSecondary} animate="spin" />
        </View>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>spin · 绕心旋转</Text>
      </View>
      <View style={{ alignItems: 'center', gap: token.marginXS }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginMD }}>
          <Icon name="heart-filled" size={28} color={token.colorError} animate="breath" />
          <Icon name="bell-filled" size={28} color={token.colorWarning} animate="breath" animateDuration={2400} />
          <Icon name="bulb" size={28} color={token.colorPrimary} animate="breath" />
        </View>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>breath · 呼吸脉动</Text>
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '线框 / 实底 成对',
    desc: `凡 X 与 X-filled 并存者并列对照：左描边线框 · 右实心主色，共 ${PAIRS.length} 对`,
    node: <PairWall />,
    code: [
      'import { Icon } from "react-native-flux-desktop";',
      '',
      '// 同名去掉 -filled 即线框；两者并存即成对（描边 vs 实心）',
      '<Icon name="heart" />         // 线框',
      '<Icon name="heart-filled" />  // 实底',
    ].join('\n'),
  },
  {
    name: '线框图标',
    desc: `stroke · 描边线条，共 ${STROKE.length} 个`,
    node: <IconWall names={STROKE} />,
    code: [
      '// stroke 模式：描边线条，线宽 strokeWidth 走 24 网格、随 size 等比缩放',
      '<Icon name="search" size={24} />',
      '<Icon name="setting" size={24} strokeWidth={1.5} />',
    ].join('\n'),
  },
  {
    name: '实底图标',
    desc: `fill · 实心填充，共 ${FILL.length} 个`,
    node: <IconWall names={FILL} />,
    code: [
      '// fill 模式：实心填充（名字多以 -filled 结尾）',
      '<Icon name="star-filled" size={24} />',
      '<Icon name="heart-filled" size={24} />',
    ].join('\n'),
  },
  {
    name: '尺寸梯度',
    desc: 'size 指定边长（px），矢量等比缩放、12~40 皆清晰',
    node: <SizeWall />,
    code: [
      '<Icon name="star" size={14} />',
      '<Icon name="star" size={18} />',
      '<Icon name="star" size={24} />',
      '<Icon name="star" size={32} />',
      '<Icon name="star" size={40} />',
    ].join('\n'),
  },
  {
    name: '语义配色',
    desc: 'color 走 token，随主题 / 主色实时联动',
    node: <SemanticWall />,
    code: [
      'import { Icon, useToken } from "react-native-flux-desktop";',
      'const { token } = useToken();',
      '',
      '<Icon name="infoCircle-filled"  color={token.colorPrimary} />',
      '<Icon name="checkCircle-filled" color={token.colorSuccess} />',
      '<Icon name="warning"            color={token.colorWarning} />',
      '<Icon name="closeCircle-filled" color={token.colorError} />',
    ].join('\n'),
  },
  {
    name: '颜色取值',
    desc: 'color 接受任意 CSS 颜色串：#RGB / #RRGGBB / #RRGGBBAA（带透明度）/ rgb() / rgba() / 颜色名',
    node: <ColorWall />,
    code: [
      '// color 接受任意 CSS 颜色串',
      '<Icon name="heart-filled" color="#f00" />',
      '<Icon name="heart-filled" color="#22c55e" />',
      '<Icon name="heart-filled" color="#3b82f680" />        // 8 位带 alpha',
      '<Icon name="heart-filled" color="rgb(249,115,22)" />',
      '<Icon name="heart-filled" color="rgba(236,72,153,0.5)" />',
      '<Icon name="heart-filled" color="tomato" />',
    ].join('\n'),
  },
  {
    name: '动画',
    desc: 'animate：spin 绕心旋转 · breath 呼吸脉动（明暗 + 缩放）',
    node: <AnimWall />,
    code: [
      '// animate：spin 绕心旋转 · breath 呼吸脉动；animateDuration 调周期(ms)',
      '<Icon name="loading" animate="spin" />',
      '<Icon name="setting" animate="spin" animateDuration={2400} />',
      '<Icon name="heart-filled" animate="breath" color="#ef4444" />',
      '<Icon name="bell-filled" animate="breath" animateDuration={2400} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'name', desc: '图标名，取自 iconPaths 字典', type: 'IconName | string', default: '–' },
  { name: 'path', desc: '原始 SVG path，设置后绕过字典直接绘制', type: 'string', default: '–' },
  { name: 'vb', desc: 'path 模式下的 viewBox 边长（映射到 size 盒）', type: 'number', default: '24' },
  { name: 'size', desc: '边长（px）', type: 'number', default: 'fontSize' },
  { name: 'color', desc: '颜色，随主题切换', type: 'string', default: 'colorText' },
  { name: 'strokeWidth', desc: '描边线宽（24 网格单位，随 size 等比缩放）', type: 'number', default: '2' },
  { name: 'rotate', desc: '绕中心旋转角度（度）', type: 'number', default: '0' },
  { name: 'mode', desc: '绘制模式覆盖（path 模式默认 stroke）', type: "'stroke' | 'fill'", default: '自动' },
  { name: 'animate', desc: '内置循环动画：spin 旋转 · breath 呼吸', type: "'spin' | 'breath'", default: '–' },
  { name: 'animateDuration', desc: '动画周期（ms），配合 animate', type: 'number', default: 'spin 900 / breath 1800' },
];

const TOKENS: TokenRow[] = [
  { name: 'fontSize', desc: '缺省 size（未传 size 时的边长）', default: '14' },
  { name: 'colorText', desc: '缺省 color（未传 color 时的着色）', default: 'colorText' },
];

export function IconDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
