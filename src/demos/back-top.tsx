// ANCHOR / BACKTOP：滚动管线演示。统一走 DemoPage 两段式。
// 管线路径：ScrollView.onScroll 上报偏移 → 受控 scrollY 定位。Anchor 点击跳章节 + 滚动联动高亮；
// BackTop 超过阈值右下角淡入浮现、点击回顶。
import React from 'react';
import { Anchor, BackTop, ScrollView, Text, View, useToken } from 'react-native-flux-desktop';
import type { AnchorLink } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const SEC = 220;

/** 章节块：定高、着色，便于看滚动定位 */
function Block(props: { title: string; h: number; bg: string }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        height: props.h,
        marginBottom: token.margin,
        borderRadius: token.borderRadiusLG,
        backgroundColor: props.bg,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        padding: token.paddingLG,
      }}
    >
      <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>{props.title}</Text>
      <Text style={{ fontSize: token.fontSize, color: token.colorTextTertiary, marginTop: token.marginXS }}>
        滚动此区域，左侧锚点随位置高亮；点锚点直接把本节滚到顶部。
      </Text>
    </View>
  );
}

/** 锚点导航：左侧 Anchor + 右侧受控滚动区，点击跳转 + 滚动联动 */
function AnchorNavDemo(): React.ReactElement {
  const { token } = useToken();
  const [offset, setOffset] = React.useState(0);
  const [active, setActive] = React.useState('#a1');
  const links: AnchorLink[] = [
    { href: '#a1', title: '概述', children: [{ href: '#a1b', title: '小结' }] },
    { href: '#a2', title: '布局' },
    { href: '#a3', title: '主题' },
  ];
  const hrefY: Record<string, number> = { '#a1': 0, '#a1b': 60, '#a2': SEC, '#a3': SEC * 2 };
  return (
    <View style={{ height: 320, flexDirection: 'row' }}>
      <View style={{ width: 150, paddingRight: token.padding, paddingTop: token.paddingXS }}>
        <Anchor
          items={links}
          activeHref={active}
          showLine={false}
          onLinkClick={(href) => {
            setActive(href);
            setOffset(hrefY[href] ?? 0);
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          scrollY={offset}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            setOffset(y);
            setActive(y >= SEC * 2 ? '#a3' : y >= SEC ? '#a2' : '#a1');
          }}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingRight: token.paddingXS }}
        >
          <Block title="概述" h={SEC - 24} bg={token.colorPrimaryBg} />
          <Block title="布局" h={SEC - 24} bg={token.colorSuccessBg} />
          <Block title="主题" h={SEC - 24} bg={token.colorWarningBg} />
        </ScrollView>
      </View>
    </View>
  );
}

/** 返回顶部：滚动超阈值右下角淡入，点击回顶 */
function BackTopDemo(): React.ReactElement {
  const { token } = useToken();
  const [offset, setOffset] = React.useState(0);
  const [w, setW] = React.useState(0);
  return (
    <View style={{ height: 300, position: 'relative' }} onLayout={(e: { nativeEvent: { layout: { w: number } } }) => setW(e.nativeEvent.layout.w)}>
      <ScrollView
        scrollY={offset}
        onScroll={(e) => setOffset(e.nativeEvent.contentOffset.y)}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: token.padding }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <Block
            key={i}
            title={`内容块 ${i + 1}`}
            h={64}
            bg={i % 2 ? token.colorFillQuaternary : token.colorPrimaryBg}
          />
        ))}
      </ScrollView>
      {w > 0 ? <BackTop scrollY={offset} left={w - 56} top={236} onPress={() => setOffset(0)} /> : null}
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '锚点导航',
    desc: '点左侧锚点跳转对应章节，滚动时自动高亮当前项（受控 scrollY 双向联动）；showLine={false} 隐藏左侧竖线',
    node: <AnchorNavDemo />,
    code: [
      'import { Anchor, ScrollView } from "react-native-flux-desktop";',
      '',
      'const links = [',
      "  { href: '#a1', title: '概述', children: [{ href: '#a1b', title: '小结' }] },",
      "  { href: '#a2', title: '布局' },",
      "  { href: '#a3', title: '主题' },",
      '];',
      '',
      '// 受控 scrollY：点锚点 setOffset，onScroll 回写高亮',
      '<Anchor',
      '  items={links}',
      '  activeHref={active}',
      '  showLine={false}',
      '  onLinkClick={(href) => { setActive(href); setOffset(hrefY[href] ?? 0); }}',
      '/>',
      '<ScrollView scrollY={offset} onScroll={(e) => setOffset(e.nativeEvent.contentOffset.y)}>',
      '  {/* 章节块 */}',
      '</ScrollView>',
    ].join('\n'),
  },
  {
    name: '返回顶部',
    desc: '滚动超过 120px，右下角 BackTop 淡入浮现，点击回到顶部',
    node: <BackTopDemo />,
    code: [
      '// 滚动超阈值（默认 120px）右下角淡入，点击回顶',
      'import { BackTop, ScrollView } from "react-native-flux-desktop";',
      '',
      '<ScrollView scrollY={offset} onScroll={(e) => setOffset(e.nativeEvent.contentOffset.y)}>',
      '  {/* 长内容 */}',
      '</ScrollView>',
      '<BackTop scrollY={offset} visibilityHeight={120} onPress={() => setOffset(0)} />',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'Anchor.items', desc: '锚点树，children 缩进一级', type: 'AnchorLink[]', default: '–' },
  { name: 'Anchor.activeHref', desc: '当前高亮项（受控）', type: 'string', default: '–' },
  { name: 'Anchor.onLinkClick', desc: '点击锚点回调', type: '(href) => void', default: '–' },
  { name: 'Anchor.title', desc: '锚点组上方标题', type: 'string', default: '–' },
    { name: 'Anchor.showLine', desc: '是否显示左侧垂直线轨道', type: 'boolean', default: 'true' },
  { name: 'BackTop.scrollY', desc: '当前滚动偏移（onScroll 喂入）', type: 'number', default: '–' },
  { name: 'BackTop.visibilityHeight', desc: '超过该高度才显示', type: 'number', default: '120' },
  { name: 'BackTop.onPress', desc: '点击回顶', type: '() => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary', desc: '激活锚点的圆点与文字', default: '–' },
  { name: 'colorSplit', desc: '锚点竖线轨道 / 圆点描边', default: '–' },
  { name: 'controlHeightLG', desc: 'BackTop 按钮直径', default: '40' },
];

export function BackTopAnchorDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
