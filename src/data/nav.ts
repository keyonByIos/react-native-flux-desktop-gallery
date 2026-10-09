// 导航结构数据：六段（系统 / 组件 / Web3 / 开发 / 图表 / 案例）各一套菜单树。
// 由 App.tsx 的 Shell 消费；叶子 key 与 entries 表一一对应。
import type { MenuItem } from 'react-native-flux-desktop';

export type Section = 'sys' | 'ui' | 'chart' | 'web3' | 'dev' | 'case';

/** 各段落首个叶子的 key（切段时 active 落到这里） */
export function firstOf(s: Section): string {
  return s === 'sys' ? 'sys-welcome' : s === 'ui' ? 'theme' : s === 'chart' ? 'line' : s === 'web3' ? 'coin-icon' : s === 'case' ? 'dashboard' : 'code-block';
}

// 「系统」：自绘栈自身的机制说明（渲染生命周期 / 多窗口 / 轻量级键值持久化）。
export const NAV_SYSTEM: MenuItem[] = [
  { key: 'sys-welcome', icon: 'home', label: '欢迎 Welcome' },
  { key: 'sys-lifecycle', icon: 'sync', label: '生命周期 Lifecycle' },
  { key: 'sys-render', icon: 'activity', label: '渲染 Rendering' },
  { key: 'sys-font', icon: 'type', label: '字体 Font' },
  { key: 'sys-event', icon: 'zap', label: '事件 Event' },
  { key: 'sys-window', icon: 'monitor', label: '窗口 Window' },
  { key: 'sys-multiwin', icon: 'appstore', label: '多窗口 Multi-Window' },
  { key: 'sys-kv', icon: 'database2', label: '键值持久化 KV Store' },
  { key: 'sys-log', icon: 'fileText', label: '日志 Logger' },
  { key: 'sys-tray', icon: 'bell', label: '系统托盘 Tray' },
  { key: 'sys-ffi', icon: 'cpu', label: '原生库调用 FFI' },
  {
    key: 'sys-methods',
    icon: 'cpu',
    label: '系统方法',
    children: [
      { key: 'sys-stats', label: '系统取数 SystemStats' },
    ],
  },
];

// 「组件」按 Ant Design 官方文档分类组织。
export const NAV_UI: MenuItem[] = [
  { key: 'theme', icon: 'bulb', label: '主题 Theme' },
  { key: 'nav-divider', type: 'divider' },
  {
    key: 'general',
    icon: 'appstore',
    label: '通用',
    children: [
      { key: 'button', label: '按钮 Button' },
      { key: 'float-button', label: '悬浮按钮 FloatButton' },
      { key: 'icon', label: '图标 Icon' },
      { key: 'typography', label: '排版 Typography' },
      { key: 'emoji', label: 'Emoji 渲染' },
    ],
  },
  {
    key: 'layout',
    icon: 'layout2',
    label: '布局',
    children: [
      { key: 'divider', label: '分割线 Divider' },
      { key: 'flex-grid', label: '栅格 Flex / Grid' },
      { key: 'page-layout', label: '布局 Layout' },
      { key: 'masonry', label: '瀑布流 Masonry' },
      { key: 'infinite-scroll', label: '无限滚动 InfiniteScroll' },
      { key: 'space', label: '间距 Space' },
      { key: 'splitter', label: '分割面板 Splitter' },
      { key: 'gradient', label: '渐变背景 Gradient' },
    ],
  },
  {
    key: 'navigation',
    icon: 'compass',
    label: '导航',
    children: [
      { key: 'back-top', label: '锚点 Anchor' },
      { key: 'breadcrumb', label: '面包屑 Breadcrumb' },
      { key: 'dropdown', label: '下拉菜单 Dropdown' },
      { key: 'menu', label: '菜单 Menu' },
      { key: 'pagination', label: '分页 Pagination' },
      { key: 'steps', label: '步骤 Steps' },
      { key: 'tabs', label: '标签页 Tabs' },
    ],
  },
  {
    key: 'data-entry',
    icon: 'edit',
    label: '数据录入',
    children: [
      { key: 'affix', label: '钉顶 Affix' },
      { key: 'auto-complete', label: '自动完成 AutoComplete' },
      { key: 'cascader', label: '级联选择 Cascader' },
      { key: 'checkbox', label: '多选框 Checkbox' },
      { key: 'color-picker', label: '颜色选择器 ColorPicker' },
      { key: 'date-picker', label: '日期选择 DatePicker' },
      { key: 'form', label: '表单 Form' },
      { key: 'input', label: '文本输入框 Input' },
      { key: 'text-area', label: '文本域 TextArea' },
      { key: 'input-number', label: '数字输入框 InputNumber' },
      { key: 'input-otp', label: '验证码输入 InputOTP' },
      { key: 'tag-input', label: '标签输入 TagInput' },
      { key: 'search', label: '搜索框 Search' },
      { key: 'mentions', label: '提及 Mentions' },
      { key: 'radio', label: '单选框 Radio' },
      { key: 'rate', label: '评分 Rate' },
      { key: 'select', label: '选择器 Select' },
      { key: 'slider', label: '滑动条 Slider' },
      { key: 'switch', label: '开关 Switch' },
      { key: 'time-picker', label: '时间选择 TimePicker' },
      { key: 'transfer', label: '穿梭框 Transfer' },
      { key: 'tree-select', label: '树选择 TreeSelect' },
      { key: 'upload', label: '上传 Upload' },
    ],
  },
  {
    key: 'data-display',
    icon: 'bars',
    label: '数据展示',
    children: [
      { key: 'avatar', label: '头像 Avatar' },
      { key: 'badge', label: '徽标 Badge' },
      { key: 'calendar', label: '日历 Calendar' },
      { key: 'card', label: '卡片 Card' },
      { key: 'carousel', label: '走马灯 Carousel' },
      { key: 'collapse', label: '折叠面板 Collapse' },
      { key: 'descriptions', label: '描述列表 Descriptions' },
      { key: 'empty', label: '空状态 Empty' },
      { key: 'image', label: '图片 Image' },
      { key: 'list', label: '列表 List' },
      { key: 'cell', label: '列表 Cell' },
      { key: 'virtual-list', label: '虚拟列表 VirtualList' },
      { key: 'popover', label: '气泡卡片 Popover' },
      { key: 'segmented', label: '分段控制 Segmented' },
      { key: 'statistic', label: '统计 Statistic' },
      { key: 'count-down', label: '倒计时 CountDown' },
      { key: 'qr-code', label: '二维码 QRCode' },
      { key: 'table', label: '表格 Table' },
      { key: 'tag', label: '标签 Tag' },
      { key: 'timeline', label: '时间轴 Timeline' },
      { key: 'todo', label: '待办 Todo' },
      { key: 'tooltip', label: '文字提示 Tooltip' },
      { key: 'tree', label: '树形控件 Tree' },
      { key: 'webview', label: '网页视图 WebView' },
    ],
  },
  {
    key: 'feedback',
    icon: 'alertCircle',
    label: '反馈',
    children: [
      { key: 'alert', label: '警告提示 Alert' },
      { key: 'drawer', label: '抽屉 Drawer' },
      { key: 'popconfirm', label: '气泡确认框 Popconfirm' },
      { key: 'progress', label: '进度条 Progress' },
      { key: 'modal', label: '对话框 Modal' },
      { key: 'message', label: '全局提示 Message' },
      { key: 'notification', label: '通知提醒 Notification' },
      { key: 'use-app', label: '全局调用 App.useApp' },
      { key: 'result', label: '结果 Result' },
      { key: 'skeleton', label: '骨架屏 Skeleton' },
      { key: 'spin', label: '加载中 Spin' },
      { key: 'watermark', label: '水印 Watermark' },
    ],
  },
  {
    key: 'motion',
    icon: 'play',
    label: '动效',
    children: [
      { key: 'transform', label: '变换 Transform' },
      { key: 'animation', label: '动效 Animation' },
    ],
  },
  {
    key: 'io',
    icon: 'inbox',
    label: 'I/O',
    children: [
      { key: 'file-picker', label: '文件选择器 FilePicker' },
      { key: 'file-saver', label: '文件保存器 FileSaver' },
    ],
  },
  {
    key: 'hooks',
    icon: 'code',
    label: 'Hooks',
    children: [
      { key: 'drag', label: '拖拽 useDrag / useDrop' },
    ],
  },
  {
    key: 'pro',
    icon: 'table',
    label: '高阶组件',
    children: [
      { key: 'pro-table', label: '高阶表格 ProTable' },
      { key: 'pro-form', label: '轻量表单 ProForm' },
      { key: 'pro-card', label: '区块卡片 ProCard' },
      { key: 'check-card', label: '可选卡片 CheckCard' },
      { key: 'stat-card', label: '指标卡 StatCard' },
      { key: 'trend-card', label: '行情趋势卡 TrendCard' },
      { key: 'price-card', label: '定价方案卡 PriceCard' },
      { key: 'highlight', label: '关键词高亮 Highlight' },
      { key: 'pro-descriptions', label: '详情描述 ProDescriptions' },
    ],
  },
];

// 「Web3」：区块链展示型组件。
export const NAV_WEB3: MenuItem[] = [
  { key: 'coin-icon', icon: 'wallet', label: '币种图标 CoinIcon' },
  { key: 'address', icon: 'location', label: '地址 Address' },
  { key: 'token-price', icon: 'dollarSign', label: '代币价格 TokenPrice' },
  { key: 'price-range', icon: 'sliders', label: '价格区间 PriceRange' },
  { key: 'nft-card', icon: 'picture', label: 'NFT 卡片 NFTCard' },
  { key: 'web3-avatar', icon: 'user', label: '身份头像 Web3Avatar' },
];

// 「案例」：用现有组件拼装的整页实战示例。
export const NAV_CASE: MenuItem[] = [
  { key: 'dashboard', icon: 'dashboard', label: '数据分析看板 Dashboard' },
  { key: 'crypto-live', icon: 'activity', label: '区块链币价实时看板 Crypto Live' },
  { key: 'mall', icon: 'shoppingCart', label: '商城首页 Mall Shop' },
  { key: 'wallet', icon: 'wallet', label: 'EVM 钱包 Wallet' },
  { key: 'weather', icon: 'cloud', label: '天气 Weather' },
  { key: 'almanac', icon: 'calendar', label: '万年历 Almanac' },
  { key: 'heavy-charts', icon: 'activity', label: '实时运营监控大屏 Ops Live' },
  { key: 'sys-monitor', icon: 'dashboard', label: '系统监控托盘小部件 Sys Monitor' },
  { key: 'file-manager', icon: 'folder', label: '文件管理器 + 快速预览 File Manager' },
  { key: 'chat', icon: 'messageCircle', label: '即时通讯 Chat' },
  { key: 'kanban', icon: 'columns', label: '看板 Kanban' },
  { key: 'music', icon: 'music', label: '音乐播放器 Music Player' },
  { key: 'mail', icon: 'mail', label: '邮件客户端 Mail' },
  { key: 'checkout', icon: 'shoppingCart', label: '购物车结算 Checkout' },
  { key: 'settings', icon: 'setting', label: '系统设置 Settings' },
];

// 「开发」：面向开发者工具的组件。
export const NAV_DEV: MenuItem[] = [
  { key: 'code-block', icon: 'code', label: '代码块 CodeBlock' },
  { key: 'json-viewer', icon: 'database2', label: 'JSON 树 JsonViewer' },
  { key: 'diff-viewer', icon: 'columns', label: '差异对比 DiffViewer' },
  { key: 'regex-tester', icon: 'search', label: '正则测试 RegexTester' },
  { key: 'command-palette', icon: 'command', label: '命令面板 CommandPalette' },
  { key: 'log-viewer', icon: 'fileText', label: '日志查看器 LogViewer' },
  { key: 'cron-parser', icon: 'clock', label: 'Cron 解析器 CronParser' },
  { key: 'time-converter', icon: 'timer', label: '时间戳转换 TimeConverter' },
  { key: 'mem-monitor', icon: 'cpu', label: '内存监控 MemMonitor' },
  { key: 'markdown', icon: 'type', label: 'Markdown 渲染' },
];

// 「图表」：参考 @ant-design/charts 数据模型、Skia 自绘、内置入场动画。
export const NAV_CHART: MenuItem[] = [
  {
    key: 'chart-basic',
    icon: 'pieChart',
    label: '基础图表',
    children: [
      { key: 'line', label: '折线图 Line' },
      { key: 'area', label: '面积图 Area' },
      { key: 'column', label: '柱状图 Column' },
      { key: 'bar', label: '条形图 Bar' },
      { key: 'pie', label: '饼图 Pie' },
    ],
  },
  {
    key: 'chart-advanced',
    icon: 'lineChart',
    label: '高阶图表',
    children: [
      { key: 'radar', label: '雷达图 Radar' },
      { key: 'gauge', label: '仪表盘 Gauge' },
      { key: 'scatter', label: '散点图 Scatter' },
      { key: 'rose', label: '玫瑰图 Rose' },
      { key: 'funnel', label: '漏斗图 Funnel' },
      { key: 'waterfall', label: '瀑布图 Waterfall' },
      { key: 'heatmap', label: '热力图 Heatmap' },
      { key: 'treemap', label: '矩形树图 Treemap' },
      { key: 'sunburst', label: '环形树图 Sunburst' },
      { key: 'sankey', label: '桑基图 Sankey' },
      { key: 'boxplot', label: '箱线图 BoxPlot' },
      { key: 'histogram', label: '直方图 Histogram' },
      { key: 'violin', label: '小提琴图 Violin' },
      { key: 'range-bar', label: '区间条 RangeBar' },
      { key: 'radial-bar', label: '径向条 RadialBar' },
      { key: 'bullet', label: '子弹图 Bullet' },
      { key: 'calendar-heatmap', label: '日历热力图 Calendar' },
      { key: 'combo', label: '折柱组合 Combo' },
      { key: 'sparkline', label: '迷你图 Sparkline' },
      { key: 'export', label: '导出 PNG Export' },
    ],
  },
  {
    key: 'chart-finance',
    icon: 'database2',
    label: '金融图表',
    children: [
      { key: 'candlestick', label: 'K线图 Candlestick' },
      { key: 'candlestick-live', label: '实时K线 Candlestick·Live' },
      { key: 'stock-panel', label: '多面板行情 K线+指标' },
      { key: 'time-sharing', label: '分时图 TimeSharing' },
      { key: 'depth', label: '订单簿深度 MarketDepth' },
    ],
  },
  {
    key: 'chart-relation',
    icon: 'share',
    label: '关系图',
    children: [
      {
        key: 'chart-ecology',
        label: '生态图',
        children: [
          { key: 'dendrogram-h', label: '水平生态树' },
          { key: 'dendrogram-v', label: '垂直生态树' },
          { key: 'dendrogram-r', label: '径向生态树' },
          { key: 'compact-box-h', label: '水平紧凑树' },
          { key: 'compact-box-v', label: '垂直紧凑树' },
          { key: 'compact-box-r', label: '径向紧凑树' },
        ],
      },
      {
        key: 'chart-indentation',
        label: '缩进图',
        children: [
          { key: 'indented-tree', label: '缩进树' },
          { key: 'indented-tree-left', label: '子节点左侧分布' },
          { key: 'indented-tree-line', label: '线条风格' },
          { key: 'indented-tree-box', label: '方框风格' },
          { key: 'indented-tree-collapse', label: '动态展开收起' },
        ],
      },
      {
        key: 'chart-mindmap',
        label: '思维导图',
        children: [
          { key: 'mind-basic', label: '思维导图' },
          { key: 'mind-right', label: '子节点右侧分布' },
          { key: 'mind-left', label: '子节点左侧分布' },
          { key: 'mind-line', label: '线条风格' },
          { key: 'mind-box', label: '方框风格' },
          { key: 'mind-collapse', label: '动态展开收起' },
        ],
      },
      {
        key: 'chart-flow',
        label: '流程图',
        children: [
          { key: 'flow-basic', label: '流程图' },
          { key: 'flow-schedule', label: '任务调度流程图' },
          { key: 'flow-highlight', label: '高亮所在链路' },
        ],
      },
      {
        key: 'chart-org',
        label: '组织架构图',
        children: [
          { key: 'org-basic', label: '组织架构图' },
          { key: 'org-card', label: '复杂节点组织架构图' },
          { key: 'org-horizontal', label: '至左向右的组织架构图' },
        ],
      },
    ],
  },
];
