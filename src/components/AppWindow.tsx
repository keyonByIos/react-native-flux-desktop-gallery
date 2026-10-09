// 独立窗口通用封装：新根自带主题壳 + 内容滚动壳 + 按 tag 去重开窗。
// 背景：Application.open 开窗工厂只套 <Window>、不套主题，也不给内容铺背景/滚动。
//   所以每扇独立窗都得自带 FluxProvider（否则新根是默认亮色 → 白底），并按需补 ScrollView。
// 这套样板在案例段、主题设置窗、后续大量「点一下弹一扇带主题独立窗」的场景里反复出现，统一收敛到这里。
import React from 'react';
import {
  View,
  ScrollView,
  Application,
  FluxProvider,
  useToken,
  ThemeAlgorithm,
  type AppThemeConfig,
} from 'react-native-flux-desktop';

/** 订阅全局主题：任一窗口 Application.config.setTheme → 本组件重渲染（跨窗同步换肤的关键）。 */
export function useAppTheme(): AppThemeConfig {
  const [t, setT] = React.useState<AppThemeConfig>(Application.config.getTheme());
  React.useEffect(() => Application.config.subscribe((c) => setT(c.App.theme)), []);
  return t;
}

/** 独立窗内容自带 FluxProvider（订阅全局主题 → 随全局换肤）。开窗工厂不套主题，缺它新根会是白底。 */
export function Themed(props: { children: React.ReactNode }): React.ReactElement {
  const theme = useAppTheme();
  const algorithm: ThemeAlgorithm[] = [
    theme.dark ? 'dark' : 'default',
    ...(theme.compact ? (['compact'] as ThemeAlgorithm[]) : []),
  ];
  // fontSize/controlHeight 仅在显式设值时注入（缺 key 才回落到算法默认；传 undefined 会污染 seed）
  const token: Record<string, string | number> = {
    colorPrimary: theme.primary,
    colorLink: theme.primary,
    colorInfo: theme.primary,
  };
  if (theme.fontSize != null) token.fontSize = theme.fontSize;
  if (theme.controlHeight != null) token.controlHeight = theme.controlHeight;
  return (
    <FluxProvider
      theme={{ algorithm, token }}
      animation={theme.animation}
    >
      {props.children}
    </FluxProvider>
  );
}

/** 内容壳（必须在 Themed 之内）：此时 useToken 才读到当前主题 token。
 *  若把 useToken 放到 FluxProvider 外层，会拿到默认亮色 token（colorBgContainer=#fff）→ 白底。 */
function ThemedWindowInner(props: { node: React.ReactNode; scroll: boolean; padding?: number }): React.ReactElement {
  const { token } = useToken();
  const pad = props.padding ?? token.paddingLG;
  const inner = props.scroll ? (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: pad }}>{props.node}</View>
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: pad }}>{props.node}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: token.colorBgContainer }}>{inner}</View>
  );
}

/** 独立窗内容通用壳：Themed + colorBgContainer 背景 + 可选滚动 + 外边距。
 *  scroll 默认 true（DemoPage 等不内置滚动的内容直接可用）。 */
export function ThemedWindowBody(props: {
  node: React.ReactNode;
  scroll?: boolean;
  padding?: number;
}): React.ReactElement {
  const { node, scroll = true, padding } = props;
  return (
    <Themed>
      <ThemedWindowInner node={node} scroll={scroll} padding={padding} />
    </Themed>
  );
}

/** 与主窗口一致的默认窗口尺寸（见 App.tsx 的 <Window>）：宽 1280，高取 FLUX_WIN_H 或 640。 */
export const MAIN_WIN_W = 1280;
export const MAIN_WIN_H = 640;

export interface OpenThemedWindowOptions {
  /** 去重标签：已存在同 tag 窗则前置老窗、不重复开 */
  tag: string;
  /** 标题栏文案 */
  title: string;
  /** 窗内内容（会被 ThemedWindowBody 套上主题 + 背景 + 滚动壳） */
  node: React.ReactNode;
  width?: number;
  height?: number;
  /** 缺省 = width（与主窗一致的「最小即初始」约束） */
  minWidth?: number;
  /** 缺省 = height */
  minHeight?: number;
  /** 最大内尺寸：钉死窗口不随内容 auto-grow（案例窗填满靠内部滚动，而非把窗撑高）。缺省 maxHeight = height。 */
  maxWidth?: number;
  maxHeight?: number;
  modal?: boolean;
  /** 内容是否套 ScrollView，默认 true */
  scroll?: boolean;
  /** 内容四周外边距，默认 token.paddingLG */
  padding?: number;
}

/** 打开（或前置）一扇自带主题的独立窗口：内容套 ThemedWindowBody，默认尺寸与主窗一致、min=初始。
 *  按 tag 去重：命中已开窗口则尝试前置（部分平台不支持 focus 时静默忽略）。 */
export function openThemedWindow(opts: OpenThemedWindowOptions): void {
  const existing = Application.findByTag(opts.tag);
  if (existing) {
    try {
      existing.host?.focus?.();
    } catch {
      /* 部分平台不支持 focus，忽略 */
    }
    return;
  }
  const {
    tag,
    title,
    node,
    width = MAIN_WIN_W,
    height = MAIN_WIN_H,
    minWidth = width,
    minHeight = height,
    maxWidth,
    maxHeight = height,
    modal,
    scroll,
    padding,
  } = opts;
  Application.open({
    content: React.createElement(ThemedWindowBody, { node, scroll, padding }),
    title,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    modal,
    tag,
    parentId: Application.main()?.id,
  });
}
