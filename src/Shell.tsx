// Shell = Gallery 的「可重载内容」：左侧 Menu 导航 + 右侧内容区 + 顶部段切换 + 代码抽屉 + 托盘/退出确认。
// 与稳定外壳（App.tsx 的 Gallery：Window/FluxProvider/App 三层）分离，供 Tier B 热更新独立重载：
//   改本文件或其依赖（demos/entries/nav/components）→ 仅本组件子树 remount，外层 <Window> 类型稳定不重建 → 窗口不关、不闪。
// 注意：不要在此持有跨重载必须保留的全局副作用（单例/事件监听请在 useEffect 里正确 cleanup）。
import React from 'react';
import { View, Text, ScrollView, Menu, Modal, Drawer, Checkbox, message, useToken, FadeIn, Anchor, Application, type AnchorLink, type TrayRect } from 'react-native-flux-desktop';
import { CodeBlock } from 'react-native-flux-desktop-dev';
import { DemoNavContext, CodeDrawerContext, type DemoSection } from './DemoPage';
import {
  type Section,
  firstOf,
  NAV_SYSTEM,
  NAV_UI,
  NAV_WEB3,
  NAV_CASE,
  NAV_DEV,
  NAV_CHART,
} from './data/nav';
import { buildEntries, type ThemeCtl } from './data/entries';
import { openTrayMenu, trayBus } from './components/TrayMenu';
import { openSysMonitor } from './window/SysMonitor';
import { CaseBoard } from './components/CaseBoard';
import { TopBar } from './components/TopBar';

// airspace：代码抽屉等全屏 Skia 浮层打开时，把 WebView2 子面整体移到屏外隐藏（原生子面永远浮在 Skia 之上，盖不住）。
// 可选依赖：webview 包缺失时降级为不处理（普通页面无 webview，无影响）。
let _setAllVisible: ((v: boolean) => void) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  _setAllVisible = require('react-native-flux-desktop-webview/component').setAllVisible || null;
} catch {
  _setAllVisible = null;
}
const hideAirspace = (): void => {
  try {
    if (_setAllVisible) _setAllVisible(false);
  } catch {
    /* ignore */
  }
};
const showAirspace = (): void => {
  try {
    if (_setAllVisible) _setAllVisible(true);
  } catch {
    /* ignore */
  }
};

/** 章节列表是否等价（id/标题/Y 全一致）：避免 onLayout 回传时形成重渲染循环 */
function sameSections(a: DemoSection[], b: DemoSection[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].title !== b[i].title || Math.abs(a[i].y - b[i].y) > 0.5) return false;
  }
  return true;
}

/** 滚动联动：取最后一个已滚到顶部（y <= sy + 阈值）的章节为高亮项 */
function computeActiveHref(sections: DemoSection[], sy: number): string {
  let cur = sections.length ? sections[0].id : '';
  for (const s of sections) {
    if (s.y <= sy + 8) cur = s.id;
    else break;
  }
  return cur;
}

export type ShellProps = ThemeCtl & { appName: string };

export function Shell(props: ShellProps): React.ReactElement {
  const { token } = useToken();
  const { dark, compact, setDark, setCompact, animation, setAnimation, primary, setPrimary, appName } = props;
  const [messageApi, messageContextHolder] = message.useMessage();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  // 托盘退出确认（应用内 token 驱动 Modal → 适应主题）+「下次不再询问」（勾中则写 App.prefs.confirmOnQuit=false）
  const [quitOpen, setQuitOpen] = React.useState(false);
  const [dontAsk, setDontAsk] = React.useState(false);
  const [section, setSection] = React.useState<Section>((process.env.FLUX_SECTION as Section) || 'sys');
  const [active, setActive] = React.useState<string>(process.env.FLUX_ACTIVE || firstOf((process.env.FLUX_SECTION as Section) || 'sys'));
  const entries = React.useMemo(() => buildEntries(props), []);
  const nav = section === 'sys' ? NAV_SYSTEM : section === 'ui' ? NAV_UI : section === 'web3' ? NAV_WEB3 : section === 'case' ? NAV_CASE : section === 'dev' ? NAV_DEV : NAV_CHART;
  const switchSection = (s: Section): void => {
    if (s === section) return;
    setSection(s);
    setActive(firstOf(s));
  };
  const entry = entries[active] ?? entries.theme ?? entries.button;

  // 系统托盘：主窗挂载时建托盘（不挂原生菜单），事件直接读写全局 Application.config（事件时取最新值）。
  //   左键单击 = 双击行为（唤主窗）；右键在图标处弹「自定义主题菜单」（TrayMenu.tsx）；
  //   菜单项意图经 trayBus 回到此处单点处理（退出确认 Modal 的状态在本组件，跨根只能走总线）。
  React.useEffect(() => {
    if (!Application.tray.available) return;
    Application.tray.create({ tooltip: appName, iconPath: process.env.FLUX_ICON });
    const wake = (): void => Application.wakeMainWindow();
    const offLeft = Application.tray.onLeftClick(wake);
    const offDbl = Application.tray.onDoubleClick(wake);
    const offRight = Application.tray.onRightClick((ev) => openTrayMenu(ev.rect));
    const onShow = wake;
    const onStats = (rect?: TrayRect): void => openSysMonitor(rect); // 托盘菜单「系统监控」→ 弹出/收起小部件
    const onTheme = (): void => Application.config.setTheme({ dark: !Application.config.getTheme().dark });
    const onQuit = (): void => {
      // 勾过「不再询问」→ 直接退；否则唤起主窗弹应用内确认框（也适应主题）
      if (Application.config.getPrefs().confirmOnQuit) {
        Application.wakeMainWindow();
        setQuitOpen(true);
      } else {
        Application.log.write('gallery', '托盘直接退出（已勾不再询问）');
        process.exit(0);
      }
    };
    trayBus.on('show', onShow);
    trayBus.on('stats', onStats);
    trayBus.on('theme', onTheme);
    trayBus.on('quit', onQuit);
    return () => {
      offLeft();
      offDbl();
      offRight();
      trayBus.off('show', onShow);
      trayBus.off('stats', onStats);
      trayBus.off('theme', onTheme);
      trayBus.off('quit', onQuit);
      Application.tray.remove();
    };
  }, []);

  // 右侧锚点目录 + 滚动联动。
  // 滚动以【非受控】为主：滚轮直写场景节点 scrollY、不经 React（避免每滚一帧重渲染整棵 Shell，
  //   也避免受控 scrollY 每帧把滚轮回拉 → 橡皮筋卡顿 + 滚动条带 blit 失效）。jump 仅用于锚点点击/切 demo
  //   归顶的「一次性程序化定位」：给一个数字钉到位，落地后立即归还控制权（置回 undefined → 再走非受控）。
  const [jump, setJump] = React.useState<number | undefined>(
    process.env.FLUX_SCROLL_Y ? Number(process.env.FLUX_SCROLL_Y) : undefined,
  );
  const jumpRef = React.useRef<number | undefined>(jump);
  const setJumpCtl = (v: number | undefined): void => {
    jumpRef.current = v;
    setJump(v);
  };
  const syRef = React.useRef(jump ?? 0);
  const [sections, setSections] = React.useState<DemoSection[]>([]);
  const [activeHref, setActiveHref] = React.useState<string>('');
  // 代码抽屉：各 demo 点代码图标 → 在此统一展示（右侧向左弹出）；无 portal，锚在下方全窗 relative 根。
  const [codeData, setCodeData] = React.useState<{ title: string; code: string; language?: string } | null>(null);
  const codeApi = React.useMemo(
    () => ({
      openCode: (d: { title: string; code: string; language?: string }) => {
        setCodeData(d);
        hideAirspace(); // 抽屉要压住网页：先把 WebView2 子面隐到屏外
      },
    }),
    []
  );
  const closeCode = (): void => {
    setCodeData(null);
    showAirspace();
  };
  const activeRef = React.useRef(active);
  const genRef = React.useRef(0);
  if (activeRef.current !== active) {
    activeRef.current = active;
    genRef.current++;
    setSections([]);
    syRef.current = 0;
    setActiveHref('');
    setJumpCtl(0); // 切 demo 归顶：钉 0 一拍，随后 effect 释放回非受控
    setCodeData(null);
    showAirspace();
  }
  const register = React.useCallback((s: DemoSection[]) => {
    const ns = [...s].sort((a, b) => a.y - b.y);
    const gen = genRef.current;
    setTimeout(() => {
      if (genRef.current !== gen) return;
      setSections((prev) => (sameSections(prev, ns) ? prev : ns));
    }, 0);
  }, []);
  const navValue = React.useMemo(() => ({ register }), [register]);
  const anchorItems: AnchorLink[] = sections.map((s) => ({ href: s.id, title: s.title }));
  // 内容章节变化后（如首帧量得 sections）按当前滚动位补齐高亮
  React.useEffect(() => {
    setActiveHref(computeActiveHref(sections, syRef.current));
  }, [sections]);
  // jump 落地后立即归还控制权（延时 > 一两帧，确保受控钉位已生效），转回非受控自由滚动
  React.useEffect(() => {
    if (jump === undefined) return;
    const t = setTimeout(() => setJumpCtl(undefined), 120);
    return () => clearTimeout(t);
  }, [jump]);
  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number; y: number } } }): void => {
    const y = e.nativeEvent.contentOffset.y;
    syRef.current = y;
    if (jumpRef.current !== undefined) setJumpCtl(undefined); // 用户滚轮介入：撤销程序化钉位
    const href = computeActiveHref(sections, y);
    setActiveHref((prev) => (prev === href ? prev : href)); // 同段内同值 → React 跳过重渲染，滚动期 Shell 不重绘
  };

  return (
    <CodeDrawerContext.Provider value={codeApi}>
      <View style={{ flex: 1, position: 'relative', backgroundColor: token.colorBgContainer }}>
      {/* 顶部导航栏（已抽离为独立组件 components/TopBar） */}
      <TopBar
        section={section}
        onSwitchSection={switchSection}
        dark={dark}
        onToggleDark={setDark}
        onLogout={() => setLogoutOpen(true)}
      />

      {/* 案例段：大白板（无左菜单，点按钮弹独立窗口）；其余段：左侧菜单 + 右侧内容 */}
      {section === 'case' ? (
        <CaseBoard />
      ) : (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View
          style={{
            width: 236,
            backgroundColor: token.colorBgContainer,
            borderRightWidth: token.lineWidth,
            borderRightColor: token.colorBorderSecondary,
            paddingTop: token.paddingMD,
            paddingBottom: token.padding,
            paddingRight: token.paddingXS,
          }}
        >
          <ScrollView style={{ flex: 1 }}>
            <Menu
              accordion
              key={section}
              items={nav}
              selectedKeys={[active]}
              onClick={(i) => setActive(i.key)}
            />
          </ScrollView>
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: token.paddingLG,
              paddingVertical: token.padding,
              borderBottomWidth: token.lineWidth,
              borderBottomColor: token.colorBorderSecondary,
              backgroundColor: token.colorBgContainer,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText }}>
                {entry.title}
              </Text>
            </View>
          </View>
          <DemoNavContext.Provider value={navValue}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <ScrollView
                style={{ flex: 1 }}
                scrollY={jump}
                onScroll={handleScroll}
              >
                <FadeIn key={active} duration={280} style={{ padding: token.paddingLG }}>
                  {entry.node}
                </FadeIn>
              </ScrollView>
              {sections.length > 1 ? (
                <View
                  style={{
                    width: 168,
                    paddingTop: token.paddingLG + token.margin,
                    paddingRight: token.paddingLG,
                    paddingLeft: token.paddingSM,
                  }}
                >
                  <Anchor
                    showLine={false}
                    title="Usage"
                    items={anchorItems}
                    activeHref={activeHref}
                    onLinkClick={(href) => {
                      const s = sections.find((x) => x.id === href);
                      if (!s) return;
                      const y = Math.max(0, s.y);
                      syRef.current = y;
                      setActiveHref(href);
                      setJumpCtl(y); // 程序化跳转：受控钉到位后 effect 自动释放
                    }}
                  />
                </View>
              ) : null}
            </View>
          </DemoNavContext.Provider>
        </View>
      </View>
      )}

      {messageContextHolder}
      <Modal
        open={logoutOpen}
        title="注销确认"
        okText="确定注销"
        cancelText="取消"
        okDanger
        onOk={() => {
          setLogoutOpen(false);
          messageApi.info('已注销');
        }}
        onCancel={() => setLogoutOpen(false)}
      >
        确定要注销当前登录吗？
      </Modal>

      {/* 托盘退出确认：勾「下次不再询问」→写 App.prefs.confirmOnQuit=false（持久 flux_app.kv），下次直接退 */}
      <Modal
        open={quitOpen}
        title="退出确认"
        okText="退出"
        cancelText="取消"
        okDanger
        onOk={() => {
          if (dontAsk) Application.config.setPrefs({ confirmOnQuit: false });
          setQuitOpen(false);
          Application.log.write('gallery', '托盘确认退出');
          process.exit(0);
        }}
        onCancel={() => setQuitOpen(false)}
      >
        <View style={{ gap: token.marginSM }}>
          <Text style={{ fontSize: token.fontSize, color: token.colorText }}>确定要退出 {appName} 吗？</Text>
          <Checkbox checked={dontAsk} onChange={setDontAsk} label="下次不再询问（直接退出）" />
        </View>
      </Modal>

      {/* 代码抽屉：统一在右侧展示 demo 代码（placement=right → 从右向左滑入）；锚在上方全窗 relative 根，遮罩盖整窗 */}
      <Drawer
        open={codeData != null}
        title={codeData ? codeData.title : ''}
        placement="right"
        width={620}
        onClose={closeCode}
        maskClosable
      >
        {codeData ? (
          <ScrollView style={{ flex: 1 }}>
            <CodeBlock code={codeData.code} language={codeData.language || 'tsx'} showLineNumbers fontSize={12.5} />
          </ScrollView>
        ) : null}
      </Drawer>
      </View>
    </CodeDrawerContext.Provider>
  );
}
