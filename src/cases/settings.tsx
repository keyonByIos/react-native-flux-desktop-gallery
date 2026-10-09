// cases/settings.tsx —— 「系统设置 Settings」整合案例（左分组导航 + 右控件区）。
// 分组：通用 / 外观 / 通知 / 隐私 / 高级；控件涵盖 Select、Switch、Slider、Segmented、Radio.Group、主题色块、恢复默认按钮。
// 交互：切分组、开关、滑杆、分段、单选、选主题色均为真实本地受控状态（外观组「主题」分段仅演示选择，不驱动全局换肤）。全走 token 明暗自适应。
// 两栏用 plain flex 行；右侧纵向 ScrollView。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Icon,
  Switch,
  Slider,
  Segmented,
  Radio,
  Select,
  Button,
  ScrollView,
  Divider,
  useToken,
  type AliasToken,
} from 'react-native-flux-desktop';

const NAV_W = 188;

type GroupId = 'general' | 'appearance' | 'notify' | 'privacy' | 'advanced';

const GROUPS: { id: GroupId; name: string; icon: string }[] = [
  { id: 'general', name: '通用', icon: 'setting' },
  { id: 'appearance', name: '外观', icon: 'sliders' },
  { id: 'notify', name: '通知', icon: 'bell' },
  { id: 'privacy', name: '隐私', icon: 'shield' },
  { id: 'advanced', name: '高级', icon: 'database' },
];

const THEME_COLORS = ['#1677ff', '#13c2c2', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#f5222d'];

interface Settings {
  lang: string;
  autoStart: boolean;
  autoUpdate: boolean;
  zoom: number;
  theme: string;
  accent: string;
  radius: number;
  motion: boolean;
  desktopNotify: boolean;
  sound: boolean;
  notifyStyle: string;
  quiet: string;
  sync: boolean;
  crashReport: boolean;
  hwAccel: boolean;
  cache: number;
  logLevel: string;
}

export function SettingsDemo(): React.ReactElement {
  const { token } = useToken();
  const [group, setGroup] = React.useState<GroupId>('general');
  const [s, setS] = React.useState<Settings>({
    lang: 'zh', autoStart: true, autoUpdate: true, zoom: 100,
    theme: 'system', accent: '#1677ff', radius: 8, motion: true,
    desktopNotify: true, sound: false, notifyStyle: 'banner', quiet: '22:00-08:00',
    sync: true, crashReport: true, hwAccel: true, cache: 512, logLevel: 'warn',
  });
  const [toast, setToast] = React.useState<string | null>(null);

  const up = <K extends keyof Settings>(k: K, v: Settings[K]): void => setS((p) => ({ ...p, [k]: v }));
  const flash = (msg: string): void => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: token.colorBgContainer }}>
      {/* 左：分组导航 */}
      <View style={{ width: NAV_W, borderRightWidth: token.lineWidth, borderRightColor: token.colorBorderSecondary, padding: token.paddingSM }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXS, paddingHorizontal: 8, paddingVertical: 8 }}>
          <Icon name="setting" size={16} color={token.colorPrimary} />
          <Text style={{ fontSize: token.fontSize, fontWeight: '600', color: token.colorText }}>设置</Text>
        </View>
        <View style={{ gap: 2 }}>
          {GROUPS.map((g) => {
            const on = g.id === group;
            return (
              <Pressable key={g.id} onPress={() => setGroup(g.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginSM, paddingHorizontal: 10, paddingVertical: 9, borderRadius: token.borderRadius, backgroundColor: on ? token.colorFillSecondary : 'transparent', cursor: 'pointer' }}>
                <Icon name={g.icon} size={15} color={on ? token.colorPrimary : token.colorTextSecondary} />
                <Text style={{ fontSize: 13, fontWeight: on ? '600' : '400', color: on ? token.colorPrimary : token.colorText }}>{g.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 右：控件区 */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: token.paddingLG + token.margin, paddingHorizontal: token.paddingLG + token.marginSM }}>
        <View style={{ maxWidth: 720 }}>
        <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText, marginBottom: token.marginXS }}>
          {GROUPS.find((g) => g.id === group)?.name}
        </Text>

        {group === 'general' ? (
          <View>
            <Row token={token} label="语言" desc="界面显示语言">
              <Select value={s.lang} onChange={(v) => up('lang', String(v))} style={{ width: 160 }} options={[{ label: '简体中文', value: 'zh' }, { label: 'English', value: 'en' }]} />
            </Row>
            <Row token={token} label="开机自启" desc="登录系统后自动运行 Flux">
              <Switch checked={s.autoStart} onChange={(c) => up('autoStart', c)} />
            </Row>
            <Row token={token} label="自动检查更新" desc="启动时静默检查新版本">
              <Switch checked={s.autoUpdate} onChange={(c) => up('autoUpdate', c)} />
            </Row>
            <Row token={token} label="界面缩放" desc={`${s.zoom}%`} last>
              <View style={{ width: 180 }}><Slider min={80} max={140} value={s.zoom} onChange={(v) => up('zoom', v)} /></View>
            </Row>
          </View>
        ) : null}

        {group === 'appearance' ? (
          <View>
            <Row token={token} label="主题" desc="跟随系统或强制浅/深色">
              <Segmented value={s.theme} onChange={(v) => up('theme', String(v))} options={[{ label: '跟随系统', value: 'system' }, { label: '浅色', value: 'light' }, { label: '深色', value: 'dark' }]} />
            </Row>
            <Row token={token} label="主题色" desc="主强调色，影响按钮/选中态">
              <View style={{ flexDirection: 'row', gap: token.marginXS }}>
                {THEME_COLORS.map((c) => (
                  <Pressable key={c} onPress={() => up('accent', c)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c, alignItems: 'center', justifyContent: 'center', borderWidth: s.accent === c ? 2 : 0, borderColor: token.colorBgContainer, cursor: 'pointer' }}>
                    {s.accent === c ? <Icon name="check" size={13} color="#fff" /> : null}
                  </Pressable>
                ))}
              </View>
            </Row>
            <Row token={token} label="圆角大小" desc={`${s.radius}px`}>
              <View style={{ width: 180 }}><Slider min={0} max={16} value={s.radius} onChange={(v) => up('radius', v)} /></View>
            </Row>
            <Row token={token} label="动效" desc="开启过渡与淡入动画" last>
              <Switch checked={s.motion} onChange={(c) => up('motion', c)} />
            </Row>
          </View>
        ) : null}

        {group === 'notify' ? (
          <View>
            <Row token={token} label="桌面通知" desc="在系统通知中心提醒">
              <Switch checked={s.desktopNotify} onChange={(c) => up('desktopNotify', c)} />
            </Row>
            <Row token={token} label="提示音" desc="收到通知时播放声音">
              <Switch checked={s.sound} onChange={(c) => up('sound', c)} />
            </Row>
            <Row token={token} label="通知方式" desc="横幅 / 弹窗 / 仅角标">
              <Radio.Group optionType="button" value={s.notifyStyle} onChange={(v) => up('notifyStyle', String(v))} options={[{ label: '横幅', value: 'banner' }, { label: '弹窗', value: 'alert' }, { label: '角标', value: 'badge' }]} />
            </Row>
            <Row token={token} label="免打扰时段" desc="该时间段内静默" last>
              <Select value={s.quiet} onChange={(v) => up('quiet', String(v))} style={{ width: 160 }} options={[{ label: '22:00 - 08:00', value: '22:00-08:00' }, { label: '23:00 - 07:00', value: '23:00-07:00' }, { label: '关闭', value: 'off' }]} />
            </Row>
          </View>
        ) : null}

        {group === 'privacy' ? (
          <View>
            <Row token={token} label="云同步" desc="跨设备同步偏好与看板">
              <Switch checked={s.sync} onChange={(c) => up('sync', c)} />
            </Row>
            <Row token={token} label="崩溃报告" desc="发送匿名崩溃堆栈帮助改进" last>
              <Switch checked={s.crashReport} onChange={(c) => up('crashReport', c)} />
            </Row>
          </View>
        ) : null}

        {group === 'advanced' ? (
          <View>
            <Row token={token} label="硬件加速" desc="使用 GPU 渲染（关闭可排障）">
              <Switch checked={s.hwAccel} onChange={(c) => up('hwAccel', c)} />
            </Row>
            <Row token={token} label="缓存上限" desc={`${s.cache} MB`}>
              <View style={{ width: 180 }}><Slider min={128} max={2048} step={128} value={s.cache} onChange={(v) => up('cache', v)} /></View>
            </Row>
            <Row token={token} label="日志级别" desc="详细程度越高越占空间" last>
              <Select value={s.logLevel} onChange={(v) => up('logLevel', String(v))} style={{ width: 160 }} options={[{ label: 'error', value: 'error' }, { label: 'warn', value: 'warn' }, { label: 'info', value: 'info' }, { label: 'debug', value: 'debug' }]} />
            </Row>
            <Divider style={{ marginVertical: token.marginLG }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 14, color: token.colorText }}>恢复默认设置</Text>
                <Text style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 2 }}>清除所有偏好并重启应用后生效</Text>
              </View>
              <Button danger type="primary" onPress={() => flash('已恢复默认（演示）')}>恢复默认</Button>
            </View>
          </View>
        ) : null}
        </View>
      </ScrollView>

      {/* 轻提示 */}
      {toast ? (
        <View style={{ position: 'absolute', bottom: token.marginLG, alignSelf: 'center', paddingHorizontal: token.padding, paddingVertical: 8, borderRadius: token.borderRadius, backgroundColor: token.colorText }}>
          <Text style={{ fontSize: 13, color: token.colorBgContainer }}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Row(props: { token: AliasToken; label: string; desc?: string; last?: boolean; children: React.ReactNode }): React.ReactElement {
  const { token } = props;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.margin, paddingVertical: token.padding, borderBottomWidth: props.last ? 0 : token.lineWidth, borderBottomColor: token.colorBorderSecondary }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, color: token.colorText }}>{props.label}</Text>
        {props.desc ? <Text style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 2 }}>{props.desc}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>{props.children}</View>
    </View>
  );
}

export default SettingsDemo;
