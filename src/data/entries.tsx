// 内容区条目注册表：每个导航叶子 key → { title, desc, node }。
// buildEntries 仅调用一次（Shell useMemo），返回的 ReactElement 引用稳定以保滚动 blit 纯平移。
import React from 'react';
import { ThemeDemo } from '../demos/theme';
import { ButtonDemo } from '../demos/button';
import { DragDemo } from '../demos/drag';
import { EmojiDemo } from '../demos/emoji';
import { TagDemo } from '../demos/tag';
import { BadgeDemo } from '../demos/badge';
import { CardDemo } from '../demos/card';
import { CellDemo } from '../demos/cell';
import { SwitchDemo } from '../demos/switch';
import { CheckboxDemo } from '../demos/checkbox';
import { RadioDemo } from '../demos/radio';
import { ProgressDemo } from '../demos/progress';
import { AvatarDemo } from '../demos/avatar';
import { DividerDemo } from '../demos/divider';
import { EmptyDemo } from '../demos/empty';
import { ResultDemo } from '../demos/result';
import { DescriptionsDemo } from '../demos/descriptions';
import { SkeletonDemo } from '../demos/skeleton';
import { TimelineDemo } from '../demos/timeline';
import { StepsDemo } from '../demos/steps';
import { StatisticDemo } from '../demos/statistic';
import { IconDemo } from '../demos/icon';
import { MenuDemo } from '../demos/menu';
import { SpinDemo } from '../demos/spin';
import { TabsDemo } from '../demos/tabs';
import { SegmentedDemo } from '../demos/segmented';
import { AlertDemo } from '../demos/alert';
import { BreadcrumbDemo } from '../demos/breadcrumb';
import { CollapseDemo } from '../demos/collapse';
import { RateDemo } from '../demos/rate';
import { TreeDemo } from '../demos/tree';
import { PaginationDemo } from '../demos/pagination';
import { TableDemo } from '../demos/table';
import { FloatButtonDemo } from '../demos/float-button';
import { CalendarDemo } from '../demos/calendar';
import { LayoutDemo } from '../demos/layout';
import { ListDemo } from '../demos/list';
import { TodoDemo } from '../demos/todo';
import { MasonryDemo } from '../demos/masonry';
import { InfiniteScrollDemo } from '../demos/infinite-scroll';
import { VirtualListDemo } from '../demos/virtual-list';
import { ProTableDemo } from '../demos/pro-table';
import { StatCardDemo } from '../demos/stat-card';
import { DashboardDemo } from '../cases/dashboard';
import { CryptoLiveDemo } from '../cases/crypto-live';
import { MallDemo } from '../cases/mall';
import { WalletDemo } from '../cases/wallet';
import { WeatherDemo } from '../cases/weather';
import { AlmanacDemo } from '../cases/almanac';
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
import { ProDescriptionsDemo } from '../demos/pro-descriptions';
import { ProCardDemo } from '../demos/pro-card';
import { CheckCardDemo } from '../demos/check-card';
import { HighlightDemo } from '../demos/highlight';
import { ProFormDemo } from '../demos/pro-form';
import { TrendCardDemo } from '../demos/trend-card';
import { PriceCardDemo } from '../demos/price-card';
import { CodeBlockDemo } from '../demos/code-block';
import { JsonViewerDemo } from '../demos/json-viewer';
import { DiffViewerDemo } from '../demos/diff-viewer';
import { RegexTesterDemo } from '../demos/regex-tester';
import { CommandPaletteDemo } from '../demos/command-palette';
import { LogViewerDemo } from '../demos/log-viewer';
import { CronParserDemo } from '../demos/cron-parser';
import { TimeConverterDemo } from '../demos/time-converter';
import { MemMonitorDemo } from '../demos/mem-monitor';
import { TypographyDemo } from '../demos/typography';
import { PageLayoutDemo } from '../demos/page-layout';
import { SpaceDemo } from '../demos/space';
import { ImageDemo } from '../demos/image';
import { CarouselDemo } from '../demos/carousel';
import { BackTopAnchorDemo } from '../demos/back-top';
import { SplitterDemo } from '../demos/splitter';
import { GradientDemo } from '../demos/gradient';
import { WatermarkDemo } from '../demos/watermark';
import { QRCodeDemo } from '../demos/qr-code';
import { TransferDemo } from '../demos/transfer';
import { ColorPickerDemo } from '../demos/color-picker';
import { SelectDemo } from '../demos/select';
import { DatePickerDemo } from '../demos/date-picker';
import { TimePickerDemo } from '../demos/time-picker';
import { ModalDemo } from '../demos/modal';
import { PopoverDemo } from '../demos/popover';
import { PopconfirmDemo } from '../demos/popconfirm';
import { SliderDemo } from '../demos/slider';
import { AutoCompleteDemo } from '../demos/auto-complete';
import { MentionsDemo } from '../demos/mentions';
import { AffixDemo } from '../demos/affix';
import { FormDemo } from '../demos/form';
import { InputOTPDemo } from '../demos/input-otp';
import { UploadDemo } from '../demos/upload';
import { TagInputDemo } from '../demos/tag-input';
import { SearchDemo } from '../demos/search';
import { MarkdownDemo } from '../demos/markdown';
import { TooltipDemo } from '../demos/tooltip';
import { InputNumberDemo } from '../demos/input-number';
import { InputDemo } from '../demos/input';
import { TextAreaDemo } from '../demos/text-area';
import { DrawerDemo } from '../demos/drawer';
import { TreeSelectDemo } from '../demos/tree-select';
import { CountDownDemo } from '../demos/count-down';
import { CascaderDemo } from '../demos/cascader';
import { DropdownDemo } from '../demos/dropdown';
import { MessageDemo } from '../demos/message';
import { NotificationDemo } from '../demos/notification';
import { UseAppDemo } from '../demos/use-app';
import { TransformDemo } from '../demos/transform';
import { AnimationDemo } from '../demos/animation';
import { LineDemo, AreaDemo, ColumnDemo, BarDemo, PieDemo, RadarDemo, GaugeDemo, ScatterDemo, RoseDemo, FunnelDemo, WaterfallDemo, HeatmapDemo, ComboDemo, SparklineDemo, TreemapDemo, SunburstDemo, SankeyDemo, BoxPlotDemo, HistogramDemo, ViolinDemo, RangeBarDemo, RadialBarDemo, BulletDemo, CalendarHeatmapDemo, ExportDemo } from '../demos/chart';
import { CandleDemo, TimeSharingDemo, StreamCandleDemo, StockPanelDemo, DepthDemo } from '../demos/chart-finance';
import { DendrogramHDemo, DendrogramVDemo, DendrogramRDemo, DendrogrCompactHDemo, DendrogrCompactVDemo, DendrogrCompactRDemo } from '../demos/tree-ecology';
import { IndentedTreeDemo, IndentedTreeLeftDemo, IndentedTreeLineDemo, IndentedTreeBoxDemo, IndentedTreeCollapseDemo } from '../demos/indented-tree';
import { FlowChartDemo, FlowScheduleDemo, FlowHighlightDemo } from '../demos/flow-chart';
import { MindMapDemo, MindMapRightDemo, MindMapLeftDemo, MindMapLineDemo, MindMapBoxDemo, MindMapCollapseDemo } from '../demos/mind-map';
import { OrgBasicDemo, OrgCardDemo, OrgHorizontalDemo } from '../demos/org-chart';
import { AddressDemo, TokenPriceDemo, PriceRangeDemo, NFTCardDemo, Web3AvatarDemo } from '../demos/web3';
import { CoinIconDemo } from '../demos/coin-icon';
import { IoFilePickerDemo } from '../demos/io-file-picker';
import { IoFileSaverDemo } from '../demos/io-file-saver';
import { SysWelcomeDemo } from '../demos/sys-welcome';
import { SysLifecycleDemo } from '../demos/sys-lifecycle';
import { SysRenderDemo } from '../demos/sys-render';
import { SysFontDemo } from '../demos/sys-font';
import { SysEventDemo } from '../demos/sys-event';
import { SysMultiwinDemo } from '../demos/sys-multiwin';
import { SysWindowDemo } from '../demos/sys-window';
import { SysKvDemo } from '../demos/sys-kv';
import { SysLogDemo } from '../demos/sys-log';
import { SysTrayDemo } from '../demos/sys-tray';
import { SysMethodsDemo } from '../demos/sys-methods';
import { SysConstantsDemo } from '../demos/sys-constants';
import { WebViewDemo } from '../demos/webview';
import { FfiDemo } from '../demos/ffi';

/** 顶部主题控制维度（Shell → buildEntries 透传给 ThemeDemo） */
export type ThemeCtl = {
  dark: boolean;
  compact: boolean;
  setDark: (v: boolean) => void;
  setCompact: (v: boolean) => void;
  animation: boolean;
  setAnimation: (v: boolean) => void;
  primary: string;
  setPrimary: (v: string) => void;
};

export interface Entry {
  title: string;
  desc: string;
  node: React.ReactElement;
}

export function buildEntries(ctl: ThemeCtl): Record<string, Entry> {
  return {
    'sys-welcome': { title: '欢迎 Welcome', desc: '门户入口：技术栈速览 · 技术特色 · 界面掠影 · 下一步路线图 · 未来展望', node: <SysWelcomeDemo /> },
    'sys-lifecycle': { title: '生命周期 Lifecycle', desc: '从一次 setState 到屏幕上一帧：react-reconciler 提交 → 全局事件泵 → 场景树 diff → Yoga 布局 → Skia 软件光栅 → softbuffer 上屏', node: <SysLifecycleDemo /> },
    'sys-render': { title: '渲染 Rendering', desc: '两处正交的运行时可调档位：渲染后端（GPU 直呈 ↔ CPU 光栅，切换需重启）与光栅分辨率（dpr 封顶 100/150/200%，热切换）；详解 present 读回占 70% · 成本∝dpr² · 上采样锯齿代价 · JS+Rust 双闸 · Application.setRenderer/setResolution 接口', node: <SysRenderDemo /> },
        'sys-font': { title: '字体 Font', desc: 'app.json 声明字体资源 + 全局字体档（写偏好 App.prefs.font + 重启，影响全 App 正文含 Input）与局部覆盖（style.fontFamily 即时生效）两条正交路；详解豆腐兜底链（主字体→内置 CJK 雅黑→emoji，逐字形回退）· 度量与绘制同源 · Application.setFont/listFontFamilies 接口', node: <SysFontDemo /> },
    'sys-event': { title: '事件 Event', desc: '无 DOM 的事件从哪来、怎么派发：底座回抛原始信号 → hitTest 命中最上层叶子 → find* 沿 parent 链向上归一到唯一 owner。详解两条循环（16ms 事件泵 + scheduleFrame 帧环）、为何无捕获/无冒泡广播/无 stopPropagation、RN press&release 语义，逐个事件讲解与组件事件属性速查', node: <SysEventDemo /> },
    'sys-multiwin': { title: '多窗口 Multi-Window', desc: 'Application 单例 + 每窗一 React 根 + 全局事件泵 + 纯 JS 模态事件门；命令式 Application.open 弹窗 / 模态锁 / 跨窗主题同步', node: <SysMultiwinDemo /> },
    'sys-window': { title: '窗口 Window', desc: '缩放开关 resizable、最小/最大尺寸约束 min/max、四阶段生命周期回调（准备加载/加载中/加载完成/关闭），以及运行时命令式窗口控制 Application.get(id).host.*', node: <SysWindowDemo /> },
    'sys-kv': { title: '轻量级键值持久化 KV Store', desc: '自研 bitcask 式 KV（追加日志 + CRC 回放）：系统层 flux_app.kv 与用户层 flux_user.kv 两份独立、值类型化、非明文、重开回灌', node: <SysKvDemo /> },
    'sys-log': { title: '日志 Logger', desc: '自研双层日志：系统日志（核心自动写 + console 捕获、不可干预）与用户日志（默认允许直写）分离；dataDir()/logs 下日期+分片、单文件 1MB 轮转、app.json.logger 配目录/级别', node: <SysLogDemo /> },
    'sys-tray': { title: '系统托盘 Tray', desc: '自研底座无托盘 API→原生 tray-icon 接通知区图标；不挂原生菜单（只跟系统明暗），改自绘无边框置顶主题菜单弹窗。详解显示逻辑（无 alpha 露黑→窗口高=内容高、几何全常量、圆角垫色、关闭三径）、定位逻辑（物理 rect÷scale→逻辑、右缘对齐、夹屏内）、跨平台差异（Win/mac/Linux 各后端事件与 rect 支持）、Dock/任务栏不在底怎么算，并列出未实现/已知问题', node: <SysTrayDemo /> },
    'sys-stats': { title: '系统取数 SystemStats', desc: '把内存监控面板的取数逻辑抽成可随时调用的类：systemStats 单例聚合 进程内存 / 图片解码缓存 / 运行时长 / 逐窗渲染面 / 帧率 / GC，全部即时快照、无内部定时器；MemMonitor 面板内部亦消费本类，二者永远同源', node: <SysMethodsDemo /> },
    'sys-constants': { title: '系统常量 SystemConstants', desc: '与 SystemStats 互补的「启动即定、运行期不变」环境事实：systemConstants 单例聚合 平台/架构/操作系统/主机名/用户会话/CPU 型号与核数/整机内存/Node·V8·uv·napi·openssl·ABI 版本/进程 pid·ppid·execPath/时区·区域·语言，纯 os + process 无原生依赖、每字段 safe() 兜底、模块加载时算一次并 Object.freeze；附 systemConstantsJSON() 一键序列化，demo 里按维度铺卡片并可复制全表', node: <SysConstantsDemo /> },
    theme: { title: '主题 Theme', desc: '外观（明/暗）× 密度（紧凑/宽松）× 主色 三个正交维度可叠加 —— token 是唯一事实来源', node: <ThemeDemo {...ctl} /> },
    transform: { title: '变换 Transform', desc: '绘制期 2D 变换：translate/scale/rotate/skew + transformOrigin + 子树继承 + 入场组件', node: <TransformDemo /> },
    animation: { title: '动效 Animation', desc: '动画库全景：交互弹簧 + 缓动曲线可视化 + 弹簧实验室 + Stagger 错峰 + Transition 进出场 + 预设墙 + 序列编排 + FLIP', node: <AnimationDemo /> },
    menu: { title: '菜单 Menu', desc: '参考 antd：items / 分组 / 子菜单就地展开动画 / 自定义节点 / 危险 / 禁用 / 深色', node: <MenuDemo /> },
    button: { title: '按钮 Button', desc: '类型 / 尺寸 / 形状 / 图标 / 危险 / 幽灵 / 禁用 / 加载 / 块级，几何与颜色全取自 token', node: <ButtonDemo /> },
    tag: { title: '标签 Tag', desc: '预设语义色 / 无边框 / 自定义色 / icon 前置图标 / closable 可关闭 / CheckableTag 可选中', node: <TagDemo /> },
    badge: { title: '徽标 Badge', desc: '数字 / 小红点 / 溢出 99+ / 独立使用 / 状态点 / 绶带 Ribbon', node: <BadgeDemo /> },
    avatar: { title: '头像 Avatar', desc: '文本 / 图标 / 图片 / 尺寸 / 形状 / 底色 / 头像组溢出折叠', node: <AvatarDemo /> },
    divider: { title: '分割线 Divider', desc: '水平分割与文字', node: <DividerDemo /> },
    icon: { title: '图标 Icon', desc: '矢量 SVG path 层，随主题换色、等比缩放', node: <IconDemo /> },
    switch: { title: '开关 Switch', desc: '受控 / 非受控 / 文字图标 / 尺寸 / 加载态 / 禁用', node: <SwitchDemo /> },
    checkbox: { title: '多选 Checkbox', desc: '矢量勾选 / 半选联动 / Group 选项组 / 手写子项 / 整组禁用', node: <CheckboxDemo /> },
    radio: { title: '单选 Radio', desc: '实心圆点 / Group 选项组 / 按钮风格 / 尺寸 / 手写子项 / 禁用', node: <RadioDemo /> },
    progress: { title: '进度 Progress', desc: '线形 / 环形 / 仪表盘 / steps 分格 / success 叠加 / gapDegree 缺口 / format 自定义 · 圆弧走 Icon raw path', node: <ProgressDemo /> },
    card: { title: '卡片 Card', desc: '标题 / 封面 / 操作 / 无边框与尺寸 / 悬停 / 加载 / 内部卡片 / Meta', node: <CardDemo /> },
    cell: { title: '列表 Cell', desc: '左图标+标题+描述 / 右 extra与矢量箭头 / 禁用 / 分隔线开关', node: <CellDemo /> },
    statistic: { title: '统计 Statistic', desc: '标题 + 大数值 · count-up 动画 + 千分位 / precision / loading / formatter', node: <StatisticDemo /> },
    descriptions: { title: '描述 Descriptions', desc: '键值成组 / 带边框 / 垂直布局 / 尺寸 / 去冒号 / 额外内容 extra / 跨列 span', node: <DescriptionsDemo /> },
    steps: { title: '步骤 Steps', desc: '横向 / 竖向 / 迷你 / 点状 / 标题在下 / 自定义图标 / 可点击 / 线条定制 / 错误', node: <StepsDemo /> },
    timeline: { title: '时间线 Timeline', desc: '节点与连线 / 彩色语义点 / 自定义 dot / mode left·right·alternate / label / pending / reverse', node: <TimelineDemo /> },
    skeleton: { title: '骨架 Skeleton', desc: '加载占位 / active 呼吸脉冲 / avatar-title-paragraph 开关 / paragraph rows / loading 切换 / Image 变体', node: <SkeletonDemo /> },
    empty: { title: '空状态 Empty', desc: '默认 inbox 插画 / 自定义描述 / 仅图 / 自定义插画 image / 带操作 / 尺寸', node: <EmptyDemo /> },
    result: { title: '结果 Result', desc: '状态图标走矢量圆环 / success·error·info·warning 四态 / HTTP 404-403-500 / icon 自定义 / extra 操作', node: <ResultDemo /> },
    spin: { title: '加载 Spin', desc: '弧线绕中心旋转 / 三尺寸 / tip / 自定义 indicator / 包裹内容遮罩态 / 受控 spinning', node: <SpinDemo /> },
    tabs: { title: '标签页 Tabs', desc: 'line 墨条 / card / 可增删 / 四向位置 / 大小 / 图标 / 居中 / 额外内容', node: <TabsDemo /> },
    segmented: { title: '分段控制 Segmented', desc: '滑动滑块 / block 撑满 / 尺寸 / 图标 / round 形状 / 禁用', node: <SegmentedDemo /> },
    alert: { title: '警告提示 Alert', desc: '四语义色取自 token / 带描述 / showIcon / closable / 自定义 icon / closeText / action 操作区 / banner', node: <AlertDemo /> },
    breadcrumb: { title: '面包屑 Breadcrumb', desc: '末项当前页，其余可点', node: <BreadcrumbDemo /> },
    collapse: { title: '折叠面板 Collapse', desc: 'items 配置 / 手风琴 / 无边框与幽灵 / 尺寸 / 箭头位置与自定义 / 触发区域 collapsible / 禁用', node: <CollapseDemo /> },
    rate: { title: '评分 Rate', desc: '受控 / 只读 / 半星 / 自定义字符 / 数量配色 / 清除 / 禁用', node: <RateDemo /> },
    tree: { title: '树 Tree', desc: '递归展开 / 选中 / checkable 复选框 / 父子联动+半选 / checkStrict / multiple / defaultExpandAll / 禁用', node: <TreeDemo /> },
    pagination: { title: '分页 Pagination', desc: '标准 / 受控 / 显示总数 / 迷你 / 禁用 / 简洁 / 省略号 / itemRender 自定义', node: <PaginationDemo /> },
    table: { title: '表格 Table', desc: 'columns+dataSource / 斑马纹 / 边框 / 行悬停 / size 三档 / sorter 排序 / rowSelection 多选单选 / loading', node: <TableDemo /> },
    drag: { title: '拖拽 Drag & Drop', desc: '应用内拖放子系统：useDrag / useDrop 钩子 + 跟随光标 ghost（DragLayer）——基础拖放 / 类型过滤 / 列表拖拽排序', node: <DragDemo /> },
    emoji: { title: 'Emoji 渲染', desc: '自绘栈彩色 emoji（字体族回退）：分类总览 / CJK·拉丁混排 / 尺寸缩放 / ZWJ·肤色·国旗缺口', node: <EmojiDemo /> },
    'float-button': { title: '悬浮按钮 FloatButton', desc: '圆形/方形 · 主/次 · 徽标 · 描述文字 · 气泡提示 · 按钮组', node: <FloatButtonDemo /> },
    calendar: { title: '日历 Calendar', desc: '月历 / 年历 / 今天高亮 / 点选 / 翻月 / validRange / disabledDate / dateCellRender / dateFullCellRender / 时区', node: <CalendarDemo /> },
    'flex-grid': { title: '布局 Flex / Grid', desc: '弹性布局 + 24 栏栅格，gap 走 token', node: <LayoutDemo /> },
    'page-layout': { title: '页骨架 Layout', desc: 'Header / Sider / Content / Footer，底色全走 token；Sider 可折叠（宽度缓动 + 箭头旋转）', node: <PageLayoutDemo /> },
    splitter: { title: '分割面板 Splitter', desc: '百分比面板几何 + useTween 缓动折叠；拖拽调宽待 pointer capture 管线', node: <SplitterDemo /> },
    space: { title: '间距 Space', desc: 'gap 驱动的子项间距，size 走 token 档；split 分隔符 / wrap 换行 / block 占满', node: <SpaceDemo /> },
    gradient: { title: '渐变背景 Gradient', desc: '纯色 View 无原生渐变：用平行铺条 + 容器旋转 + overflow 裁切组合出任意角度线性渐变（Hero 卡 / Banner / 进度条 / 标签底纹）', node: <GradientDemo /> },
    list: { title: '列表 List', desc: 'header / footer / split / loading 遮罩复用 Spin / List.Item actions·extra·itemLayout', node: <ListDemo /> },
    todo: { title: '待办 Todo', desc: '数据驱动待办清单：点击行切换完成（标题划线）；支持自定义节点——item.node 换内容区 / renderItem 接管整行（ctx 提供 done/toggle/remove）；受控删除 + showCount 计数 + 三档尺寸', node: <TodoDemo /> },
    typography: { title: '排版 Typography', desc: '标题阶梯由 fontSize token 派生，换算法自动缩放', node: <TypographyDemo /> },
    image: { title: '图片 Image', desc: '异步解码 · cover/contain · 形状 circle/square · caption · 空 src 占位 alt/fallback', node: <ImageDemo /> },
    masonry: { title: '瀑布流 Masonry', desc: '最短列优先分列（依赖条目 height、无需测量）/ 随机图加载压力测试', node: <MasonryDemo /> },
    'infinite-scroll': { title: '无限滚动 InfiniteScroll', desc: '滚动容器 + 触底加载：footer 加载中 / 没有更多 / 失败重试三态，迟滞 re-arm 防连发', node: <InfiniteScrollDemo /> },
    'virtual-list': { title: '虚拟列表 VirtualList', desc: '固定行高虚拟化：仅渲染视口 ±overscan 行，万行场景每帧绘制节点数从 O(总行) 降到 O(可见行)；附虚拟化/全量对照开关', node: <VirtualListDemo /> },
    'pro-table': { title: '高阶表格 ProTable', desc: '筛选栏 + 工具栏 + 表格 + 分页一体：列上 search 自动生成搜索项，本地过滤 / 异步 request 双模式', node: <ProTableDemo /> },
    'stat-card': { title: '指标卡 StatCard', desc: '仪表盘指标卡：count-up 数值 + 趋势语义色（invert 反转）+ 迷你柱条；StatisticGroup 一排等分', node: <StatCardDemo /> },
    dashboard: { title: '数据可视化大屏 Dashboard', desc: '深蓝科技风监控指挥大屏：顶部标题条（实时时钟+状态）+ KPI 大数字栏 + 三栏面板栅格（仪表/分组柱/面积/散点分布/环形饼/雷达/时间线）+ 告警明细表，零新增原子件 + 整屏快照导出 PNG', node: <DashboardDemo /> },
    'crypto-live': { title: '区块链币价实时看板 Crypto Live', desc: '币安官方 API 直连（无需 Key）：热门币带 + TokenPrice 币价卡 + KPI 统计行 + 1s/1m/5m/15m 实时滚动 K 线（MA/MACD/VOL 三面板）+ 订单簿深度 + 盘口梯 + 逐笔成交 + 24h 行情榜；离线自动降级模拟数据', node: <CryptoLiveDemo /> },
    mall: { title: '商城首页 Mall Shop', desc: '参照淘宝 PC 首页的整页电商组合：顶部信息条 + 热词轮播搜索 + 三栏 hero（类目栏/轮播/会员卡）+ 补贴频道横幅 + 紧凑秒杀 + 每排 5 卡猜你喜欢网格 + 内联购物车 + 页脚', node: <MallDemo /> },
    wallet: { title: 'EVM 钱包 Wallet', desc: '参照 TokenPocket 功能逻辑的桌面多链钱包案例：多链切换 + 多钱包管理 + 资产（测试节点真实 JSON-RPC 余额，离线降级模拟）+ 行情 + DApp 占位 + 交易记录 + 转账/收款/创建/导入（演示态，不签名不广播）', node: <WalletDemo /> },
    weather: { title: '天气 Weather', desc: 'Open-Meteo 公共 API 直连（无需 Key）对标 MSN 天气整页：实况大字 + 天气 emoji + 高低温 + 7 日预报条 + 逐时温度面积曲线 + 降水概率，右侧能见度/风/气压/空气质量/湿度/紫外线/日照指标瓦片；°C/°F 切换 + 城市切换，离线自动降级模拟，全走主题 token 明暗自适应', node: <WeatherDemo /> },
    almanac: { title: '万年历 Almanac', desc: '公历月历 + 传统黄历：农历/干支三柱（年月日柱）/生肖/纳音/月相/星座，节气与公历农历节日标注，选中日详列宜忌、吉神凶煞、冲煞、彭祖百忌、财神喜神福神方位；年月翻页 + 一键今天 + 本月节气节日概览；换算走 lunar-typescript 已锚点校验，全走主题 token 明暗自适应', node: <AlmanacDemo /> },
    'sys-monitor': { title: '系统监控托盘小部件 Sys Monitor', desc: '常驻托盘的迷你性能面板：整机 CPU 使用率 / 系统内存占用 / 实时帧率一屏速览；纯 Node os 采样无原生依赖，复用库 systemStats；托盘右键「系统监控」唤出无边框置顶小窗，点外即关、已开则 toggle，全走 token 明暗自适应', node: <SysMonitorDemo /> },
    'file-manager': { title: '文件管理器 + 快速预览 File Manager', desc: '三栏桌面文件管理器：左懒加载目录树(Tree)、中虚拟化文件列表(VirtualList)、右按类型快速预览（图片直显 / 代码·文本纯文本预览 / 其它元信息）；纯 Node fs 读真实磁盘，无造假，全走 token 明暗自适应', node: <FileManagerDemo /> },
    'chat': { title: '即时通讯 Chat', desc: '双栏 IM：左会话列表（Avatar + 未读 Badge + 搜索过滤），右消息气泡流 + 输入框（回车发送 / emoji 快选 / 在线状态）；切换会话、发消息、搜索均为真实本地状态交互，全走 token 明暗自适应', node: <ChatDemo /> },
    'kanban': { title: '看板 Kanban', desc: '任务管理四列泳道（待办/进行中/待评审/已完成）+ 任务卡（标签/优先级/负责人头像组/到期）；◀▶ 点选跨列移动、Modal 新建、卡片删除，整块看板落 kv 持久化（重启回灌），全走 token 明暗自适应', node: <KanbanDemo /> },
    'music': { title: '音乐播放器 Music Player', desc: '左播放列表（封面色块 + 当前曲高亮 + 均衡器条），右现播大封面 + 进度 Slider + 传输控制 + 音量 + 喜欢；播放用 setInterval 每秒真实推进进度、到点自动切歌，全走 token 明暗自适应', node: <MusicDemo /> },
        'mail': { title: '邮件客户端 Mail', desc: '三栏邮件：左文件夹（未读徽标）、中邮件列表（头像/主题/摘要/附件/未读点）、右阅读区（正文 + 附件 + 回复框）；切文件夹过滤、点邮件标已读、星标切换、搜索均真实本地状态，全走 token 明暗自适应', node: <MailDemo /> },
        'checkout': { title: '购物车结算 Checkout', desc: '左购物车条目（封面/规格/单价/数量 InputNumber/小计/删除），右订单摘要（优惠券 FLUX10 打 9 折 / 商品小计 / 运费 / 满 ¥99 免邮进度 / 合计 / 去结算）；改数量、删条目、券码实时联动，全走 token 明暗自适应', node: <CheckoutDemo /> },
        'settings': { title: '系统设置 Settings', desc: '左分组导航（通用/外观/通知/隐私/高级）、右受控控件区：Select 语言、Switch 开关、Slider 缩放/圆角/缓存、Segmented 主题、Radio 通知方式、主题色块、恢复默认；全真实本地受控，全走 token 明暗自适应', node: <SettingsDemo /> },
    'terminal': { title: '终端 / SSH 面板 Terminal', desc: '会话管理器式终端面板：左会话列表（本地 PowerShell / CMD、SSH 主机、只读部署日志），右当前终端主体；复用库自绘终端组件族 LiveTerminal（node-pty 真 shell）/ SshTerminal（ssh2 远程）/ Terminal（七色语义日志），VT 网格屏 + SGR 配色，终端 App 惯例恒深色', node: <TerminalPanelDemo /> },
            'dev-toolkit': { title: '开发者工具箱 Dev Toolkit', desc: '左工具导航 + 右主体，一次性秀出库自绘整族 dev 组件：CodeBlock 多语言高亮 / Markdown 渲染 / JsonViewer 可折叠树 / DiffViewer 双栏对比 / RegexTester 实时匹配 / CronParser 触发预览 / TimeConverter 时间戳 / LogViewer 分级日志 / CommandPalette 命令面板，明暗自适应', node: <DevToolkitDemo /> },
    'admin-crud': { title: '管理后台 · 用户管理 Admin CRUD', desc: 'KPI 概览条 + 搜索/状态/部门受控筛选 + 批量选择 + 万行虚拟化表格(Table virtual) + 列排序 + 语义状态 Tag + 右侧 Descriptions 详情主从面板，全本地确定性数据，明暗自适应', node: <AdminCrudDemo /> },
    'task-manager': { title: '任务管理器 Task Manager', desc: '对标 Windows 任务管理器：Segmented 切进程/性能两视图——进程=虚拟化万级进程表(CPU/内存/磁盘/网络列排序 + 行选联动摘要)，性能=CPU/内存/磁盘/网络环形占用 + 历史面积曲线 + Top 进程柱状，明暗自适应', node: <TaskManagerDemo /> },
    'calendar-schedule': { title: '日程日历 Calendar & Schedule', desc: '左月历(Calendar dateCellRender 在含日程日期打分类彩点)+图例，右选中日议程——Timeline 彩色节点 + 事件卡片(时间/标题/地点/分类 Tag)，多分类色彩语义，明暗自适应', node: <CalendarScheduleDemo /> },
    'api-client': { title: 'API 调试台 API Client', desc: '对标 Postman 精简版：左请求集合点击载入，右方法 Select + URL Input + 发送按钮的受控请求状态机(idle→sending→done)，Params/Headers 预览 + 响应面板(状态码 Tag/耗时/体积 + Segmented 切 Body/Headers/Cookies，Body 用 JsonViewer 折叠树)，本地确定性 mock 无网络依赖，明暗自适应', node: <ApiClientDemo /> },
    'pro-descriptions': { title: '详情描述 ProDescriptions', desc: 'schema 驱动详情：valueType copy/link/badge 内置渲染，request 异步 + 骨架占位', node: <ProDescriptionsDemo /> },
    'pro-form': { title: '轻量表单 ProForm', desc: 'fields schema 一行一字段：栅格排布 + 必填/长度/正则/区间校验 + 异步提交 loading + 命令式 actions', node: <ProFormDemo /> },
    'highlight': { title: '关键词高亮 Highlight', desc: '搜索结果回显：多关键词归并命中、大小写开关、只高亮首个、自定义高亮色', node: <HighlightDemo /> },
    'trend-card': { title: '行情趋势卡 TrendCard', desc: '名称 + 大字现价（count-up）+ 涨跌额/幅染色 + 内嵌面积迷你走势；面向金融行情看板，涨红跌绿可覆盖', node: <TrendCardDemo /> },
    'price-card': { title: '定价方案卡 PriceCard', desc: 'SaaS 定价页：币种前缀 + 大字价格 + 周期后缀 + 权益三态（打勾/打叉/加号增值）+ 推荐高亮描边角标；PriceTable 多档并排等高', node: <PriceCardDemo /> },
    'pro-card': { title: '区块卡片 ProCard', desc: '页面区块容器：页头三件套（title/subtitle/tooltip）+ extra，split 分栏、ghost 幽灵、collapsible 折叠、loading 骨架', node: <ProCardDemo /> },
    'check-card': { title: '可选卡片 CheckCard', desc: '选项即卡片：单选/多选组，options 数据驱动或手写子卡；选中主色描边 + 右上角标，支持 avatar/cover/disabled', node: <CheckCardDemo /> },
    'code-block': { title: '代码块 CodeBlock', desc: '只读代码展示：零依赖轻量分词高亮（js/ts/json/python/bash/css/go/rust/java/c/cpp/php/ruby/sql/yaml）+ 行号 + 复制 + 软换行 + 行高亮/起始行号 + maxHeight；颜色全走语义 token，明暗主题自适应', node: <CodeBlockDemo /> },
    'json-viewer': { title: 'JSON 树 JsonViewer', desc: '可折叠 JSON 树：类型着色 + 数组/对象长度标 + 初始展开深度 + 复制；面向接口响应 / 配置预览', node: <JsonViewerDemo /> },
    'diff-viewer': { title: '差异对比 DiffViewer', desc: '行级 LCS diff：unified 单栏 + split 双栏，增删语义底色、行号对齐、未变区折叠；纯函数算法零依赖', node: <DiffViewerDemo /> },
    'regex-tester': { title: '正则测试 RegexTester', desc: '模式 + flags + 测试文本实时求值：命中区间高亮、编号/命名捕获组列表、替换预览；非法正则与零宽匹配有护栏', node: <RegexTesterDemo /> },
    'command-palette': { title: '命令面板 CommandPalette', desc: '⌘K 式面板：fzf 模糊打分（词首/驼峰/分隔符/连续加成 + gap 罚）+ 命中高亮 + ↑↓/Enter 键盘导航 + 分组与 keywords；依赖 Input 的 onKeyDown 逃生口', node: <CommandPaletteDemo /> },
    'log-viewer': { title: '日志查看器 LogViewer', desc: '混合级别服务日志：级别阈值过滤 + 关键词搜索 + 跟随底部 + 级别计数概览 + error/fatal 行底色；纯过滤逻辑零依赖可探针', node: <LogViewerDemo /> },
    'cron-parser': { title: 'Cron 解析器 CronParser', desc: '5 段 cron 表达式→合法性 + 中文描述 + 五字段分解 + 未来 N 次触发时刻；支持 @daily 等宏、步进/范围/列表/名称，日周 OR 语义，纯算法探针验证', node: <CronParserDemo /> },
    'time-converter': { title: '时间戳转换 TimeConverter', desc: 'Unix 时间戳↔日历时间双向转换：秒/毫秒自动识别 + 实时此刻时钟 + 多时区切换 + UTC/ISO/相对时间；纯算法探针验证', node: <TimeConverterDemo /> },
    'mem-monitor': { title: '内存监控 MemMonitor', desc: 'process.memoryUsage() 定时采样悬浮面板：RSS/Heap/External 三条走势 + 峰值/明细 + warnMB 警戒 + GC(--expose-gc)/清空；floating 悬浮父容器右下角，挂 Window 根末尾即整窗常驻监控', node: <MemMonitorDemo /> },
    markdown: { title: 'Markdown 渲染', desc: '轻量解析器 + 组件渲染：标题/粗斜/行内代码/链接/有序无序列表/fenced code(复用 CodeBlock)/引用/分割线；零第三方依赖', node: <MarkdownDemo /> },
    line: { title: '折线图 Line', desc: '@ant-design/charts 式 data+字段；多序列沿弧长自左向右描线，顶点随到达浮现', node: <LineDemo /> },
    area: { title: '面积图 Area', desc: '折线下方半透明填充，薄片沿 x 左→右生长；stack 逐序列堆叠', node: <AreaDemo /> },
    column: { title: '柱状图 Column', desc: '每柱从基线长高、类目间错峰；grouped / stack 两种多序列布局', node: <ColumnDemo /> },
    bar: { title: '条形图 Bar', desc: '横向：类目在 y、数值在 x；每条自左伸出、错峰生长', node: <BarDemo /> },
    pie: { title: '饼图 Pie', desc: '扇区总扫角 0→360 推进；donut 中心合计、padAngle 间隙', node: <PieDemo /> },
    radar: { title: '雷达图 Radar', desc: '数据点自圆心绽开；网格环 + 辐条，多 series 叠加多边形', node: <RadarDemo /> },
    gauge: { title: '仪表盘 Gauge', desc: '值弧扫描入场；按阈值自动 warning/error 着色，中心显数值', node: <GaugeDemo /> },
    scatter: { title: '散点图 Scatter', desc: 'x/y 均为连续数值，seriesField 分组着色；点错峰淡入放大', node: <ScatterDemo /> },
    rose: { title: '玫瑰图 Rose', desc: '等分角度、半径∝值（area 取√）；扇形自圆心绽放', node: <RoseDemo /> },
    funnel: { title: '漏斗图 Funnel', desc: '倒梯形首尾相接构成漏斗轮廓（顶宽∝本阶段、底宽∝下一阶段）+ 转化率', node: <FunnelDemo /> },
    waterfall: { title: '瀑布图 Waterfall', desc: '浮动柱表增减；增绿减红合计主色，柱间虚线连接', node: <WaterfallDemo /> },
    heatmap: { title: '热力图 Heatmap', desc: 'x/y 类目成网格，单元以基准色 alpha 强度映射值；对角错峰淡入', node: <HeatmapDemo /> },
    combo: { title: '折柱组合 Combo', desc: '柱 + 折线共享左 y 轴；柱长高、线沿弧长描出', node: <ComboDemo /> },
    treemap: { title: '矩形树图 Treemap', desc: 'squarify 布局面积∝值；逐块悬浮高亮 + tooltip；colorField 分组着色 + 图例切换', node: <TreemapDemo /> },
    sunburst: { title: '环形树图 Sunburst', desc: '层级树角度分区（子弧填满父弧）；按顶层分支着色逐环提亮 + 图例切换重排 + 入场揭示', node: <SunburstDemo /> },
    sankey: { title: '桑基图 Sankey', desc: '分层 DAG 流量图：节点高∵流量、贝塞尔缎带∵链接值；列按最长路径、节点色按序号、流带取源色半透明', node: <SankeyDemo /> },
    boxplot: { title: '箱线图 BoxPlot', desc: 'Tukey 五数概括：箱体 Q1~Q3 + 中位粗线 + 上下须（1.5·IQR）+ 离群点；自带非零基线 y 轴，入场由中位线展开，悬停逐类目 tooltip', node: <BoxPlotDemo /> },
    histogram: { title: '直方图 Histogram', desc: '连续样本等宽分箱计数（Freedman–Diaconis 自动 / binCount / binWidth）；相邻柱表分布形态，悬停逐箱显 [下界,上界) 与频数', node: <HistogramDemo /> },
    violin: { title: '小提琴图 Violin', desc: '高斯核密度估计（KDE）→对称轮廓，内嵌迷你箱（IQR+中位+须）；组间共享横向量程比较分布形态，悬停逐组 tooltip', node: <ViolinDemo /> },
    'range-bar': { title: '区间条 RangeBar', desc: '每行 [起,止] 数值区间→横向浮动条（甘特/温度带/分数带）；支持 colorField 分色、区间标签、负值域，悬停逐行显起/止/跨度', node: <RangeBarDemo /> },
    'radial-bar': { title: '径向条 RadialBar', desc: '多同心环每项一指标，弧长∵占比（满圈 360°）；图例悬停驱动高亮 + 中心统计，适合多项 KPI 完成度', node: <RadialBarDemo /> },
    bullet: { title: '子弹图 Bullet', desc: '紧凑 KPI 呈现：每行定性区间带铺底 + 性能条（实际值）+ 竖线目标标记；ranges/rangeColors 定义合格区间，悬停逐行显 实际/目标/所处区间', node: <BulletDemo /> },
    'calendar-heatmap': { title: '日历热力图 Calendar', desc: 'GitHub 贡献图风格：周列×星期行栅格，颜色深浅映射当日数值；月份/星期标签 + 色阶图例，支持 startOfWeek/levels，悬停逐格 tooltip', node: <CalendarHeatmapDemo /> },
    sparkline: { title: '迷你图 Sparkline', desc: '无坐标轴内联走势，line / area；适合卡片、表格嵌入', node: <SparklineDemo /> },
    export: { title: '导出图表 PNG Export', desc: 'ChartExportButton：把任意图表容器当前帧从画布按 dpr 裁成 PNG，经原生另存为对话框写盘；高分屏按物理像素导出不降采样', node: <ExportDemo /> },
    candlestick: { title: 'K线图 Candlestick', desc: '蜡烛图：实体=开收、影线=高低，红涨绿跌；可选成交量副图、空心阳线；overlays 可叠加均线（K线+折线重叠）', node: <CandleDemo /> },
    'candlestick-live': { title: '实时K线 Candlestick·Live', desc: '每秒向尾部追加一条新行情（滚动窗口），animation=false 不逐帧重播；实时重算 MA 叠加', node: <StreamCandleDemo /> },
    'stock-panel': { title: '多面板行情 K线+指标', desc: '主图(K线+均线) 与 MACD/RSI/KDJ/VOL 副图共享 band 像素对齐堆叠；showXAxis 控制时间轴仅最底保留', node: <StockPanelDemo /> },
    depth: { title: '订单簿深度 MarketDepth', desc: '买卖盘累计阶梯（山形），中价虚线；x=价格 y=挂单量；可切逐档梳状', node: <DepthDemo /> },
    'time-sharing': { title: '分时图 TimeSharing', desc: '盘中现价线 + 均价线 + 面积，昨收虚线基准；左价格右涨跌幅', node: <TimeSharingDemo /> },
    'dendrogram-h': { title: '水平生态树 Dendrogram·H', desc: '所有叶在同一 depth（右侧一列对齐）；短枝被拉伸至最大层深；父子横向 cubic bezier', node: <DendrogramHDemo /> },
    'dendrogram-v': { title: '垂直生态树 Dendrogram·V', desc: '根在顶、叶在底；叶标签沿纵向旋转 -90° 竖排在节点下方', node: <DendrogramVDemo /> },
    'dendrogram-r': { title: '径向生态树 Dendrogram·R', desc: 'depth → 半径、cross → 角度；叶在同一外圆周；标签沿切向排布', node: <DendrogramRDemo /> },
    'compact-box-h': { title: '水平紧凑树 DendrogrCompact·H', desc: '叶可在不同 depth（子树少则占槽少），整体更紧凑', node: <DendrogrCompactHDemo /> },
    'compact-box-v': { title: '垂直紧凑树 DendrogrCompact·V', desc: '紧凑布局 + 纵向投影；叶按自然树深落位', node: <DendrogrCompactVDemo /> },
    'compact-box-r': { title: '径向紧凑树 DendrogrCompact·R', desc: '紧凑 + 极坐标；叶分布在不同半径圆周上', node: <DendrogrCompactRDemo /> },
    'indented-tree': { title: '缩进树 IndentedTree', desc: '根在顶、子节点逐层缩进、L 形连线；蓝底圆角节点', node: <IndentedTreeDemo /> },
    'indented-tree-left': { title: '子节点左侧分布 IndentedTree·Left', desc: "side='left' 镜像：根在右、子向左展开", node: <IndentedTreeLeftDemo /> },
    'indented-tree-line': { title: '线条风格 IndentedTree·Line', desc: "nodeStyle='line' + colorByBranch：纯文字 + 彩色分支连线", node: <IndentedTreeLineDemo /> },
    'indented-tree-box': { title: '方框风格 IndentedTree·Box', desc: "nodeStyle='box' + colorByBranch：描边框按分支着色", node: <IndentedTreeBoxDemo /> },
    'indented-tree-collapse': { title: '动态展开收起 IndentedTree·Collapse', desc: 'collapsible：点击节点折叠/展开子树', node: <IndentedTreeCollapseDemo /> },
    'flow-basic': { title: '流程图 FlowChart', desc: '基础 DAG：分层布局 + 正交圆角折线 + 箭头', node: <FlowChartDemo /> },
    'flow-schedule': { title: '任务调度流程图 Flow·Schedule', desc: '带状态两段卡节点：彩色头 + 白底体（delay）', node: <FlowScheduleDemo /> },
    'flow-highlight': { title: '高亮所在链路 Flow·Highlight', desc: '点击节点 → 上游+下游整条群流程着色', node: <FlowHighlightDemo /> },
    'mind-basic': { title: '思维导图 MindMap', desc: '根居中、一级分支左右分布；主色圆角块 + S 形贝塞尔连线', node: <MindMapDemo /> },
    'mind-right': { title: '子节点右侧分布 MindMap·Right', desc: "side='right'：全部子在根右侧展开，根贴左缘", node: <MindMapRightDemo /> },
    'mind-left': { title: '子节点左侧分布 MindMap·Left', desc: "side='left'：全部子在根左侧展开，整体镜像", node: <MindMapLeftDemo /> },
    'mind-line': { title: '线条风格思维导图 MindMap·Line', desc: "nodeStyle='line'：纯文字按分支着色，叶带下划线，根灰盒", node: <MindMapLineDemo /> },
    'mind-box': { title: '方框风格思维导图 MindMap·Box', desc: "nodeStyle='box'：一级实色填充、更深层白底描边盒", node: <MindMapBoxDemo /> },
    'mind-collapse': { title: '动态展开收起 MindMap·Collapse', desc: 'collapsible：点击带子节点项折叠/展开子树，布局实时重排', node: <MindMapCollapseDemo /> },
    'org-basic': { title: '组织架构图 OrgChart', desc: '主色圆角块 + 灰蓝正交折线，根在顶逐层展开', node: <OrgBasicDemo /> },
    'org-card': { title: '复杂节点组织架构图 OrgChart·Card', desc: '人员卡：彩色顶条 + 头像 + 姓名职务，锚点圆与箭头连线', node: <OrgCardDemo /> },
    'org-horizontal': { title: '至左向右的组织架构图 OrgChart·H', desc: "direction='horizontal'：根在左逐层向右展开", node: <OrgHorizontalDemo /> },
    carousel: { title: '走马灯 Carousel', desc: '自动播放 / 圆点与四向位置 / 箭头 / 不循环 / 受控，切换淡入不依赖 transform', node: <CarouselDemo /> },
    'back-top': { title: '锚点与回顶 Anchor / BackTop', desc: '滚动管线：ScrollView.onScroll 上报 → 受控 scrollY 定位，BackTop 阈值浮现淡入', node: <BackTopAnchorDemo /> },
    watermark: { title: '水印 Watermark', desc: '平铺旋转文本覆盖层（Text.rotate 只转绘制）/ embed·cover 两形态 / 多行 content / fontColor / rotate-gap / fontWeight', node: <WatermarkDemo /> },
    'qr-code': { title: '二维码 QRCode', desc: 'value 确定性映射类 QR 矩阵 / 尺寸配色 / 中心 logo / active·expired·loading·scanned / statusRender', node: <QRCodeDemo /> },
    transfer: { title: '穿梭框 Transfer', desc: '双栏勾选搬运 / 全选 / 禁用项 / 自定义操作文案 / 单向样式 / 受控 targetKeys', node: <TransferDemo /> },
    'color-picker': { title: '拾色 ColorPicker', desc: '预设色板 / 尺寸 / 自定义文本 / 预设行 / 允许清除 / 弹出方向 / 受控', node: <ColorPickerDemo /> },
    select: { title: '下拉选择 Select', desc: '单选 / 多选标签 / 尺寸 / 校验状态 / 标签折叠 / 禁用 / 弹出方向 / 受控', node: <SelectDemo /> },
    'date-picker': { title: '日期选择 DatePicker', desc: '触发器 + 内联 Calendar 面板 / 尺寸 / 校验状态 / 禁用日期 / 弹出方向 / 受控', node: <DatePickerDemo /> },
    'time-picker': { title: '时间选择 TimePicker', desc: '时 / 分（可加秒）列点选 / 尺寸 / 校验状态 / 12 小时制 / 步长 / 弹出方向 / 受控', node: <TimePickerDemo /> },
    modal: { title: '对话框 Modal', desc: '居中对话框 + 遮罩（无 portal）/ footer 自定义 / okType-okDanger / confirmLoading / mask-closable / width', node: <ModalDemo /> },
    popover: { title: '气泡卡片 Popover', desc: '点击/悬停触发 / 四向 placement / 自定义底色 color / 受控，onLayout 实测定位', node: <PopoverDemo /> },
    popconfirm: { title: '气泡确认 Popconfirm', desc: '图标+标题+描述 / 确定-取消 / danger 危险态 / hideCancel / 四向 placement / 自定义图标 / 受控', node: <PopconfirmDemo /> },
    slider: { title: '滑动条 Slider', desc: '点击轨道就近吸附 / step 步长 / marks 刻度 / tooltipVisible 数值气泡 / 受控 / 禁用（本栈无拖拽管线）', node: <SliderDemo /> },
    'auto-complete': { title: '自动完成 AutoComplete', desc: '输入过滤建议 / 自定义 label / filterOption 全量 / allowClear / 尺寸 / 受控 / 禁用', node: <AutoCompleteDemo /> },
    mentions: { title: '提及 Mentions', desc: '@触发弹人员列表 / 前缀自定义 / 长列表内滚 / 禁用项 / 受控（尾部 token 检测）', node: <MentionsDemo /> },
    affix: { title: '钉顶 Affix', desc: '内滚容器滚过顶边钉住工具条 / offset 下移 / onAffix 回调（BackTop 同受控 scrollY 管线）', node: <AffixDemo /> },
    form: { title: '表单 Form', desc: '容器 + Item 校验：vertical/horizontal/inline 三布局 / rules required+pattern+min+max / 异步 validator / onFinish+onFinishFailed', node: <FormDemo /> },
    'input-otp': { title: '验证码 InputOTP', desc: 'N 格拆分显示 / 键盘逐字录入 / masked 掩码 / onComplete 全填满回调 / status 校验态 / disabled', node: <InputOTPDemo /> },
    'tag-input': { title: '标签输入 TagInput', desc: '输入回车/逗号成 Tag / 受控+非受控 / max 限数 / 去重 / 退格删末位 / 自定义分隔符 / disabled', node: <TagInputDemo /> },
    search: { title: '搜索框 Search', desc: 'Input 组合封装：放大镜前缀可点触发 / onSearch 回车回调 / loading 旋转态 / enterButton 图标或文字按钮圆角贴合 / 受控透传', node: <SearchDemo /> },
    upload: { title: '上传 Upload', desc: '拖拽区 + 文件列表回显 / maxCount / accept 类型过滤 / disabled / 移除操作', node: <UploadDemo /> },
    tooltip: { title: '文字提示 Tooltip', desc: 'hover/click 触发 / 四向 placement / 小箭头 arrow / 自定义底色 color / 前景自动取反', node: <TooltipDemo /> },
    'input-number': { title: '数字输入 InputNumber', desc: '步进按钮调值（无键盘）/ 尺寸 / 步进单位 / 前后缀 / 校验状态 / 隐藏步进 / 禁用', node: <InputNumberDemo /> },
    input: { title: '文本输入框 Input', desc: '键盘→编辑→IME 全链路：点击落位光标 / 方向键选区 / 退格 / 回车 / maxLength / allowClear / 中文输入法拼音合成', node: <InputDemo /> },
    'text-area': { title: '文本域 TextArea', desc: '多行编辑：Enter 换行 / 软换行折行 / 二维光标上下跨行 / 拖选跨行选区 / 剪贴板 / autoSize / showCount / maxLength', node: <TextAreaDemo /> },
    drawer: { title: '抽屉 Drawer', desc: '边缘滑出面板 + 遮罩（无 portal）/ placement 四向 / footer-extra / mask-closable / width-height', node: <DrawerDemo /> },
    'tree-select': { title: '树选择 TreeSelect', desc: '触发器 + 下拉树面板 / 单选与多选 / 尺寸 / 校验状态 / 禁用 / 弹出方向 / 受控', node: <TreeSelectDemo /> },
    'count-down': { title: '倒计时 CountDown', desc: 'ticker 驱动 / D·HH·mm·ss·SSS 格式 / 前后缀 / 自定义色 / paused / render 方块 / onFinish', node: <CountDownDemo /> },
    cascader: { title: '级联选择 Cascader', desc: '多列面板逐级展开 / 尺寸 / 悬停展开 / 选中即提交 / 自定义回显 / 禁用校验 / 弹出方向', node: <CascaderDemo /> },
    dropdown: { title: '下拉菜单 Dropdown', desc: '触发器点击/悬停展开菜单 / 图标项 / 危险 / 分隔线 / 禁用 / 选中，绝对定位覆盖', node: <DropdownDemo /> },
    message: { title: '全局提示 Message', desc: '顶部居中浮现带图标提示 / 5 类型（loading 真旋转）/ 自定义 icon / duration 自动关闭 / FadeIn', node: <MessageDemo /> },
    notification: { title: '通知卡片 Notification', desc: '角落停靠卡片（四角 placement）/ 标题+描述+关闭 / btn 操作区 / closeIcon / duration 自动关闭 / FadeIn', node: <NotificationDemo /> },
    'use-app': { title: '全局调用 App.useApp', desc: 'antd v5 风格：入口 <App> 包裹主窗后，任意后代 App.useApp() 取 message / modal / notification 命令式句柄（无需各自 contextHolder）', node: <UseAppDemo /> },
    address: { title: '地址 Address', desc: 'Web3 地址展示：确定性身份头像 / 截断 / ENS 名 / 链标签 / 复制反馈 / 二维码浮层 / 外链图标（参照 @ant-design/web3，仅展示）', node: <AddressDemo /> },
    'token-price': { title: '代币价格 TokenPrice', desc: '代币徽标 + 数量符号 + 法币估值 + 涨跌药丸（涨绿跌红，invert 转 A 股涨红）；precision/size 可调', node: <TokenPriceDemo /> },
    'price-range': { title: '价格区间 PriceRange', desc: 'min–max 代币区间 + 迷你区间轨（底槽+主色段+两端游标）；label / showBar / precision', node: <PriceRangeDemo /> },
    'nft-card': { title: 'NFT 卡片 NFTCard', desc: '复用 Card/Tag/Address/TokenPrice 编排：封面 + 名称标准 + 系列编号 + 合约地址 + 价格（仅展示）', node: <NFTCardDemo /> },
    'web3-avatar': { title: '身份头像 Web3Avatar', desc: '由地址哈希确定性生成的 Blockies 像素身份图（8×8 轴对齐方块拼贴，天然无锯齿）；shape/size/grid', node: <Web3AvatarDemo /> },
    'coin-icon': { title: '币种图标 CoinIcon', desc: '内置常见币种矢量图形（取自 @ant-design/web3 icons，多色图层堆叠）；ticker 别名/尺寸/圆形方形底牌/未内置字母牌兜底', node: <CoinIconDemo /> },
    'file-picker': { title: '文件选择器 FilePicker', desc: 'I/O 输入：点击唤起原生系统对话框 + 从资源管理器拖拽文件入窗（底座 DroppedFile）；多选/扩展名过滤/拖拽区与按钮两形态/文件大小回显与逐项移除', node: <IoFilePickerDemo /> },
    'file-saver': { title: '文件保存器 FileSaver', desc: 'I/O 输出：点击唤起原生「另存为」对话框（PowerShell SaveFileDialog，同款 UTF-8 回传绕 GBK 坑）选目标路径 → fs 写盘；内容支持 string/Buffer/Uint8Array/dataURL 或懒函数（点击时才生成）；保存中/成功回显路径/失败回显错误三态', node: <IoFileSaverDemo /> },
    'sys-ffi': { title: '原生库调用 FFI', desc: '独立可选分支包 react-native-flux-desktop-ffi（napi-rs + libloading + libffi）：以声明式签名 ffi.sym(句柄,符号名,参数类型[],返回类型) 直接把系统 DLL/dylib/so 的 C 导出当成可调用闭包，无需写 C/Rust。演示标量调用（GetTickCount/GetCurrentProcessId）、内存原语往返（alloc/writeBytes/readBytes/free）、输出缓冲区回读（GetModuleFileNameW 取本进程 EXE 路径）、异步调用（{async:true} 丢 libuv 线程返回 Promise）、native 回调（EnumWindows 把 JS 闭包当函数指针）。仅 C ABI，签名写错即段错误直崩，故按钮均为 Windows 真实调用、非 win32 平台自动跳过', node: <FfiDemo /> },
    webview: { title: '网页视图 WebView', desc: '独立分支包 react-native-flux-desktop-webview（Chromium/WebView2）：非主包内置，需以 file: 本地依赖单独引入。点按钮开一扇顶层网页窗、setInterval 持续 pump 驱动渲染（本步只做独立开窗，区域嵌入与事件循环共享待后续）', node: <WebViewDemo /> },
  };
}
