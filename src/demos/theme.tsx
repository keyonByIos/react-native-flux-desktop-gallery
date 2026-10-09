// THEME：把「换 token 就换皮」做成可玩的一页 —— 三个正交维度（明/暗 × 紧凑/宽松 × 主色）
// + 主色派生色阶可视化 + 组件换肤实况 + 关键 token 读数。统一走 DemoPage 容器范式。
import React from 'react';
import { View, Text, Space, Button, Tag, Switch, ColorPicker, Segmented, useToken } from 'react-native-flux-desktop';
import { generate, readability } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type TokenRow } from '../DemoPage';

interface ThemeDemoProps {
  dark: boolean;
  compact: boolean;
  setDark: (v: boolean) => void;
  setCompact: (v: boolean) => void;
  primary: string;
  setPrimary: (v: string) => void;
}

/** 实色底上的文字：按对比度在白/近黑间自动择一 */
const onColor = (bg: string): string =>
  readability(bg, '#ffffff') >= readability(bg, '#141414') ? '#ffffff' : '#141414';

/** 维度控件：外观 × 密度 × 主色，三个正交开关集中演示 */
function DimensionControls(props: ThemeDemoProps): React.ReactElement {
  const { token } = useToken();
  const { dark, compact, setDark, setCompact, primary, setPrimary } = props;
  const field = (label: string, node: React.ReactNode): React.ReactElement => (
    <View style={{ gap: token.marginXXS }}>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{label}</Text>
      {node}
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginLG, alignItems: 'flex-end' }}>
      {field(
        '外观',
        <Segmented
          value={dark ? 'dark' : 'default'}
          onChange={(v) => setDark(v === 'dark')}
          options={[
            { label: '明亮', value: 'default' },
            { label: '暗黑', value: 'dark' },
          ]}
        />
      )}
      {field(
        '密度',
        <Segmented
          value={compact ? 'compact' : 'default'}
          onChange={(v) => setCompact(v === 'compact')}
          options={[
            { label: '紧凑', value: 'compact' },
            { label: '宽松', value: 'default' },
          ]}
        />
      )}
      {field('主色', <ColorPicker value={primary} onChange={setPrimary} />)}
    </View>
  );
}

/** 主色派生：从单个 colorPrimary 种子，用 antd HSV 算法铺开 10 级色阶 + 语义别名取用 */
function PaletteShowcase(): React.ReactElement {
  const { token } = useToken();
  const shades = generate(token.colorPrimary);
  const aliases = [
    { name: 'colorPrimary', value: token.colorPrimary },
    { name: 'colorPrimaryHover', value: token.colorPrimaryHover },
    { name: 'colorPrimaryActive', value: token.colorPrimaryActive },
    { name: 'colorPrimaryBg', value: token.colorPrimaryBg },
    { name: 'colorPrimaryBorder', value: token.colorPrimaryBorder },
    { name: 'colorPrimaryText', value: token.colorPrimaryText },
  ];
  return (
    <View style={{ gap: token.marginLG }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXS }}>
        {shades.map((c, i) => (
          <View key={c} style={{ width: 72, alignItems: 'center', gap: token.marginXXS }}>
            <View
              style={{
                width: 72,
                height: 44,
                borderRadius: token.borderRadius,
                backgroundColor: c,
                borderWidth: token.lineWidth,
                borderColor: token.colorBorderSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: token.fontSizeSM, color: onColor(c) }}>{i + 1}</Text>
            </View>
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>{c.toUpperCase()}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: token.marginXS }}>
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>
          语义别名从色阶中取用，组件只认语义名：
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginSM }}>
          {aliases.map((a) => (
            <View key={a.name} style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginXXS }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: token.borderRadiusSM,
                  backgroundColor: a.value,
                  borderWidth: token.lineWidth,
                  borderColor: token.colorBorderSecondary,
                }}
              />
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{a.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/** 换肤实况：同一批组件随 token 实时重绘 */
function LiveSamples(): React.ReactElement {
  const { token } = useToken();
  const [on, setOn] = React.useState(true);
  return (
    <Space size="middle" align="center" wrap>
      <Button type="primary">Primary</Button>
      <Button type="primary" ghost>
        Ghost
      </Button>
      <Button type="link">Link</Button>
      <Tag color="processing">Processing</Tag>
      <Tag>Default</Tag>
      <Switch checked={on} onChange={setOn} />
      <View style={{ width: 120, height: 6, borderRadius: 3, backgroundColor: token.colorFillSecondary }}>
        <View style={{ width: 78, height: 6, borderRadius: 3, backgroundColor: token.colorPrimary }} />
      </View>
    </Space>
  );
}

export function ThemeDemo(props: ThemeDemoProps): React.ReactElement {
  const { token } = useToken();
  const demos: DemoItem[] = [
    {
      name: '三个正交维度',
      desc: '外观（明/暗）× 密度（紧凑/宽松）× 主色，三个开关自由叠加、互不耦合。',
      node: <DimensionControls {...props} />,
      code: [
        'import { Segmented, ColorPicker } from "react-native-flux-desktop";',
        '',
        '// 三个正交开关：外观(明/暗) × 密度(紧凑/宽松) × 主色',
        '// 写回主题 store 后，整棵组件树重绘',
        '<Segmented',
        '  value={dark ? \'dark\' : \'default\'}',
        '  onChange={(v) => setDark(v === \'dark\')}',
        '  options={[{ label: \'明亮\', value: \'default\' }, { label: \'暗黑\', value: \'dark\' }]}',
        '/>',
        '<ColorPicker value={primary} onChange={setPrimary} />',
      ].join('\n'),
    },
    {
      name: '主色派生色阶',
      desc: '从单个 colorPrimary 种子，用 antd 同款 HSV 算法派生 10 级色板，语义别名再从中取用。',
      node: <PaletteShowcase />,
      code: [
        'import { generate, useToken } from "react-native-flux-desktop";',
        '',
        '// 从单个种子用 antd HSV 算法派生 10 级色阶',
        'const { token } = useToken();',
        'const shades = generate(token.colorPrimary); // [color-1 … color-10]',
      ].join('\n'),
    },
    {
      name: '换肤实况',
      desc: '同一批组件随 token 实时重绘 —— token 是唯一事实来源。',
      node: <LiveSamples />,
      code: [
        'import { useToken, Button, Tag, Switch } from "react-native-flux-desktop";',
        '',
        '// 同一批组件读同一份 token → 换肤时实时重绘',
        'const { token } = useToken();',
        '<Button type="primary">Primary</Button>',
        '<Tag color="processing">Processing</Tag>',
        '<Switch checked={on} onChange={setOn} />',
      ].join('\n'),
    },
  ];
  const tokens: TokenRow[] = [
    { name: 'colorPrimary', desc: '品牌主色（种子级），派生整套色阶', default: token.colorPrimary },
    { name: 'colorBgContainer', desc: '容器 / 页面底色', default: token.colorBgContainer },
    { name: 'colorBgLayout', desc: '布局底色（暗色下为半透明灰）', default: token.colorBgLayout },
    { name: 'colorText', desc: '主文本色', default: token.colorText },
    { name: 'colorSuccess / Warning / Error', desc: '状态语义色', default: `${token.colorSuccess} · ${token.colorWarning} · ${token.colorError}` },
    { name: 'controlHeight', desc: 'middle 控件高度', default: String(token.controlHeight) },
    { name: 'borderRadius', desc: '基础圆角', default: String(token.borderRadius) },
    { name: 'fontSize', desc: '基准字号', default: String(token.fontSize) },
  ];
  return <DemoPage demos={demos} tokens={tokens} />;
}
