// CAROUSEL：走马灯。统一走 DemoPage 多段式，覆盖 基础 / 图片轮播 / 圆点位置 / 无箭头 / 不循环 / 受控。
import React from 'react';
import { Carousel, ImageBox, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 生成一屏色块 */
function makeSlides(): React.ReactElement[] {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { token } = useToken();
  const bg = [token.colorPrimaryBg, token.colorSuccessBg, token.colorWarningBg];
  const label = ['第一屏', '第二屏', '第三屏'];
  return label.map((t, i) => (
    <View key={t} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg[i] }}>
      <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText }}>{t}</Text>
    </View>
  ));
}

/** 基础 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ maxWidth: 640 }}>
      <Carousel height={200} autoPlay={3000} slides={makeSlides()} />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>每 3 秒自动切换 · 点圆点或箭头手动切</Text>
    </View>
  );
}

/** 图片轮播：Lorem Picsum 定尺寸随机图（与瀑布流同源），cover 铺满 + caption 压图。
 * 传 preload 让 Carousel 挂载即预热各屏图，轮播切到任意屏时无首帧留白。 */
function ImageDemo(): React.ReactElement {
  const { token } = useToken();
  const seeds = [10, 24, 33, 48, 66];
  const uris = seeds.map((s) => `https://picsum.photos/seed/${s}/800/450`);
  const slides = uris.map((src, i) => (
    <ImageBox key={src} src={src} width="100%" height="100%" radius={0} caption={`Picsum #${seeds[i]}`} />
  ));
  return (
    <View style={{ maxWidth: 640 }}>
      <Carousel height={280} autoPlay={3500} slides={slides} preload={uris} />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>已传 preload 预热 5 屏图 · 首次加载即无留白（未预加载时新屏会先露占位底再“点亮”）</Text>
    </View>
  );
}

/** 圆点位置 */
function DotPosDemo(): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      <View style={{ flex: 1, minWidth: 180 }}><Carousel height={150} autoPlay={0} dotPosition="top" slides={makeSlides()} /></View>
      <View style={{ flex: 1, minWidth: 180 }}><Carousel height={150} autoPlay={0} dotPosition="left" slides={makeSlides()} /></View>
      <View style={{ flex: 1, minWidth: 180 }}><Carousel height={150} autoPlay={0} dotPosition="right" slides={makeSlides()} /></View>
    </View>
  );
}

/** 不循环：停在首屏，左箭头隐藏 */
function NoLoopDemo(): React.ReactElement {
  return (
    <View style={{ maxWidth: 520 }}>
      <Carousel height={180} autoPlay={0} infinite={false} defaultActiveIndex={0} slides={makeSlides()} />
    </View>
  );
}

/** 受控：dots 回显 + 手动切换 */
function ControlledDemo(): React.ReactElement {
  const { token } = useToken();
  const [i, setI] = React.useState(1);
  return (
    <View style={{ maxWidth: 520, gap: token.marginSM }}>
      <Carousel height={180} autoPlay={0} arrows={false} activeIndex={i} onChange={setI} slides={makeSlides()} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>当前第 {i + 1} 屏 · arrows=false，仅底部圆点可点</Text>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '自动播放 + 底部圆点 + 左右箭头，切换来向平移淡入',
    node: <BasicDemo />,
    code: [
      'import { Carousel } from "react-native-flux-desktop";',
      '',
      '// autoPlay 为自动切换间隔（ms），0 关闭',
      '<Carousel height={200} autoPlay={3000} slides={slides} />',
    ].join('\n'),
  },
  {
    name: '图片轮播',
    desc: 'Lorem Picsum 随机图铺满（同瀑布流图源），配 caption 压图',
    node: <ImageDemo />,
    code: [
      'import { Carousel, ImageBox } from "react-native-flux-desktop";',
      '',
      'const uris = seeds.map((s) => `https://picsum.photos/seed/${s}/800/450`);',
      'const slides = uris.map((src, i) => (',
      '  <ImageBox key={src} src={src} width="100%" height="100%" radius={0} caption={`Picsum #${seeds[i]}`} />',
      '));',
      '',
      '// preload 让挂载即预热各屏图，切屏无首帧留白',
      '<Carousel height={280} autoPlay={3500} slides={slides} preload={uris} />',
    ].join('\n'),
  },
  {
    name: '圆点位置',
    desc: 'dotPosition = top / left / right（此排关闭自动播放）',
    node: <DotPosDemo />,
    code: [
      'import { Carousel } from "react-native-flux-desktop";',
      '',
      '// dotPosition 控制指示圆点位置',
      '<Carousel height={150} autoPlay={0} dotPosition="top" slides={slides} />',
      '<Carousel height={150} autoPlay={0} dotPosition="left" slides={slides} />',
      '<Carousel height={150} autoPlay={0} dotPosition="right" slides={slides} />',
    ].join('\n'),
  },
  {
    name: '无箭头',
    desc: 'arrows = false 仅保留圆点',
    node: <NoArrowDemo />,
    code: [
      'import { Carousel } from "react-native-flux-desktop";',
      '',
      '// arrows=false 隐藏左右箭头，仅保留圆点',
      '<Carousel height={180} autoPlay={0} arrows={false} slides={slides} />',
    ].join('\n'),
  },
  {
    name: '不循环',
    desc: 'infinite = false 停在首屏，左箭头隐藏（不可再往前）',
    node: <NoLoopDemo />,
    code: [
      'import { Carousel } from "react-native-flux-desktop";',
      '',
      '// infinite=false 不循环，停在首屏',
      '<Carousel height={180} autoPlay={0} infinite={false} defaultActiveIndex={0} slides={slides} />',
    ].join('\n'),
  },
  {
    name: '受控',
    desc: 'activeIndex + onChange，外部驱动',
    node: <ControlledDemo />,
    code: [
      'import { Carousel } from "react-native-flux-desktop";',
      '',
      '// activeIndex + onChange 受控当前屏',
      'const [i, setI] = useState(1);',
      '<Carousel height={180} autoPlay={0} arrows={false} activeIndex={i} onChange={setI} slides={slides} />',
    ].join('\n'),
  },
];

/** 无箭头 */
function NoArrowDemo(): React.ReactElement {
  return (
    <View style={{ maxWidth: 520 }}>
      <Carousel height={180} autoPlay={0} arrows={false} slides={makeSlides()} />
    </View>
  );
}

const API: ApiRow[] = [
  { name: 'slides', desc: '每屏内容节点', type: 'ReactNode[]', default: '–' },
  { name: 'autoPlay', desc: '自动播放间隔（ms），0 关闭', type: 'number', default: '4000' },
  { name: 'arrows', desc: '显示左右箭头', type: 'boolean', default: 'true' },
  { name: 'dots', desc: '显示指示圆点', type: 'boolean', default: 'true' },
  { name: 'dotPosition', desc: '圆点位置', type: "'top'|'bottom'|'left'|'right'", default: "'bottom'" },
  { name: 'infinite', desc: '是否循环', type: 'boolean', default: 'true' },
  { name: 'activeIndex', desc: '受控当前屏', type: 'number', default: '–' },
  { name: 'onChange', desc: '切换回调', type: '(i) => void', default: '–' },
  { name: 'height', desc: '容器高度', type: 'number', default: '200' },
  { name: 'preload', desc: '需预加载的图片 uri（挂载即解码入缓存，切屏无留白）', type: 'string[]', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorTextTertiary', desc: '圆点色（选中仅形状拉长，不另着色）', default: '三级文本' },
  { name: 'borderRadiusLG', desc: '容器圆角', default: '8' },
];

export function CarouselDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
