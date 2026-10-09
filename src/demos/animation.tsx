// ANIMATION：动画库能力全景（DemoPage 多段式）。
// 交互弹簧 / 缓动曲线 / 弹簧实验室 / Stagger 错峰 / Transition 进出场 / 预设对比墙 / 序列编排 / FLIP。
// 动态过程静态帧只见落位态，手感需实机体验；曲线柱状采样（v>1 标红）抓帧可验证过冲。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  useToken,
  useTransformTween,
  useSpring,
  useAnimation,
  Flip,
  Easing,
  Stagger,
  StaggerItem,
  Transition,
  runSequence,
  presets,
  styleAt,
  type PresetName,
} from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

// A —— 交互抬升卡：状态 → 目标变换 → 弹簧平滑
function LiftCard(props: { title: string; color: string }): React.ReactElement {
  const { token } = useToken();
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const spec = press
    ? { translateY: 2, scale: 0.97 }
    : hover
    ? { translateY: -12, scale: 1.05 }
    : { translateY: 0, scale: 1 };
  // stiffness 200 / damping 20 → ζ≈0.71：几乎不过冲、顺滑落位（慢而大幅 > 快而小）
  const transform = useTransformTween(spec, { mode: 'spring', stiffness: 200, damping: 20 });
  return (
    <Pressable
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPressIn={() => setPress(true)}
      onPressOut={() => setPress(false)}
      style={{
        width: 168,
        height: 96,
        padding: token.padding,
        justifyContent: 'center',
        borderRadius: token.borderRadiusLG,
        backgroundColor: props.color,
        transform,
      }}
    >
      <Text style={{ color: token.colorTextLightSolid, fontSize: token.fontSizeLG, fontWeight: '600' }}>{props.title}</Text>
      <Text style={{ color: token.colorTextLightSolid, fontSize: token.fontSizeSM, opacity: 0.85, marginTop: 2 }}>
        {press ? '按下了 · 回弹' : hover ? '悬停 · 抬升' : '移入试试'}
      </Text>
    </Pressable>
  );
}

// B —— 缓动曲线采样：把 fn(t) 画成一排柱子；超过基线（v>1）的柱子标红，直观呈现过冲
function CurvePlot(props: { label: string; fn: (t: number) => number; color: string }): React.ReactElement {
  const { token } = useToken();
  const H = 96; // 目标基线高度（v=1 处）
  const samples: number[] = [];
  for (let i = 0; i <= 20; i++) samples.push(i / 20);
  return (
    <View style={{ width: 168 }}>
      <View style={{ position: 'relative', height: H + 28 }}>
        <View
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, backgroundColor: token.colorSplit }}
        />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
          {samples.map((t, i) => {
            const v = props.fn(t);
            const barH = Math.max(1, v * H);
            const over = v > 1.001;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: barH,
                  borderRadius: 2,
                  backgroundColor: over ? token.colorError : props.color,
                }}
              />
            );
          })}
        </View>
      </View>
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{props.label}</Text>
    </View>
  );
}

/** B 配套：一条曲线下方配一个循环滚动的小球，位移 = fn(循环进度)，动态感受曲线性格 */
function CurveWithBall(props: { label: string; fn: (t: number) => number; color: string; duration?: number }): React.ReactElement {
  const { token } = useToken();
  const raw = useAnimation({ duration: props.duration ?? 1600, loop: true });
  const TRACK = 168;
  const x = Math.max(0, Math.min(1, props.fn(raw))) * (TRACK - 14);
  return (
    <View style={{ width: TRACK, gap: 6 }}>
      <CurvePlot label={props.label} fn={props.fn} color={props.color} />
      <View style={{ height: 16, backgroundColor: token.colorFillQuaternary, borderRadius: 8 }}>
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: props.color, transform: [{ translateX: x }]} } />
      </View>
    </View>
  );
}

// C —— 弹簧实验室：参数原始值传入 useSpring（避免每帧换引用重启），点按钮突变目标
function SpringLab(): React.ReactElement {
  const { token } = useToken();
  const [stiffness, setStiffness] = React.useState(200);
  const [damping, setDamping] = React.useState(20);
  const [mass, setMass] = React.useState(1);
  const [on, setOn] = React.useState(false);
  const x = useSpring(on ? 260 : 0, { stiffness, damping, mass });
  const knob = (label: string, value: number, set: (v: number) => void, min: number, max: number, step: number): React.ReactElement => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, width: 64 }}>{label}</Text>
      <MiniBtn text="−" onPress={() => set(Math.max(min, +(value - step).toFixed(2)))} />
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorText, width: 40, textAlign: 'center' }}>{value}</Text>
      <MiniBtn text="+" onPress={() => set(Math.min(max, +(value + step).toFixed(2)))} />
    </View>
  );
  return (
    <View style={{ gap: token.marginSM, maxWidth: 460 }}>
      <View style={{ flexDirection: 'row', gap: token.marginLG, flexWrap: 'wrap' }}>
        {knob('stiffness', stiffness, setStiffness, 40, 600, 20)}
        {knob('damping', damping, setDamping, 4, 60, 2)}
        {knob('mass', mass, setMass, 0.2, 8, 0.2)}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <Pressable
          onPress={() => setOn((v) => !v)}
          style={{ paddingVertical: 5, paddingHorizontal: token.paddingSM, borderRadius: token.borderRadius, backgroundColor: token.colorPrimary }}
        >
          <Text style={{ color: token.colorTextLightSolid }}>切换目标 ▸</Text>
        </Pressable>
        <View style={{ flex: 1, height: 26, backgroundColor: token.colorFillQuaternary, borderRadius: 13 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: token.colorWarning,
              marginTop: 2,
              transform: [{ translateX: Math.max(0, x) }],
            }}
          />
        </View>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        ζ = damping / (2·√(stiffness·mass)) ≈ {(damping / (2 * Math.sqrt(stiffness * mass))).toFixed(2)}；ζ&lt;1 欠阻尼回弹，ζ≈0.7 顺滑落位，ζ≥1 无过冲最慢
      </Text>
    </View>
  );
}

function MiniBtn(props: { text: string; onPress: () => void }): React.ReactElement {
  const { token } = useToken();
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        width: 22,
        height: 22,
        borderRadius: token.borderRadiusSM,
        backgroundColor: token.colorFillSecondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{props.text}</Text>
    </Pressable>
  );
}

// D —— Stagger 错峰列表：换 key 强制子树重挂载即整组重播
function StaggerDemo(): React.ReactElement {
  const { token } = useToken();
  const [run, setRun] = React.useState(0);
  const rows = ['部署 deploy', '构建 build', '测试 test', '灰度 canary', '发布 release'];
  return (
    <View style={{ gap: token.marginSM, maxWidth: 420 }}>
      <Pressable
        onPress={() => setRun((r) => r + 1)}
        style={{ alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: token.paddingSM, borderRadius: token.borderRadius, backgroundColor: token.colorPrimary }}
      >
        <Text style={{ color: token.colorTextLightSolid }}>重播 ▸</Text>
      </Pressable>
      <Stagger key={run} gap={90} preset="slideUp">
        {rows.map((r) => (
          <StaggerItem key={r}>
            <RowChip text={r} />
          </StaggerItem>
        ))}
      </Stagger>
    </View>
  );
}

function RowChip(props: { text: string }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        height: 38,
        justifyContent: 'center',
        paddingHorizontal: token.paddingSM,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorFillTertiary,
        marginBottom: token.marginXS,
      }}
    >
      <Text style={{ color: token.colorText }}>{props.text}</Text>
    </View>
  );
}

// E —— Transition 进出场：删掉的条目播完退场才真正卸载
function TransitionDemo(): React.ReactElement {
  const { token } = useToken();
  const [items, setItems] = React.useState<number[]>([1, 2, 3]);
  const [next, setNext] = React.useState(4);
  return (
    <View style={{ gap: token.marginSM, maxWidth: 420 }}>
      <View style={{ flexDirection: 'row', gap: token.marginXS }}>
        <Pressable
          onPress={() => {
            setItems((its) => its.concat(next));
            setNext((n) => n + 1);
          }}
          style={{ alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: token.paddingSM, borderRadius: token.borderRadius, backgroundColor: token.colorPrimary }}
        >
          <Text style={{ color: token.colorTextLightSolid }}>+ 添加</Text>
        </Pressable>
      </View>
      <View style={{ gap: token.marginXS }}>
        {items.map((id) => (
          <TransitionVisibleRow key={id} id={id} onRemove={() => setItems((its) => its.filter((x) => x !== id))} />
        ))}
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
        删除不是瞬移：条目先播 slideLeft+fade 退场（280ms），播完才从树里移除
      </Text>
    </View>
  );
}

function TransitionVisibleRow(props: { id: number; onRemove: () => void }): React.ReactElement {
  const { token } = useToken();
  const [visible, setVisible] = React.useState(true);
  return (
    <Transition visible={visible} enter="slideUp" exit={{ duration: 280, easing: Easing.easeOutCubic, from: { opacity: 0, translateX: 48 } }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 38, paddingHorizontal: token.paddingSM, borderRadius: token.borderRadius, backgroundColor: token.colorFillTertiary }}>
        <Text style={{ color: token.colorText }}>条目 #{props.id}</Text>
        <Pressable
          onPress={() => {
            setVisible(false);
            setTimeout(props.onRemove, 300); // 退场播完后父级再真正删 key
          }}
          style={{ cursor: 'pointer' }}
        >
          <Text style={{ color: token.colorTextTertiary }}>✕</Text>
        </Pressable>
      </View>
    </Transition>
  );
}

// F —— 预设对比墙：每个预设一格，重挂整墙逐一比对性格
function PresetWall(): React.ReactElement {
  const { token } = useToken();
  const [run, setRun] = React.useState(0);
  const names = Object.keys(presets) as PresetName[];
  return (
    <View style={{ gap: token.marginSM }}>
      <Pressable
        onPress={() => setRun((r) => r + 1)}
        style={{ alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: token.paddingSM, borderRadius: token.borderRadius, backgroundColor: token.colorPrimary }}
      >
        <Text style={{ color: token.colorTextLightSolid }}>重播全部 ▸</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginSM }}>
        {names.map((n) => (
          <PresetCell key={`${run}:${n}`} name={n} />
        ))}
      </View>
    </View>
  );
}

function PresetCell(props: { name: PresetName }): React.ReactElement {
  const { token } = useToken();
  const preset = presets[props.name];
  const p = useAnimation({ duration: preset.duration, easing: preset.easing });
  return (
    <View style={{ width: 104, alignItems: 'center', gap: 6 }}>
      <View style={{ width: 88, height: 64, borderRadius: token.borderRadiusLG, backgroundColor: token.colorPrimaryBg, borderWidth: 1, borderColor: token.colorPrimaryBorder, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styleAt(preset, p) as any}>
          <View style={{ width: 34, height: 34, borderRadius: token.borderRadius, backgroundColor: token.colorPrimary }} />
        </View>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{props.name}</Text>
      <Text style={{ fontSize: 10, color: token.colorTextTertiary }}>{preset.duration}ms</Text>
    </View>
  );
}

// G —— 序列编排：runSequence 串一条时间线，点按钮点亮一串灯
function SequenceDemo(): React.ReactElement {
  const { token } = useToken();
  const [lit, setLit] = React.useState<boolean[]>([false, false, false, false, false]);
  const handle = React.useRef<{ cancel: () => void } | null>(null);
  React.useEffect(() => () => handle.current?.cancel(), []);
  const play = (): void => {
    handle.current?.cancel();
    setLit([false, false, false, false, false]);
    let i = 0;
    handle.current = runSequence(
      lit.map(() => ({
        duration: 160,
        offset: i++ === 0 ? 0 : 110, // 每步相对上一步开始 +110ms：串链且首尾交叠
        run: () => {
          const idx = i - 1;
          setLit((prev) => prev.map((v, k) => (k === idx ? true : v)));
        },
      })),
    );
  };
  return (
    <View style={{ gap: token.marginSM, alignItems: 'flex-start' }}>
      <Pressable onPress={play} style={{ paddingVertical: 5, paddingHorizontal: token.paddingSM, borderRadius: token.borderRadius, backgroundColor: token.colorPrimary }}>
        <Text style={{ color: token.colorTextLightSolid }}>▶ 跑一遍序列</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: token.marginSM }}>
        {lit.map((on, i) => (
          <View
            key={i}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: on ? token.colorSuccess : token.colorFillSecondary,
              opacity: on ? 1 : 0.6,
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>五步时间线，步进 offset 110ms / 时长 160ms → 尾尾交叠 50ms</Text>
    </View>
  );
}

// H —— FLIP 布局动画：展开/收起让列表项被推挤，Flip 把跳变补间成平滑滑动
function FlipList(): React.ReactElement {
  const { token } = useToken();
  const [expanded, setExpanded] = React.useState(false);
  const items = ['苹果 Apple', '香蕉 Banana', '橙子 Orange', '葡萄 Grape'];
  return (
    <View style={{ width: 300, gap: token.marginXS }}>
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={{
          alignSelf: 'flex-start',
          paddingVertical: 6,
          paddingHorizontal: token.paddingSM,
          borderRadius: token.borderRadius,
          backgroundColor: token.colorPrimary,
        }}
      >
        <Text style={{ color: token.colorTextLightSolid }}>{expanded ? '收起 ▴' : '展开插一块 ▾'}</Text>
      </Pressable>
      {expanded ? (
        <Flip
          duration={360}
          easing={Easing.spring({ dampingRatio: 0.55, frequency: 2.2 })}
          style={{
            height: 52,
            borderRadius: token.borderRadiusLG,
            backgroundColor: token.colorPrimaryBg,
            borderWidth: 1,
            borderColor: token.colorPrimaryBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: token.colorPrimary }}>新插入的块（把下面四行往下推）</Text>
        </Flip>
      ) : null}
      {items.map((it) => (
        <Flip
          key={it}
          duration={360}
          easing={Easing.spring({ dampingRatio: 0.7, frequency: 2.4 })}
          style={{
            height: 40,
            borderRadius: token.borderRadius,
            backgroundColor: token.colorFillTertiary,
            paddingHorizontal: token.paddingSM,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: token.colorText }}>{it}</Text>
        </Flip>
      ))}
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '交互弹簧（hover 抬升 / press 回弹）',
    desc: 'useTransformTween 物理弹簧驱动状态→目标变换；静止回归恒等，零绘制开销。移入按下体验手感',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <LiftCardTitle color="primary" title="主要" />
        <LiftCardTitle color="success" title="成功" />
        <LiftCardTitle color="warning" title="警告" />
      </View>
    ),
    code: [
      'import { useTransformTween } from "react-native-flux-desktop";',
      '',
      '// hover/press 状态映射到目标变换，静止回归恒等（零绘制开销）',
      'const transform = useTransformTween({',
      '  translateY: hovered ? -6 : 0,',
      '  scale: pressed ? 0.97 : 1,',
      '}, { stiffness: 260, damping: 20 });',
      '<Pressable onPressIn={press} onPressOut={release}',
      '  onPointerEnter={hover} onPointerLeave={unhover}>',
      '  <View style={{ transform }}>{children}</View>',
      '</Pressable>',
    ].join('\n'),
  },
  {
    name: '缓动曲线可视化（循环小球）',
    desc: '柱状 = fn(t) 逐点采样（超基线标红即过冲）；下方小球位移由同一条曲线驱动，循环播放',
    node: (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <CurveTile label="easeOutCubic" fn={Easing.easeOutCubic} color="info" />
        <CurveTile label="easeOutBack" fn={Easing.easeOutBack} color="primary" />
        <CurveTile label="easeOutElastic" fn={Easing.easeOutElastic} color="success" />
        <CurveTile label="spring ζ=0.35" fn={Easing.spring({ dampingRatio: 0.35, frequency: 2 })} color="warning" />
      </View>
    ),
    code: [
      'import { Easing, useAnimation } from "react-native-flux-desktop";',
      '',
      '// 预设缓动函数：fn(t 0..1) => 进度 0..1（可过冲 >1）',
      'Easing.easeOutCubic(t); Easing.easeOutBack(t); Easing.easeOutElastic(t);',
      '// 弹簧缓动由阻尼比 ζ 与频率决定',
      'const spring = Easing.spring({ dampingRatio: 0.35, frequency: 2 });',
      '// useAnimation 循环推进 t，逐点采样画柱 + 驱动小球',
      'const t = useAnimation({ duration: 1600, loop: true, easing: spring });',
    ].join('\n'),
  },
  { name: '弹簧实验室', desc: 'stiffness / damping / mass 实时调参，点按钮突变目标看轨迹差异；ζ 公式随参数联动', node: <SpringLab />,
    code: [
      'import { useSpring } from "react-native-flux-desktop";',
      '',
      '// 物理弹簧：帧率无关，target 突变保留当前速度',
      'const x = useSpring(target, { stiffness: 170, damping: 20, mass: 1 });',
      '// 调参即时生效；阻尼比 ζ = damping / (2√(stiffness·mass))',
      '<View style={{ transform: [{ translateX: x }] }} />',
    ].join('\n'),
  },
  { name: 'Stagger 错峰入场', desc: '<Stagger> 给子项按序号 ×gap 追加延迟，整组多米诺落位；换 key 即整组重播', node: <StaggerDemo />,
    code: [
      'import { Stagger, StaggerItem } from "react-native-flux-desktop";',
      '',
      '// 子项 delay = index × gap，整组多米诺入场',
      '<Stagger gap={60} preset="slideUp">',
      '  {items.map((it) => (',
      '    <StaggerItem key={it.id}>{it.label}</StaggerItem>',
      '  ))}',
      '</Stagger>',
      '// 换外层 key 即可重播整组',
    ].join('\n'),
  },
  { name: 'Transition 进出场', desc: 'visible 翻 false 后先播退场预设、播完才卸载——条件渲染给不了的「善终」动画', node: <TransitionDemo />,
    code: [
      'import { Transition } from "react-native-flux-desktop";',
      '',
      '// visible 翻 false 后先播退场、播完才卸载',
      '<Transition visible={show} in="slideUp" out="fade">',
      '  <View style={{ padding: 16 }}>内容</View>',
      '</Transition>',
    ].join('\n'),
  },
  { name: '预设对比墙', desc: 'fadeIn/slide 四向/pop/bounce/springUp 七套预设同屏重播，挑性格', node: <PresetWall />,
    code: [
      'import { presets, MoveIn, FadeIn, ScaleIn } from "react-native-flux-desktop";',
      '',
      '// presets 库：from 态 + 时长 + 缓动',
      'presets.fadeIn; presets.slideUp; presets.pop; presets.bounce;',
      '// 挂载即播的入场原语',
      '<FadeIn><View /></FadeIn>',
      '<MoveIn direction="up" distance={24}><View /></MoveIn>',
      '<ScaleIn><View /></ScaleIn>',
    ].join('\n'),
  },
  { name: '序列编排 runSequence', desc: '轻量时间线：步骤按时长/偏移串并交织，cancel 整体作废', node: <SequenceDemo />,
    code: [
      'import { runSequence } from "react-native-flux-desktop";',
      '',
      '// 步骤 offset 相对上一步开始（并行）或省略（串行）',
      'const handle = runSequence([',
      '  { duration: 300, onUpdate: (p) => setA(p) },',
      '  { duration: 300, onUpdate: (p) => setB(p) },',
      '  { duration: 200, offset: 0, onUpdate: (p) => setC(p) }, // 与上步并行',
      ']);',
      'handle.cancel(); // 整体作废',
    ].join('\n'),
  },
  { name: 'FLIP 布局动画', desc: '插入/移除块把行推挤，Flip 用旧盒→新盒反演补成平滑滑动', node: <FlipList />,
    code: [
      'import { Flip } from "react-native-flux-desktop";',
      '',
      '// FLIP：记录旧盒→布局变化后求差反演，逐帧补回恒等',
      '{items.map((it) => (',
      '  <Flip key={it.id} duration={280} easing={Easing.easeOutCubic}>',
      '    <View style={{ height: 44 }}>{it.label}</View>',
      '  </Flip>',
      '))}',
      '// 插入/移除导致推挤时自动平滑滑动',
    ].join('\n'),
  },
];

/** LiftCard 的 token 色板包装（DemoItem 是静态数组，色板需内部取 token） */
function LiftCardTitle(props: { title: string; color: 'primary' | 'success' | 'warning' }): React.ReactElement {
  const { token } = useToken();
  return <LiftCard title={props.title} color={token[props.color === 'primary' ? 'colorPrimary' : props.color === 'success' ? 'colorSuccess' : 'colorWarning']} />;
}

function CurveTile(props: { label: string; fn: (t: number) => number; color: 'primary' | 'success' | 'warning' | 'info' }): React.ReactElement {
  const { token } = useToken();
  const c = token[(props.color === 'primary' ? 'colorPrimary' : props.color === 'success' ? 'colorSuccess' : props.color === 'warning' ? 'colorWarning' : 'colorInfo') as 'colorPrimary'];
  return <CurveWithBall label={props.label} fn={props.fn} color={c} />;
}

const API: ApiRow[] = [
  { name: 'useAnimation', desc: '时间→0..1 进度：duration/delay/loop/easing/playing，播完自停退订', type: '(opts) => number', default: '–' },
  { name: 'useTween', desc: '把数值补间到最新 target（开关滑动/位置迁移）', type: '(target, duration?, easing?) => number', default: '220ms cubic' },
  { name: 'useSpring / useMotionValue', desc: '物理弹簧（帧率无关、target 突变保留速度）/ tween+spring 统一运动值', type: '(target, {stiffness,damping,mass}) => number', default: '170/20/1' },
  { name: 'useTransformTween', desc: 'TransformSpec 四分量逐帧平滑，恒等时 parseTransform 走零开销快速路径', type: '(spec, opts?) => TransformArray', default: '–' },
  { name: 'Stagger / StaggerItem', desc: '错峰入场：子项 delay = index×gap（默认 60ms），preset 或自定义 AnimPreset', type: '<Stagger gap preset>', default: 'slideUp' },
  { name: 'Transition / useTransition', desc: '声明式进出场：退场播完才卸载；enter/exit 收预设名或对象', type: '<Transition visible>', default: 'in=slideUp out=fade' },
  { name: 'presets / styleAt', desc: '预设库（from 态+时长+缓动）与进度→样式插值器', type: 'object / (preset, p) => ViewStyle', default: '8 条' },
  { name: 'runSequence', desc: '时间线编排：步骤 offset 相对上一步开始（并行）或省略（串行），返回 {total, cancel}', type: '(steps) => SequenceHandle', default: '–' },
  { name: 'Flip / useFlip', desc: 'FLIP：旧盒→新盒求差反演，逐帧补回恒等，布局跳变读成滑动', type: '<Flip duration easing>', default: '–' },
  { name: 'FadeIn / MoveIn / ScaleIn / RotateIn', desc: '挂载即播的入场原语（播完停终态）', type: '<MoveIn direction distance>', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'colorPrimary / colorSuccess / colorWarning / colorInfo', desc: '演示元素四色，全部取自语义 token' },
  { name: 'colorFillTertiary / colorFillQuaternary', desc: '行块与轨道底色' },
  { name: 'borderRadius / borderRadiusLG', desc: '演示块圆角' },
];

export function AnimationDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}

export default AnimationDemo;
