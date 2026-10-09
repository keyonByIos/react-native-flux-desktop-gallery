// GRADIENT：渐变背景。本自研栈的 View 只有纯色 backgroundColor，没有原生 CSS 渐变；
// 与 AreaChart 用「纵向拆条 + alpha 衰减」伪造渐变同理，这里用「一组平行细条 + 容器旋转 + overflow 裁切」
// 伪造任意角度的线性渐变：每条取多色阶上插值出的颜色，相邻条 +1px 重叠消缝，旋转后铺满外框。
// 纯组合示例（不新增库组件），可直接用于 Hero 卡、Banner、进度/分割条、标签底纹等。
import React from 'react';
import { View, Text, Button, Icon, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow } from '../DemoPage';

// ---------- 颜色插值 ----------
interface RGB { r: number; g: number; b: number; a: number }

/** 解析 #rgb / #rrggbb / #rrggbbaa → RGBA；失败返回全透明 */
function parseColor(hex: string): RGB {
  let h = (hex || '').trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

/** 等距色阶在 t∈[0,1] 处取色（线性插值 RGBA） */
function sampleStops(colors: string[], t: number): string {
  if (colors.length === 0) return 'rgba(0,0,0,0)';
  if (colors.length === 1) return colors[0];
  const c = Math.min(Math.max(t, 0), 1) * (colors.length - 1);
  const i = Math.min(Math.floor(c), colors.length - 2);
  const f = c - i;
  const a = parseColor(colors[i]);
  const b = parseColor(colors[i + 1]);
  const lerp = (x: number, y: number): number => Math.round(x + (y - x) * f);
  return `rgba(${lerp(a.r, b.r)}, ${lerp(a.g, b.g)}, ${lerp(a.b, b.b)}, ${(a.a + (b.a - a.a) * f).toFixed(3)})`;
}

interface GradientProps {
  /** 色阶（>=2，等距分布；支持 8 位 hex 透明度） */
  colors: string[];
  /** 渐变轴角度（度）：0=水平，90=纵向，45/135=对角 */
  angle?: number;
  width: number;
  height: number;
  radius?: number;
  /** 平行条数量，越大越平滑（默认 40） */
  steps?: number;
  align?: 'flex-start' | 'center' | 'flex-end';
  justify?: 'flex-start' | 'center' | 'flex-end';
  padding?: number;
  style?: { [k: string]: any };
  children?: React.ReactNode;
}

/** 线性渐变面：平行条 + 旋转 + overflow 裁切。children 叠在渐变之上。 */
function Gradient(props: GradientProps): React.ReactElement {
  const { token } = useToken();
  const {
    colors, angle = 0, width, height, radius = token.borderRadiusLG, steps = 40,
    align = 'center', justify = 'center', padding = 0, style, children,
  } = props;

  const D = Math.ceil(Math.sqrt(width * width + height * height)); // 覆盖对角线长度
  const barW = D / steps;
  const bars: React.ReactNode[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i + 0.5) / steps;
    bars.push(
      <View
        key={i}
        style={{ position: 'absolute', left: Math.floor(i * barW), top: 0, width: barW + 1, height: D, backgroundColor: sampleStops(colors, t) }}
      />,
    );
  }

  return (
    <View style={{ width, height, borderRadius: radius, overflow: 'hidden', position: 'relative', ...style }}>
      {/* 旋转内层：D×D，居中，绕自身中心旋转 -angle → 渐变轴随之倾斜 */}
      <View
        style={{
          position: 'absolute',
          width: D,
          height: D,
          left: (width - D) / 2,
          top: (height - D) / 2,
          transform: [{ rotate: `${-angle}deg` }],
          transformOrigin: '50% 50%',
        }}
      >
        {bars}
      </View>
      {/* 内容层 */}
      {children != null ? (
        <View style={{ position: 'absolute', left: 0, top: 0, width, height, padding, alignItems: align, justifyContent: justify, gap: token.marginXS }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

// ---------- 各示例 ----------

/** 方向：同一双色在 0/45/90/135 四个角度下 */
function AngleDemo(): React.ReactElement {
  const { token } = useToken();
  const two = ['#1677FF', '#22C1A6'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.margin }}>
      {[0, 45, 90, 135].map((a) => (
        <View key={a} style={{ gap: token.marginXXS }}>
          <Gradient colors={two} angle={a} width={150} height={92} />
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, textAlign: 'center' }}>{a}°</Text>
        </View>
      ))}
    </View>
  );
}

/** 多色阶：彩虹 / 晚霞 / 海洋 / 霓虹，等距插值 */
function MultiStopDemo(): React.ReactElement {
  const { token } = useToken();
  const rows: { label: string; colors: string[] }[] = [
    { label: '彩虹', colors: ['#FF4D4F', '#FAAD14', '#52C41A', '#1677FF', '#722ED1'] },
    { label: '晚霞', colors: ['#F97316', '#DB2777', '#7C3AED'] },
    { label: '海洋', colors: ['#0EA5E9', '#2563EB', '#1E3A8A'] },
    { label: '霓虹', colors: ['#22D3EE', '#A855F7', '#EC4899'] },
  ];
  return (
    <View style={{ gap: token.marginSM }}>
      {rows.map((r) => (
        <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Text style={{ width: 44, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{r.label}</Text>
          <Gradient colors={r.colors} angle={0} width={420} height={44} steps={64} radius={token.borderRadius} />
        </View>
      ))}
    </View>
  );
}

/** Hero 卡：渐变作底，内容（标题 / 大数字 / 按钮 / 装饰圆）叠于其上 */
function HeroDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <Gradient colors={['#3B5BDB', '#5F3DC4', '#7048E8']} angle={20} width={340} height={168} radius={token.borderRadiusLG} align="flex-start" justify="flex-start" padding={token.paddingLG}>
      {/* 装饰光晕 */}
      <View style={{ position: 'absolute', right: -30, top: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <View style={{ position: 'absolute', right: 30, bottom: -40, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <Text style={{ fontSize: token.fontSize, color: 'rgba(255,255,255,0.85)' }}>总资产估值</Text>
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFFFFF', lineHeight: 38 }}>$ 128,640.50</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="trendUp" size={14} color="#B7F0C8" />
        <Text style={{ fontSize: token.fontSizeSM, color: '#B7F0C8' }}>较昨日 +4.20%</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: token.marginSM, marginTop: token.marginXS }}>
        <Button size="small" type="primary">充值</Button>
        <Button size="small">提现</Button>
      </View>
    </Gradient>
  );
}

/** 半透明叠加：透明→不透明，叠在容器底色上做「蒙层 / 扫光」 */
function OverlayDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ width: 420, height: 96, borderRadius: token.borderRadiusLG, backgroundColor: token.colorFillSecondary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <Gradient
        colors={['rgba(0,0,0,0)', '#1677FF']}
        angle={90}
        width={420}
        height={96}
        radius={0}
        justify="flex-end"
        align="flex-start"
        padding={token.paddingSM}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>由下至上的透明→主色蒙层（可作 Banner 压暗 / 扫光）</Text>
      </Gradient>
    </View>
  );
}

/** 细条：渐变进度条 / 分割条 / 文本标签底纹 */
function BarsDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginSM, width: 420 }}>
      <Gradient colors={['#1677FF', '#22C1A6']} angle={0} width={420} height={10} steps={60} radius={5} />
      <Gradient colors={['#F5222D', '#FA8C16', '#FAAD14']} angle={0} width={420} height={4} steps={60} radius={2} />
      <View style={{ flexDirection: 'row', gap: token.marginSM }}>
        {['新上线', '热门', '限时'].map((t, i) => (
          <Gradient key={t} colors={[['#1677FF', '#22C1A6', '#FA8C16'][i], ['#4096FF', '#52C41A', '#FFC53D'][i]]} angle={0} width={64} height={26} steps={24} radius={13}>
            <Text style={{ color: '#FFFFFF', fontSize: token.fontSizeSM, fontWeight: '600' }}>{t}</Text>
          </Gradient>
        ))}
      </View>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '方向',
    desc: '同一双色在 0°/45°/90°/135° 下的渐变轴朝向（angle 控制旋转）',
    node: <AngleDemo />,
    code: [
      '<Gradient colors={[\'#1677FF\', \'#22C1A6\']} angle={45} width={150} height={92} />',
    ].join('\n'),
  },
  {
    name: '多色阶',
    desc: 'colors 传 2 个以上即等距分段线性插值，条数越多过渡越平滑（steps）',
    node: <MultiStopDemo />,
    code: [
      '<Gradient',
      '  colors={[\'#FF4D4F\', \'#FAAD14\', \'#52C41A\', \'#1677FF\', \'#722ED1\']}',
      '  angle={0} width={420} height={44} steps={64}',
      '/>',
    ].join('\n'),
  },
  {
    name: 'Hero 卡片',
    desc: '渐变作底，标题 / 数值 / 按钮 / 装饰光晕叠于其上（children 自动居中/对齐）',
    node: <HeroDemo />,
    code: [
      '<Gradient colors={[\'#3B5BDB\', \'#5F3DC4\']} angle={20} width={340} height={168}',
      '  align="flex-start" justify="flex-start" padding={24}>',
      '  <Text>总资产估值</Text>',
      '  <Text>$ 128,640.50</Text>',
      '</Gradient>',
    ].join('\n'),
  },
  {
    name: '半透明叠加',
    desc: '色阶用 rgba / 8 位 hex 表达透明度，做 Banner 压暗、蒙层、扫光',
    node: <OverlayDemo />,
    code: [
      '// 色阶用 rgba / 8 位 hex 表达透明度，做透明→不透明蒙层',
      '<Gradient',
      '  colors={[\'rgba(0,0,0,0)\', \'#1677FF\']}',
      '  angle={90} width={420} height={96} radius={0}',
      '  justify="flex-end" align="flex-start" padding={12}',
      '>',
      '  <Text style={{ color: "#FFFFFF" }}>由下至上的透明→主色蒙层</Text>',
      '</Gradient>',
    ].join('\n'),
  },
  {
    name: '细条与标签',
    desc: '同一实现可直接产出渐变进度条、分割条、胶囊标签底纹',
    node: <BarsDemo />,
    code: [
      '// 同一实现产出渐变进度条 / 分割条 / 胶囊标签底纹',
      '<Gradient colors={[\'#1677FF\', \'#22C1A6\']} angle={0} width={420} height={10} steps={60} radius={5} />',
      '<Gradient colors={[\'#F5222D\', \'#FA8C16\', \'#FAAD14\']} angle={0} width={420} height={4} steps={60} radius={2} />',
      '// children 叠于渐变之上→胶囊标签',
      '<Gradient colors={[\'#1677FF\', \'#4096FF\']} width={64} height={26} steps={24} radius={13}>',
      '  <Text style={{ color: "#FFFFFF" }}>新上线</Text>',
      '</Gradient>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'colors', desc: '色阶数组，等距分布；支持 #rgb/#rrggbb/#rrggbbaa/rgba', type: 'string[]', default: '–' },
  { name: 'angle', desc: '渐变轴角度（度）：0 水平 / 90 纵向 / 45·135 对角', type: 'number', default: '0' },
  { name: 'width / height', desc: '渐变面尺寸（用于计算覆盖对角线与铺条）', type: 'number', default: '–' },
  { name: 'steps', desc: '平行条数量，越大越平滑、节点越多', type: 'number', default: '40' },
  { name: 'radius', desc: '圆角（容器 overflow 裁切旋转后的铺条）', type: 'number', default: 'token.borderRadiusLG' },
  { name: 'align / justify / padding', desc: 'children 内容层的对齐与内边距', type: 'string / string / number', default: "center / center / 0" },
  { name: 'children', desc: '叠在渐变之上的内容', type: 'ReactNode', default: '–' },
];

export function GradientDemo(): React.ReactElement {
  return (
    <DemoPage
      desc="自研栈 View 仅支持纯色背景，本页用「平行铺条 + 容器旋转 + overflow 裁切」组合出任意角度线性渐变（与 AreaChart 伪造渐变同法），非独立库组件"
      demos={DEMOS}
      api={API}
    />
  );
}
