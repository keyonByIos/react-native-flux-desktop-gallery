// 系统 / 欢迎：门户入口页。仿 antd 首页气质 —— 顶部 Hero + 技术栈速览 + 技术特色网格 +
// 界面掠影（图片）+ 下一步路线图 + 未来展望。纯组合现有组件，不新增原子件；颜色/几何全走 token，明暗自适应。
import React from 'react';
import path from 'path';
import {
  View,
  Text,
  ImageBox,
  Tag,
  Steps,
  Row,
  Col,
  Button,
  useToken,
  message,
} from 'react-native-flux-desktop';

/** 本地品牌图标（永远可靠渲染） */
const LOGO = path.join(process.cwd(), 'assets', 'icon.png');
/** 界面掠影：真实页面截图（本地静态资源，见 assets/），无网络依赖 */
const SHOT = (name: string): string => path.join(process.cwd(), 'assets', name);
/** 技术特色卡统一固定高度，保证同排等高（容纳 插画+标题行 + 2 行描述） */
const CARD_H = 160;

type Accent = 'primary' | 'success' | 'warning' | 'error' | 'info';

/* ------------------------------ Hero ------------------------------ */

function Hero(): React.ReactElement {
  const { token } = useToken();
  const [api, holder] = message.useMessage();
  const stack = ['React 18', 'TypeScript', 'react-reconciler', '自研底座', 'Yoga', 'Skia 软件光栅', '零 WebView'];
  return (
    <View
      style={{
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.marginLG,
        padding: token.paddingXL,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorPrimaryBorder,
        backgroundColor: token.colorPrimaryBg,
        marginBottom: token.marginLG,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <ImageBox src={LOGO} width={56} height={56} radius={token.borderRadiusLG} />
          <Text style={{ fontSize: token.fontSizeXL + 14, fontWeight: '800', color: token.colorText }}>
            React Native Flux
          </Text>
        </View>
        <Text
          style={{
            fontSize: token.fontSizeLG,
            color: token.colorTextSecondary,
            marginTop: token.margin,
            lineHeight: token.fontSizeLG * 1.7,
          }}
        >
          一套纯自绘底座的桌面组件栈：React 只产出场景树，软件光栅器逐帧画像素，
          不依赖 Web、也不依赖任何原生控件树 —— 用你最熟悉的语法，直出桌面每一帧。
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS, marginTop: token.margin }}>
          {stack.map((s) => (
            <Tag key={s} color="processing" bordered>
              {s}
            </Tag>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: token.marginSM, marginTop: token.marginLG }}>
          <Button
            type="text"
            onClick={() => api.info('欢迎来到 Flux —— 从左侧「系统」开始了解渲染机制')
            }
          >
            开始了解
          </Button>
          <Button type='text' onClick={() => api.info('在顶部切到「组件」分区即可浏览全部组件')}>浏览组件</Button>
        </View>
      </View>
      <View style={{ width: 300 }}>
        <ImageBox src={SHOT('illus-hero.png')} width={300} height={210} radius={token.borderRadiusLG} resizeMode="cover" caption="自绘管线 · 直出桌面每一帧" style={{ cacheAsBitmap: true }} />
      </View>
      {holder}
    </View>
  );
}

/* --------------------------- 通用段标题 --------------------------- */

function SectionHead(props: { title: string; desc?: string }): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ marginTop: token.marginXL, marginBottom: token.margin }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 4,
            height: token.fontSizeLG + 2,
            borderRadius: 2,
            backgroundColor: token.colorPrimary,
            marginRight: token.marginXS,
          }}
        />
        <Text style={{ fontSize: token.fontSizeXL, fontWeight: '700', color: token.colorText }}>{props.title}</Text>
      </View>
      {props.desc ? (
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: token.marginXXS, paddingLeft: 4 + token.marginXS }}>
          {props.desc}
        </Text>
      ) : null}
    </View>
  );
}

/* --------------------------- 技术栈速览 --------------------------- */

const PIPELINE = [
  { k: 'setState', v: 'React 产出场景树' },
  { k: 'Reconciler', v: '提交到宿主实例' },
  { k: 'Yoga', v: 'Flexbox 布局' },
  { k: 'Skia', v: '软件光栅 RGBA' },
  { k: 'softbuffer', v: '整帧贴屏' },
];

function StackOverview(): React.ReactElement {
  const { token } = useToken();
  return (
    <View>
      <Steps
        direction="horizontal"
        labelPlacement="vertical"
        current={PIPELINE.length}
        readOnly
        showNumber
        line={{ style: 'solid', gap: token.marginXXS }}
        style={{ paddingVertical: token.paddingXS }}
        items={PIPELINE.map((p) => ({ title: p.k, description: p.v }))}
      />
    </View>
  );
}

/* --------------------------- 技术特色网格 --------------------------- */

interface Feature {
  /** 场景插画文件名（assets/ 下，已抠透明背景） */
  illus: string;
  accent: Accent;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  { illus: 'illus-f-base.png', accent: 'primary', title: '纯自绘底座', desc: '不内嵌浏览器、不用原生控件树，渲染管线完全自持，逐帧可控' },
  { illus: 'illus-f-react.png', accent: 'info', title: 'React 全家桶语法', desc: '函数组件 / Hooks / JSX 原样可用，reconciler 直连场景树宿主' },
  { illus: 'illus-f-raster.png', accent: 'warning', title: '即时模式光栅', desc: '全局 16ms 节拍合帧，脏窗口统一重绘，无保留模式状态漂移' },
  { illus: 'illus-f-window.png', accent: 'success', title: '多窗口 + 事件泵', desc: 'Application 单例 + 每窗一 React 根，全局事件泵按 id 路由，命令式弹窗' },
  { illus: 'illus-f-token.png', accent: 'primary', title: 'antd 风格 Token', desc: '明暗 × 密度 × 主色三维正交，token 是唯一事实来源，组件零硬编码' },
  { illus: 'illus-f-motion.png', accent: 'error', title: '交互动画系统', desc: '淡入 / 位移 / 缩放 / 弹簧 / FLIP 布局动画，绘制期变换' },
  { illus: 'illus-f-charts.png', accent: 'info', title: '图表 / Web3 / 开发件', desc: 'K线、面积、饼、热力图，钱包地址、终端、代码块等成套就绪' },
  { illus: 'illus-f-kv.png', accent: 'success', title: '轻量 KV 持久化', desc: '自研 bitcask 式追加日志 + CRC 回放，系统/用户双层类型化存储' },
];

/** 卡片正文（场景插画 + 标题同行 + 描述），供普通卡与翻转卡正面复用 */
function FeatureBody(props: { f: Feature }): React.ReactElement {
  const { token } = useToken();
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
        <ImageBox src={SHOT(props.f.illus)} width={56} height={56} radius={token.borderRadius} resizeMode="cover" style={{backgroundColor: 'transparent'}}/>
        <Text style={{ flex: 1, minWidth: 0, fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText, lineHeight: token.fontSizeLG * 1.4 }}>
          {props.f.title}
        </Text>
      </View>
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: token.marginXS, lineHeight: token.fontSize * 1.7 }}>
        {props.f.desc}
      </Text>
    </>
  );
}

function FeatureCard(props: { f: Feature }): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        height: CARD_H,
        padding: token.paddingMD,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorBgContainer,
        overflow: 'hidden',
        cacheAsBitmap: true, // [Phase 1] 8 张静态特色卡（含 56×56 插画）：滚动期不变→烘一次位图，降 paint 与 data 读回光栅内容
      }}
    >
      <FeatureBody f={props.f} />
    </View>
  );
}

function FeatureGrid(): React.ReactElement {
  const { token } = useToken();
  // 该 Row/Col 用 flexGrow:span + flexBasis:0%，总 span>24 也不会换行；故按每行 4 张手动拆成多个 Row。
  const rows: Feature[][] = [];
  for (let i = 0; i < FEATURES.length; i += 4) rows.push(FEATURES.slice(i, i + 4));
  return (
    <View style={{ gap: token.margin }}>
      {rows.map((row, ri) => (
        <Row key={ri} gutter={[token.margin, token.margin]} align="stretch" style={{ gap: token.margin }}>
          {row.map((f) => (
            <Col key={f.title} span={6}>
              <FeatureCard f={f} />
            </Col>
          ))}
        </Row>
      ))}
    </View>
  );
}

/* --------------------------- 界面掠影（图片） --------------------------- */

// 前两张常规比例并排；第三张为明暗对比拼接图（超宽），独占整行以完整展示两半。
function Showcase(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.margin }}>
      <Row gutter={[token.margin, token.margin]} style={{ gap: token.margin }}>
        <Col span={12}>
          <ImageBox src={SHOT('shot-dashboard.png')} width="100%" height={210} radius={token.borderRadiusLG} resizeMode="cover" caption="数据分析看板 · 组件与图表同底拼装" style={{ cacheAsBitmap: true }} />
        </Col>
        <Col span={12}>
          <ImageBox src={SHOT('shot-coin.png')} width="100%" height={210} radius={token.borderRadiusLG} resizeMode="cover" caption="区块链币价实时看板 · 币安直连 K线 / 深度 / 盘口" style={{ cacheAsBitmap: true }} />
        </Col>
      </Row>
      <ImageBox src={SHOT('shot-theme.png')} width="100%" height={210} radius={token.borderRadiusLG} resizeMode="cover" caption="明暗主题对比 · 同一 token 两套色板逐帧重绘" style={{ cacheAsBitmap: true }} />
    </View>
  );
}

/* --------------------------- 下一步 · 路线图 --------------------------- */

interface RoadItem {
  status: string;
  color: 'processing' | 'warning' | 'default';
  title: string;
  desc: string;
}

const ROADMAP: RoadItem[] = [
  {
    status: '进行中',
    color: 'processing',
    title: 'GPU 加速渲染',
    desc: '把 Skia 软件光栅接到 GPU 后端（Ganesh / 原生纹理），在大列表与高分辨率窗口下进一步压低每帧 CPU 开销，让「完全掌控每一帧」在更大画布上依然轻盈。',
  },
  {
    status: '进行中',
    color: 'processing',
    title: '文本与输入增强',
    desc: '更完整的富文本排版、双向文本与中文 IME 组合态，编辑体验持续向原生编辑器看齐。',
  },
  {
    status: '计划中',
    color: 'warning',
    title: '抗锯齿与矢量精度',
    desc: '分数 DPI 下圆角 / 斜边细描边的质量优化，探索更高质量的几何栅格路径。',
  },
  {
    status: '计划中',
    color: 'warning',
    title: '跨平台后端',
    desc: '在 Windows 之外补齐 macOS / Linux 的窗口与事件后端，一套代码多端直出。',
  },
  {
    status: '探索中',
    color: 'default',
    title: '组件覆盖度',
    desc: '持续对齐 antd 组件矩阵，补齐重型表格、表单校验、虚拟滚动等大件。',
  },
  {
    status: '探索中',
    color: 'default',
    title: '无障碍与焦点管理',
    desc: '键盘焦点环、屏幕阅读器语义与 ARIA 映射，让自绘控件同样可达。',
  },
];

function Roadmap(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ gap: token.marginSM }}>
      {ROADMAP.map((r, i) => (
        <View
          key={r.title}
          style={{
            flexDirection: 'row',
            gap: token.margin,
            padding: token.padding,
            borderRadius: token.borderRadiusLG,
            borderWidth: token.lineWidth,
            borderColor: token.colorBorderSecondary,
            backgroundColor: token.colorBgContainer,
            overflow: 'hidden',
            cacheAsBitmap: true, // [Phase 1] 6 行静态路线图文本：整卡位图化，滚动期不重绘
          }}
        >
          <Text style={{ fontSize: token.fontSizeLG, fontWeight: '700', color: token.colorTextQuaternary, width: 28, lineHeight: 24 }}>
            {String(i + 1).padStart(2, '0')}
          </Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
              <Text style={{ fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }}>{r.title}</Text>
              <Tag color={r.color} bordered={false}>
                {r.status}
              </Tag>
            </View>
            <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, marginTop: 4, lineHeight: token.fontSize * 1.7 }}>
              {r.desc}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/* --------------------------- 未来展望 --------------------------- */

function Vision(): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        padding: token.paddingXL,
        borderRadius: token.borderRadiusLG,
        backgroundColor: token.colorFillQuaternary,
        overflow: 'hidden',
        cacheAsBitmap: true, // [Phase 1] 愿景静态文本块
      }}
    >
      <Text style={{ fontSize: token.fontSize, color: token.colorText, lineHeight: token.fontSize * 1.9 }}>
        我们不想复刻一个浏览器，而是想证明：React 的心智模型可以一路直达像素。当渲染底座完全握在自己手里，明暗、密度、动效、多窗口都不再是框架的边角料，而是能被逐帧调度的第一公民。
      </Text>
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.fontSize * 1.9, marginTop: token.marginSM }}>
        下一步引入 GPU 加速，是为了让这份「完全掌控」在更大画布、更高刷新率下依然从容；而跨平台与无障碍，则会把它带向更远、也更包容的边界。Flux 想做的，是一套既让开发者用熟悉的语法写出桌面应用、又能把每一帧都变成设计表达的现代底座。
      </Text>
    </View>
  );
}

/* ------------------------------ 页面 ------------------------------ */

export function SysWelcomeDemo(): React.ReactElement {
  const { token } = useToken();
  return (
    <View style={{ maxWidth: 1040 }}>
      <Hero />

      <SectionHead title="技术栈 · 一帧的旅程" desc="从一次 setState 到屏幕上的像素，全链路自持、无第三方渲染依赖" />
      <StackOverview />

      <SectionHead title="技术特色" desc="把「渲染底座握在自己手里」带来的能力，逐条落到组件与体验上" />
      <FeatureGrid />

      <SectionHead title="界面掠影" desc="同一套底座拼出的组件、图表与主题，皆为一等公民" />
      <Showcase />

      <SectionHead title="下一步 · 路线图" desc="基于当前管线的潜在问题，诚实地排布近期与远期" />
      <Roadmap />

      <SectionHead title="愿景" />
      <Vision />

      <View style={{ height: token.paddingLG }} />
    </View>
  );
}
