// 案例段：不用左侧菜单，主区就是一块大白板，摆三个案例卡片按钮。
// 点任意一张 → openThemedWindow（见 components/AppWindow）弹一扇独立窗口承载该案例整页 demo：
//   · 新窗配置与主窗口一致（默认 1280×640、min 同尺寸、带标题栏）；
//   · 标题沿用现有 menu 名称；
//   · 主题壳 / 背景 / 滚动 / tag 去重全部收敛到 AppWindow，案例段只声明「开哪扇、装什么」。
import React from 'react';
import { View, Text, Icon, Pressable, ScrollView, useToken } from 'react-native-flux-desktop';
import { openThemedWindow } from './AppWindow';
import { DashboardDemo } from '../cases/dashboard';
import { CryptoLiveDemo } from '../cases/crypto-live';
import { MallDemo } from '../cases/mall';
import { WalletDemo } from '../cases/wallet';
import { WeatherDemo } from '../cases/weather';
import { AlmanacDemo } from '../cases/almanac';
import { HeavyChartsDemo } from '../cases/heavy-charts';
import { SysMonitorDemo } from '../cases/sys-monitor';
import { FileManagerDemo } from '../cases/file-manager';
import { ChatDemo } from '../cases/chat';
import { KanbanDemo } from '../cases/kanban';
import { MusicDemo } from '../cases/music';
import { MailDemo } from '../cases/mail';
import { CheckoutDemo } from '../cases/checkout';
import { SettingsDemo } from '../cases/settings';
import { TerminalPanelDemo } from '../cases/terminal';
import { DevToolkitDemo } from '../cases/dev-toolkit';
import { AdminCrudDemo } from '../cases/admin-crud';
import { TaskManagerDemo } from '../cases/task-manager';
import { CalendarScheduleDemo } from '../cases/calendar-schedule';
import { ApiClientDemo } from '../cases/api-client';

interface CaseDef {
  key: string;
  /** 沿用现有 menu 名称，作为窗口标题 */
  title: string;
  icon: string;
  desc: string;
  node: React.ReactNode;
  /** 外层是否包 ScrollView（内容自带滚动时置 false，避免嵌套滚动致 flex 塌陷空白） */
  scroll?: boolean;
  /** 内容四周外边距；大屏类案例置 0 让背景色铺满窗口边缘（缺省走主题 paddingLG） */
  padding?: number;
}

const CASES: CaseDef[] = [
  {
    key: 'dashboard',
    title: '数据可视化大屏 Dashboard',
    icon: 'dashboard',
    desc: '深蓝科技风监控大屏：KPI 大数字栏 + 三栏面板栅格（仪表/分组柱/面积/散点分布/环形饼/雷达/时间线）+ 告警明细表',
    node: <DashboardDemo />,
    padding: 0,
  },
  {
    key: 'crypto-live',
    title: '区块链币价实时看板 Crypto Live',
    icon: 'activity',
    desc: '币安官方 API 直连：实时 K 线（MA/MACD/VOL）+ 深度 + 盘口梯 + 逐笔成交 + 24h 行情榜',
    node: <CryptoLiveDemo />,
  },
  {
    key: 'mall',
    title: '商城首页 Mall Shop',
    icon: 'shoppingCart',
    desc: '参照淘宝 PC 首页：顶部信息条 + 三栏 hero（类目/轮播/会员卡）+ 补贴频道 + 秒杀 + 密集推荐流 + 购物车 + 页脚',
    node: <MallDemo />,
  },
  {
    key: 'wallet',
    title: 'EVM 钱包 Wallet',
    icon: 'wallet',
    desc: '参照 TokenPocket 功能逻辑的桌面多链钱包：多链/多钱包 + 资产（测试节点真实余额）+ 行情 + DApp + 记录 + 转账/收款/创建/导入（全走测试环境 · 演示态）',
    node: <WalletDemo />,
  },
  {
    key: 'weather',
    title: '天气 Weather',
    icon: 'cloud',
    desc: 'Open-Meteo 公共 API 直连（无需 Key）对标 MSN 天气：实况大字 + 天气 emoji + 7 日预报条 + 逐时温度曲线，右侧能见度/风/气压/空气质量/湿度/紫外线/日照瓦片；°C/°F + 城市切换，离线降级模拟，主题自适应',
    node: <WeatherDemo />,
  },
  {
    key: 'almanac',
    title: '万年历 Almanac',
    icon: 'calendar',
    desc: '公历月历 + 传统黄历：农历/干支三柱/生肖/纳音/月相/星座，节气与节日标注，选中日详列宜忌、吉神凶煞、冲煞、彭祖百忌、财神喜神福神方位；年月翻页 + 一键今天 + 本月概览，明暗自适应',
    node: <AlmanacDemo />,
  },
  {
    key: 'heavy-charts',
    title: '实时运营监控大屏 Ops Live',
    icon: 'activity',
    desc: '图表密集的常规业务看板：顶栏常驻实时帧率（FpsMonitor），十余种图表（滚动面积/折线、成功率仪表、堆叠柱、组合、漏斗、雷达、玫瑰、气泡、瀑布、热力、矩形树、日历热力）+ 实时订单流水与风控告警，可选 1s/2.5s/5s 定时刷新。',
    node: <HeavyChartsDemo />,
  },
  {
    key: 'sys-monitor',
    title: '系统监控托盘小部件 Sys Monitor',
    icon: 'dashboard',
    desc: '常驻托盘的迷你性能面板：整机 CPU/内存（纯 Node os 采样）+ 实时帧率一屏速览；从托盘右键菜单「系统监控」唤出无边框置顶小窗，点外即关、已开则 toggle，全走 token 明暗自适应。',
    node: <SysMonitorDemo />,
  },
  {
    key: 'file-manager',
    title: '文件管理器 + 快速预览 File Manager',
    icon: 'folder',
    desc: '三栏桌面文件管理器：左懒加载目录树、中虚拟化文件列表、右按类型快速预览（图片直显 / 代码·文本纯文本预览 / 其它元信息）；纯 Node fs 读真实磁盘，无造假，明暗双主题自适应。',
    node: <FileManagerDemo />,
    scroll: false, // 自带滚动（VirtualList/预览 ScrollView）：外层不包 ScrollView，父容器变有界 → 三栏 flex:1 撑满窗口高
  },
  {
    key: 'chat',
    title: '即时通讯 Chat',
    icon: 'messageCircle',
    desc: '双栏 IM：左会话列表（头像 + 未读徽标 + 搜索），右消息气泡流 + 输入框（回车发送 / emoji 快选）；切会话、发消息、搜索均为真实本地状态交互，明暗自适应。',
    node: <ChatDemo />,
    padding: 0,
    scroll: false, // 填满窗口高：外层不包 ScrollView，父容器有界 → 根 flex:1 撞满；且自带纵向滚动避免嵌套塔陷
  },
  {
    key: 'kanban',
    title: '看板 Kanban',
    icon: 'columns',
    desc: '任务管理四列泳道 + 任务卡（标签/优先级/负责人/到期）；◀▶ 点选跨列移动、Modal 新建、卡片删除，整块看板落 kv 持久化（重启回灌），明暗自适应。',
    node: <KanbanDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'music',
    title: '音乐播放器 Music Player',
    icon: 'music',
    desc: '左播放列表（封面色块 + 当前曲高亮 + 均衡器条），右现播大封面 + 进度条 + 传输控制 + 音量 + 喜欢；播放用 setInterval 每秒真实推进进度、到点自动切歌，明暗自适应。',
    node: <MusicDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'mail',
    title: '邮件客户端 Mail',
    icon: 'mail',
    desc: '三栏邮件：左文件夹（未读徽标）、中邮件列表（头像/主题/摘要/附件/未读点）、右阅读区（正文 + 附件 + 回复框）；切文件夹过滤、点邮件标已读、星标切换、搜索均真实本地状态，明暗自适应。',
    node: <MailDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'checkout',
    title: '购物车结算 Checkout',
    icon: 'shoppingCart',
    desc: '左购物车条目（封面/规格/单价/数量步进/小计/删除）、右订单摘要（优惠券 FLUX10 打 9 折 / 商品小计 / 运费 / 满 ¥99 免邮进度 / 合计 / 去结算）；改数量、删条目、券码实时联动，明暗自适应。',
    node: <CheckoutDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'settings',
    title: '系统设置 Settings',
    icon: 'setting',
    desc: '左分组导航（通用/外观/通知/隐私/高级）、右受控控件区：Select 语言、Switch 开关、Slider 缩放/圆角/缓存、Segmented 主题、Radio 通知方式、主题色块、恢复默认；全真实本地受控，明暗自适应。',
    node: <SettingsDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'terminal',
    title: '终端 / SSH 面板 Terminal',
    icon: 'code',
    desc: '会话管理器式终端面板：左会话列表（本地 PowerShell / CMD、SSH 主机、只读部署日志），右当前终端主体；复用库自绘终端组件族 LiveTerminal（node-pty 真 shell）/ SshTerminal（ssh2 远程）/ Terminal（七色语义日志），VT 网格屏 + SGR 配色，终端 App 惯例恒深色。',
    node: <TerminalPanelDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'dev-toolkit',
    title: '开发者工具箱 Dev Toolkit',
    icon: 'tool',
    desc: '左工具导航 + 右主体，一次性秀出库自绘整族 dev 组件：CodeBlock 多语言高亮 / Markdown 渲染 / JsonViewer 可折叠树 / DiffViewer 双栏对比 / RegexTester 实时匹配 / CronParser 触发预览 / TimeConverter 时间戳 / LogViewer 分级日志 / CommandPalette 命令面板，明暗自适应。',
    node: <DevToolkitDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'admin-crud',
    title: '管理后台 · 用户管理 Admin CRUD',
    icon: 'database',
    desc: 'KPI 概览条 + 搜索/状态/部门受控筛选 + 批量选择 + 万行虚拟化表格 + 列排序 + 语义状态 Tag + 右侧 Descriptions 详情主从面板，全本地确定性数据，明暗自适应。',
    node: <AdminCrudDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'task-manager',
    title: '任务管理器 Task Manager',
    icon: 'cpu',
    desc: '对标 Windows 任务管理器：Segmented 切进程/性能两视图——进程=虚拟化万级进程表（列排序 + 行选联动摘要），性能=四资源环形占用 + 历史面积曲线 + Top 进程柱状，明暗自适应。',
    node: <TaskManagerDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'calendar-schedule',
    title: '日程日历 Calendar & Schedule',
    icon: 'calendar',
    desc: '左月历（dateCellRender 在含日程日期打分类彩点）+ 图例，右选中日议程——Timeline 彩色节点 + 事件卡片（时间/标题/地点/分类 Tag），多分类色彩语义，明暗自适应。',
    node: <CalendarScheduleDemo />,
    padding: 0,
    scroll: false,
  },
  {
    key: 'api-client',
    title: 'API 调试台 API Client',
    icon: 'globe',
    desc: '对标 Postman 精简版：左请求集合点击载入，右方法 Select + URL Input + 发送按钮的受控请求状态机，Params/Headers 预览 + 响应面板（状态码 Tag/耗时/体积 + Segmented 切 Body/Headers/Cookies，Body 用 JsonViewer 折叠树），本地确定性 mock，明暗自适应。',
    node: <ApiClientDemo />,
    padding: 0,
    scroll: false,
  },
];

/** 开一扇案例窗：尺寸/主题/背景/滚动/去重全交给 openThemedWindow（默认与主窗同尺寸） */
function openCase(c: CaseDef): void {
  openThemedWindow({ tag: `case-${c.key}`, title: c.title, node: c.node, scroll: c.scroll, padding: c.padding });
}

function CaseCard(props: { c: CaseDef }): React.ReactElement {
  const { token } = useToken();
  const { c } = props;
  return (
    <Pressable
      onPress={() => openCase(c)}
      style={{
        width: 232,
        padding: token.paddingMD,
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        backgroundColor: token.colorBgContainer,
        cursor: 'pointer',
        gap: token.marginXS,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: token.borderRadius,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: token.colorPrimaryBg,
          }}
        >
          <Icon name={c.icon} size={17}/>
        </View>
        <Text style={{ flex: 1, minWidth: 0, fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>{c.title}</Text>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, lineHeight: token.lineHeight * token.fontSizeSM * 1.3 }}>
        {c.desc}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS, marginTop: 2 }}>
        <Icon name="appstore" size={12} color={token.colorPrimary} />
        <Text style={{ fontSize: token.fontSizeSM, fontWeight: '600', color: token.colorPrimary }}>在新窗口打开</Text>
      </View>
    </Pressable>
  );
}

/** 案例段主区：无左菜单，一块大白板 + 卡片栅格（外层 ScrollView，卡片多时纵向滚动） */
export function CaseBoard(): React.ReactElement {
  const { token } = useToken();
  return (
    <View
      style={{
        flex: 1,
        minHeight: 0,
        backgroundColor: token.colorBgContainer,
        padding: token.padding,
      }}
    >
      <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ paddingVertical: token.padding }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: token.margin }}>
          {CASES.map((c) => (
            <CaseCard key={c.key} c={c} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
