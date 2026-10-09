// TrayMenu.tsx —— 托盘「自定义主题菜单」：右键托盘图标时弹出的无边框置顶小窗。
//
// 为什么不用原生右键菜单：muda/tray-icon 的 PopupMenu 是系统级浮层，只跟随操作系统明暗，
// 无法适配应用内 dark/light 主题。故这里用自有 token 组件自绘一扇窗：
//   · decorations:false + alwaysOnTop + center:false + 显式 x/y（由托盘图标物理矩形 ÷ scale 换算）
//   · onFocused(false) → 失焦即关（对齐原生菜单行为）
//   · 菜单项只「报告点了哪一项」，应用级行为（唤窗/切主题/退出）经 trayBus 交回 Shell 单点处理。
//
// 尺寸策略（软栅格无 alpha 穿透，未绘制区露黑 → 窗口必须与内容严丝合缝）：
//   全部几何尺寸用本文件固定常量（不取 token，compact/算法切换不会改变布局），
//   窗口高度 = 行数×行高 + 分隔线条数×(线粗+2×线距) + 上下内边距，
//   内容铺满整窗不留圆角，黑色三角/黑边从根上消失；token 只用于颜色（适应明暗主题）。
//   若未来加「紧凑密度」菜单变体，需按密度分套常量分别算高。
import React from 'react';
import { EventEmitter } from 'events';
import {
  View,
  Text,
  Pressable,
  Icon,
  FluxProvider,
  useToken,
  Application,
  type ThemeAlgorithm,
  type TrayRect,
} from 'react-native-flux-desktop';
import { useAppTheme } from './ThemeSettings';

/** 托盘菜单 → Shell 的意图总线：'show' | 'stats' | 'theme' | 'quit'（事件在 Shell 的 tray effect 内订阅） */
export const trayBus = new EventEmitter();

const TAG = 'tray-menu';

// 最近一次右键弹出的托盘图标矩形（物理）：供「系统监控」项把小部件窗对齐到图标处。
let lastRect: TrayRect | undefined;

// —— 几何常量：与 TrayMenuBody 渲染严格一一对应，改这里即改窗口尺寸 ——
const MENU_W = 220; // 窗口宽（逻辑像素）
const ITEM_H = 34; // 每行 MenuItem 高
const PAD_V = 4; // 容器上下内边距
const PAD_H = 8; // 容器左右内边距
const DIV_H = 1; // 分隔线粗
const DIV_M = 5; // 分隔线上/下 margin（固定值，不取 token，保证与 menuHeight 对账）
const ITEM_PAD_H = 12; // 行内文字左内边距
const ITEM_R = 6; // 行悬停底色圆角
const MENU_R = 8; // 菜单面板外圆角（常量；圆角外露窗口背景色，非黑）
const FONT = 14; // 行文字字号
const ICON_SIZE = FONT; // 图标边长 = 字号（与文字同高视觉最稳），不取 token
const ICON_GAP = 8; // 图标→文字间距，不取 token
const ROWS: Array<{ key: 'show' | 'stats' | 'theme' | 'quit'; dividerBefore?: boolean }> = [
  { key: 'show' },
  { key: 'stats' },
  { key: 'theme' },
  { key: 'quit', dividerBefore: true },
];

/** 精确窗口高度 = 行高×行数 + 分隔线占位×条数 + 上下内边距（全部固定常量，与内容布局逐项对账） */
function menuHeight(): number {
  const dividers = ROWS.filter((r) => r.dividerBefore).length;
  return ROWS.length * ITEM_H + dividers * (DIV_H + 2 * DIV_M) + PAD_V * 2;
}

/** 关菜单并解除「点外面」监听（选中项 / 失焦 / dismiss 均走这里；disarmDismiss 幂等）。 */
function closeMenu(): void {
  Application.tray.disarmDismiss();
  Application.closeTag(TAG);
}

/** 右击托盘图标：在图标上方弹出自定义主题菜单（已存在则先关再开，坐标以最新点击为准）。 */
export function openTrayMenu(rect?: TrayRect): void {
  lastRect = rect; // 记住图标位置，供「系统监控」小部件对齐弹窗
  closeMenu(); // 已开则先关 + 解除旧监听
  const H = menuHeight();
  const scale = Application.getMainWindowScale();
  // 托盘 rect 是物理像素，Window x/y 是逻辑像素：除以主窗 scale（任务区与主窗同屏假设）
  const mon = Application.main()?.host?.getMonitorSize?.() ?? { x: 0, y: 0, w: 1920, h: 1080 };
  let x = rect ? (rect.x + rect.w) / scale - MENU_W : mon.x + mon.w - MENU_W - 8;
  let y = rect ? rect.y / scale - H - 2 : mon.y + mon.h - H - 48;
  // 夹回屏内：左右不越界；底部不盖任务栏（任务区在屏底，菜单底边不得越过 显示器底 - 44）
  x = Math.min(Math.max(x, mon.x), mon.x + mon.w - MENU_W);
  y = Math.min(y, mon.y + mon.h - H - 44);
  if (y < mon.y) y = mon.y + 4;
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  Application.open({
    content: React.createElement(TrayMenuWindow),
    title: 'menu',
    width: MENU_W,
    height: H,
    x: fx,
    y: fy,
    center: false,
    modal: false,
    alwaysOnTop: true,
    decorations: false,
    resizable: false,
    tag: TAG,
    onFocused: (focused: boolean) => {
      if (!focused) closeMenu(); // 失焦即关（切到本进程其它窗 / alt-tab）
    },
  });
  // 点外面即关（与 OS 焦点无关，专治置顶菜单点桌面/任务栏不关）：
  // 菜单物理屏幕矩形 = 逻辑坐标 × scale；原生轮询全局光标+按键，命中「矩形外按下」回调关窗。
  Application.tray.armDismiss(
    { x: fx * scale, y: fy * scale, w: MENU_W * scale, h: H * scale },
    () => Application.closeTag(TAG),
  );
}

/** 菜单窗根：自带 FluxProvider（订阅全局主题）→ 明暗/主色即时跟随 */
function TrayMenuWindow(): React.ReactElement {
  const theme = useAppTheme();
  const algorithm: ThemeAlgorithm[] = [
    theme.dark ? 'dark' : 'default',
    ...(theme.compact ? (['compact'] as ThemeAlgorithm[]) : []),
  ];
  return (
    <FluxProvider
      theme={{ algorithm, token: { colorPrimary: theme.primary, colorLink: theme.primary, colorInfo: theme.primary } }}
      animation={theme.animation}
    >
      <TrayMenuBody />
    </FluxProvider>
  );
}

/** 菜单体：铺满整窗（无圆角无外边距），行高 = ITEM_H 常量，与 menuHeight() 严格对账 */
function TrayMenuBody(): React.ReactElement {
  const { token } = useToken();
  const dark = Application.config.getTheme().dark;
  type TrayAction = 'show' | 'stats' | 'theme' | 'quit';
  const pick = (action: TrayAction): void => {
    closeMenu();
    if (action === 'stats') trayBus.emit('stats', lastRect);
    else trayBus.emit(action);
  };
  const labels: Record<TrayAction, string> = {
    show: '显示主窗口',
    stats: '系统监控',
    theme: dark ? '切换到亮色' : '切换到暗色',
    quit: '退出',
  };
  // 亮色主题下暗色行图标用 sun（切到亮），暗色下用 moon（切到暗）；均为 paths.ts 已注册名
  const icons: Record<TrayAction, string> = {
    show: 'monitor',
    stats: 'dashboard',
    theme: dark ? 'sun' : 'moon',
    quit: 'power',
  };
  return (
    <View style={{ width: MENU_W, height: menuHeight(), backgroundColor: token.colorBgContainer }}>
      <View
        style={{
          flex: 1,
          paddingVertical: PAD_V,
          paddingHorizontal: PAD_H,
          borderRadius: MENU_R,
          backgroundColor: token.colorBgElevated,
        }}
      >
        {ROWS.map((r) => (
          <React.Fragment key={r.key}>
            {r.dividerBefore ? (
              <View style={{ height: DIV_H, marginVertical: DIV_M, backgroundColor: token.colorBorderSecondary }} />
            ) : null}
            <MenuItem
              label={labels[r.key]}
              icon={icons[r.key]}
              danger={r.key === 'quit'}
              onPress={() => pick(r.key)}
            />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

interface MenuItemProps {
  label: string;
  /** paths.ts 图标名 */
  icon: string;
  danger?: boolean;
  onPress: () => void;
}

/** 单行：固定高 ITEM_H（窗口高度据此算出）；图标边长=ICON_SIZE(=FONT)、图标→文字间距=ICON_GAP，均用常量。 */
function MenuItem(props: MenuItemProps): React.ReactElement {
  const { label, icon, danger, onPress } = props;
  const { token } = useToken();
  const fg = danger ? token.colorError : token.colorText;
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: ITEM_H,
        paddingHorizontal: ITEM_PAD_H,
        borderRadius: ITEM_R,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <Icon name={icon} size={ICON_SIZE} color={fg} />
      <Text style={{ marginLeft: ICON_GAP, fontSize: FONT, color: fg }}>
        {label}
      </Text>
    </Pressable>
  );
}
