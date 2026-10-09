// 主题设置窗（独立模态 React 根）+ 全局主题 hook + 启动期 env 种子。
// 由 App.tsx 的 Shell/Gallery 消费：openThemeSettings 开模态窗，useAppTheme 订阅跨窗同步。
import React from 'react';
import { View, Text, Pressable, ColorPicker, Segmented, Slider, useToken, Application } from 'react-native-flux-desktop';
import { useAppTheme, Themed } from './AppWindow';

// useAppTheme 已收敛到 AppWindow；此处再导出，保持 App.tsx 从本文件引入的既有路径不变
export { useAppTheme } from './AppWindow';

/** FLUX_ALGO 解析：'default' | 'dark' | 'compact' 或逗号组合；缺省 = 暗色 + 紧凑 */
function parseInitialTheme(): { dark: boolean; compact: boolean } {
  const env = (process.env.FLUX_ALGO || '').toLowerCase();
  if (!env) return { dark: true, compact: true };
  const parts = env.split(/[,\s]+/).filter(Boolean);
  return { dark: parts.includes('dark'), compact: parts.includes('compact') };
}

// 主题唯一事实来源 = 全局 Application.config（系统层，flux_app.kv 持久化）。无抓帧/调试 env 时尊重持久化的上会话主题；
// 仅当显式设定 FLUX_ALGO/PRIMARY/ANIM 时才一次性覆盖（供抓帧/调试固定外观）。
export function seedThemeFromEnv(): void {
  const hasEnv = process.env.FLUX_ALGO || process.env.FLUX_PRIMARY || process.env.FLUX_ANIM;
  if (!hasEnv) return;
  const init = parseInitialTheme();
  Application.config.setTheme({
    dark: init.dark,
    compact: init.compact,
    primary: process.env.FLUX_PRIMARY || '#3b82f6',
    animation: process.env.FLUX_ANIM !== '0',
  });
}

/** 订阅全局主题的 hook 已上收至 AppWindow.useAppTheme（上方 re-export） */

/** 打开主题设置子窗（模态 · 叠于主窗之上）：已开则不重复 */
export function openThemeSettings(): void {
  if (Application.findByTag('theme-settings')) return;
  Application.open({
    content: React.createElement(ThemeSettingsWindow),
    title: '主题设置',
    width: 420,
    height: 560,
    modal: true,
    tag: 'theme-settings',
    parentId: Application.main()?.id,
  });
}

/** 主题设置窗（独立 React 根）：复用 AppWindow.Themed 自带 FluxProvider（订阅全局主题），控件写回全局 → 主窗同步换肤 */
function ThemeSettingsWindow(): React.ReactElement {
  return (
    <Themed>
      <ThemeSettingsBody />
    </Themed>
  );
}

function ThemeSettingsBody(): React.ReactElement {
  const { token } = useToken();
  const theme = useAppTheme();
  const page = { flex: 1, padding: token.paddingMD, backgroundColor: token.colorBgContainer };
  const h1 = { fontSize: token.fontSize, fontWeight: '700' as const, color: token.colorText, marginBottom: token.marginXXS };
  const desc = { fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginLG, lineHeight: 19 };
  const group = { marginBottom: token.margin };
  const label = { fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginXS };
  const divider = { height: 1, backgroundColor: token.colorBorderSecondary, marginVertical: token.margin };
  const closeBtn = {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorError,
  };
  return (
    <View style={page}>
      <Text style={h1}>主题设置</Text>
      <Text style={desc}>本窗为模态窗：未关闭前主窗不可操作。改动即时写回全局 Application.config.theme，所有窗口同步换肤。</Text>
      <View style={group}>
        <Text style={label}>主色 Primary</Text>
        <ColorPicker value={theme.primary} onChange={(v) => Application.config.setTheme({ primary: v })} />
      </View>
      <View style={group}>
        <Text style={label}>外观</Text>
        <Segmented
          value={theme.dark ? 'dark' : 'default'}
          onChange={(v) => Application.config.setTheme({ dark: v === 'dark' })}
          options={[
            { label: '明亮', value: 'default' },
            { label: '暗黑', value: 'dark' },
          ]}
        />
      </View>
      <View style={group}>
        <Text style={label}>密度</Text>
        <Segmented
          value={theme.compact ? 'compact' : 'default'}
          onChange={(v) => Application.config.setTheme({ compact: v === 'compact' })}
          options={[
            { label: '紧凑', value: 'compact' },
            { label: '宽松', value: 'default' },
          ]}
        />
      </View>
      <View style={group}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: token.marginXS }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>字号 Font Size</Text>
          {theme.fontSize != null ? (
            <Pressable onPress={() => Application.config.setTheme({ fontSize: undefined })} style={{ cursor: 'pointer' }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorPrimary }}>跟随密度</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Slider min={10} max={20} step={1} value={token.fontSize} onChange={(v) => Application.config.setTheme({ fontSize: v })} style={{ flex: 1 }} />
          <Text style={{ fontSize: token.fontSize, color: token.colorText, width: 42, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{token.fontSize}px</Text>
        </View>
      </View>
      <View style={group}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: token.marginXS }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>控件高度 Control Height</Text>
          {theme.controlHeight != null ? (
            <Pressable onPress={() => Application.config.setTheme({ controlHeight: undefined })} style={{ cursor: 'pointer' }}>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorPrimary }}>跟随密度</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM }}>
          <Slider min={22} max={40} step={1} value={token.controlHeight} onChange={(v) => Application.config.setTheme({ controlHeight: v })} style={{ flex: 1 }} />
          <Text style={{ fontSize: token.fontSize, color: token.colorText, width: 42, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{token.controlHeight}px</Text>
        </View>
      </View>
      <View style={group}>
        <Text style={label}>动效</Text>
        <Segmented
          value={theme.animation ? 'on' : 'off'}
          onChange={(v) => Application.config.setTheme({ animation: v === 'on' })}
          options={[
            { label: '开启', value: 'on' },
            { label: '关闭', value: 'off' },
          ]}
        />
      </View>

      <View style={divider} />
      <Pressable style={closeBtn} onPress={() => Application.closeTag('theme-settings')}>
        <Text style={{ color: token.colorTextLightSolid, fontSize: token.fontSize, fontWeight: '600' as const }}>关闭设置窗口</Text>
      </Pressable>
    </View>
  );
}
