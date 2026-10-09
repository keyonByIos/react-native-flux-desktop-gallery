// Gallery 入口：左侧 Menu 导航 + 右侧内容区 + 顶部段切换 + 主题控制。
// 内容组件见 Shell.tsx，导航数据见 data/nav.ts，条目注册表见 data/entries.tsx，主题设置窗见 components/ThemeSettings.tsx。
// 本文件是稳定外壳（Window/FluxProvider/App + 全局浮层），不含任何 dev/热更新逻辑。
import './bootstrap-env'; // 必须第一行：React require 前决定 dev/prod 构建（打包态走 prod，省内存+CPU）
import React from 'react';
import fs from 'fs';
import path from 'path';
import {
  render,
  grabAll,
  Window,
  FluxProvider,
  ContextMenuLayer,
  TextSelectionLayer,
  DragLayer,
  App,
  Application,
  acquireSingleInstance,
  configureLogger,
  ThemeAlgorithm,
  type LogLevel,
} from 'react-native-flux-desktop';
import { seedThemeFromEnv, useAppTheme } from './components/ThemeSettings';
import { Shell } from './Shell';

// 项目配置（根目录 app.json）
interface AppConfig {
  name: string;
  description: string;
  version: string;
  icon: string;
  allowMultiOpen?: boolean;
  logger?: { path?: string; level?: LogLevel };
  /**
   * 光栅倍率封顶（可选，缺省/0 = 不封顶，跟随原生 scale，present 走 1:1 最清晰）。
   * 仅在超高 DPI 屏愿牺牲清晰度换更低每帧缓冲内存时设，如 1 或 1.5。
   */
  maxDpr?: number;
  /**
   * app.json 声明的字体资源：[{ family(注册别名), file(相对项目根的路径如 assets/fonts/*.ttf，或绝对路径如 C:/Windows/Fonts/simhei.ttf), bold? }]
   * 启动时经 env FLUX_FONTS 传给 registerFonts() 注册；放 assets/ 下会被打包器自动内嵌，绝对路径引用系统字体则不打包。
   */
  fonts?: Array<{ family: string; file: string; bold?: string }>;
  /** 全局正文字体别名（应取自 fonts[] 的 family，或内置 'Flux Sans'）；缺省 = 内置雅黑（含 CJK） */
  defaultFont?: string;
}
const APP: AppConfig = (() => {
  const fallback: AppConfig = { name: 'App', description: '', version: '0.0.0', icon: 'assets/icon.png' };
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'app.json'), 'utf8');
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
})();

if (APP.icon) process.env.FLUX_ICON = path.isAbsolute(APP.icon) ? APP.icon : path.join(process.cwd(), APP.icon);
process.env.FLUX_APP_ID = `FluxDesktop.${APP.name.replace(/[^0-9A-Za-z]+/g, '')}`;
// 可选 DPR 封顶：host.ts 的 dpr() 每帧惰性读 env，故此处设置对本次渲染即生效（打包/SEA 态同样适用，app.json 已展到运行目录）。
if (typeof APP.maxDpr === 'number' && APP.maxDpr > 0) process.env.FLUX_MAX_DPR = String(APP.maxDpr);
// 字体：app.json 声明的资源列表 + 全局默认族注入 env，供 registerFonts() 首帧前消费（库保持通用，不自己读 app.json）。
// 全局默认优先级：持久化偏好 App.prefs.font（用户在「字体」demo 手选，需重启）> app.json defaultFont > 内置。
if (Array.isArray(APP.fonts) && APP.fonts.length) process.env.FLUX_FONTS = JSON.stringify(APP.fonts);
(() => {
  let pref = '';
  try {
    pref = Application.config.getPrefs().font || '';
  } catch {
    /* addon 未就绪：回落 app.json */
  }
  process.env.FLUX_DEFAULT_FAMILY = pref || APP.defaultFont || '';
})();

function Gallery(): React.ReactElement {
  const { dark, compact, primary, animation, fontSize, controlHeight } = useAppTheme();
  const algorithm: ThemeAlgorithm[] = [
    dark ? 'dark' : 'default',
    ...(compact ? (['compact'] as ThemeAlgorithm[]) : []),
  ];
  // fontSize/controlHeight 仅在显式设值时注入（缺 key 才回落到算法默认）
  const token: Record<string, string | number> = { colorPrimary: primary, colorLink: primary, colorInfo: primary };
  if (fontSize != null) token.fontSize = fontSize;
  if (controlHeight != null) token.controlHeight = controlHeight;
  return (
    <Window 
     title={APP.name} 
     width={1280}
     height={640}
     minWidth={1280}
     minHeight={640}>
      <FluxProvider theme={{ algorithm, token }} animation={animation}>
        <App>
          <Shell
            dark={dark}
            compact={compact}
            setDark={(v) => Application.config.setTheme({ dark: v })}
            setCompact={(v) => Application.config.setTheme({ compact: v })}
            animation={animation}
            setAnimation={(v) => Application.config.setTheme({ animation: v })}
            primary={primary}
            setPrimary={(v) => Application.config.setTheme({ primary: v })}
            appName={APP.name}
          />
        </App>
        <ContextMenuLayer />
        <TextSelectionLayer />
        <DragLayer />
      </FluxProvider>
    </Window>
  );
}

// 启动
configureLogger({ path: APP.logger?.path, level: APP.logger?.level });
seedThemeFromEnv();

if (
  acquireSingleInstance({
    name: `flux-${APP.name.replace(/[^0-9A-Za-z]+/g, '')}`,
    allowMulti: APP.allowMultiOpen === true,
    onSecondInstance: () => Application.wakeMainWindow(),
  })
) {
  Application.log.write('gallery', 'Gallery 启动', { name: APP.name, version: APP.version });
  render(React.createElement(Gallery)).then(() => {
    const dir = process.env.FLUX_GRAB_DIR;
    if (dir) {
      const delay = Number(process.env.FLUX_GRAB_DELAY) || 700;
      setTimeout(() => {
        grabAll(dir);
        process.exit(0);
      }, delay);
    }
  }).catch(e => {
    console.error('[gallery] 启动失败：', e);
  });
} else {
  console.log('[gallery] 已有实例在运行：已请求唤醒老窗口，本进程即将退出（单实例锁）');
}
