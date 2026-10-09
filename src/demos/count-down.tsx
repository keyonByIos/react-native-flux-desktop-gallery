// COUNTDOWN：倒计时。统一走 DemoPage 多段式，覆盖 基础 / 含天 / 毫秒精度 / leftTime / 自定义渲染 / 暂停。
import React from 'react';
import { CountDown, Button, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

const H = 3600 * 1000;
const M = 60 * 1000;

/** 方块式自定义渲染 */
function RenderDemo(): React.ReactElement {
  const { token } = useToken();
  const box = (v: number, label: string): React.ReactElement => (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          minWidth: 48,
          paddingHorizontal: token.paddingXS,
          paddingVertical: token.paddingXXS,
          borderRadius: token.borderRadius,
          backgroundColor: token.colorText,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorBgContainer }}>
          {String(v).padStart(2, '0')}
        </Text>
      </View>
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: token.marginXXS }}>{label}</Text>
    </View>
  );
  return (
    <CountDown
      leftTime={2 * H + 15 * M + 30 * 1000}
      render={(t) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: token.marginXS }}>
          {box(t.hours, '时')}
          <Text style={{ fontSize: token.fontSizeXL, color: token.colorText, alignSelf: 'center' }}>:</Text>
          {box(t.minutes, '分')}
          <Text style={{ fontSize: token.fontSizeXL, color: token.colorText, alignSelf: 'center' }}>:</Text>
          {box(t.seconds, '秒')}
        </View>
      )}
    />
  );
}

/** 暂停演示 */
function PausedDemo(): React.ReactElement {
  const [paused, setPaused] = React.useState(false);
  return (
    <View style={{ gap: 12 }}>
      <CountDown leftTime={5 * M} format="mm:ss" paused={paused} valueStyle={{ color: '#1677ff' }} />
      <Button size="small" onPress={() => setPaused((p) => !p)}>
        {paused ? '继续' : '暂停'}
      </Button>
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: 'value 传截止时刻时间戳，默认 HH:mm:ss',
    node: <CountDown title="活动结束倒计时" value={Date.now() + 2 * H + 15 * M} format="HH:mm:ss" prefix="剩余" />,
    code: [
      'import { CountDown } from "react-native-flux-desktop";',
      '',
      '// value 传截止时刻时间戳，默认 HH:mm:ss',
      '<CountDown',
      '  title="活动结束倒计时"',
      '  value={Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000}',
      '  format="HH:mm:ss"',
      '  prefix="剩余"',
      '/>',
    ].join('\n'),
  },
  {
    name: '含天格式',
    desc: 'format 支持 DD 天，展示跨天倒计时',
    node: <CountDown value={Date.now() + 36 * H} format="DD 天 HH:mm:ss" suffix="后结束" />,
    code: [
      'import { CountDown } from "react-native-flux-desktop";',
      '',
      '// format 支持 DD 天，展示跨天倒计时',
      '<CountDown value={Date.now() + 36 * 3600 * 1000} format="DD 天 HH:mm:ss" suffix="后结束" />',
    ].join('\n'),
  },
  {
    name: '毫秒精度',
    desc: 'format 含 SSS 展示毫秒（秒杀场景）',
    node: <CountDown leftTime={9000} format="ss.SSS" prefix="秒杀" valueStyle={{ color: '#ff4d4f' }} />,
    code: [
      'import { CountDown } from "react-native-flux-desktop";',
      '',
      '// format 含 SSS 展示毫秒（秒杀场景）',
      '<CountDown leftTime={9000} format="ss.SSS" prefix="秒杀" valueStyle={{ color: \'#ff4d4f\' }} />',
    ].join('\n'),
  },
  {
    name: 'leftTime 模式',
    desc: 'leftTime 传剩余毫秒，挂载起算',
    node: <CountDown leftTime={30 * M} format="mm:ss" suffix="后刷新" valueStyle={{ color: '#1677ff' }} />,
    code: [
      'import { CountDown } from "react-native-flux-desktop";',
      '',
      '// leftTime 传剩余毫秒，挂载起算',
      '<CountDown leftTime={30 * 60 * 1000} format="mm:ss" suffix="后刷新" valueStyle={{ color: \'#1677ff\' }} />',
    ].join('\n'),
  },
  {
    name: '自定义渲染',
    desc: 'render 接管数值区域，渲染为方块分段',
    node: <RenderDemo />,
    code: [
      'import { CountDown, View } from "react-native-flux-desktop";',
      '',
      '// render 接管数值区域，依时间片自定义渲染',
      '<CountDown',
      '  leftTime={2 * 3600 * 1000}',
      '  render={(t) => (',
      '    <View style={{ flexDirection: \'row\', gap: 8 }}>',
      '      <Box v={t.hours} label="时" />',
      '      <Box v={t.minutes} label="分" />',
      '      <Box v={t.seconds} label="秒" />',
      '    </View>',
      '  )}',
      '/>',
    ].join('\n'),
  },
  {
    name: '暂停',
    desc: 'paused 暂停计时，可恢复',
    node: <PausedDemo />,
    code: [
      'import { CountDown, Button } from "react-native-flux-desktop";',
      '',
      '// paused 暂停计时，可恢复',
      'const [paused, setPaused] = useState(false);',
      '<CountDown leftTime={5 * 60 * 1000} format="mm:ss" paused={paused} />',
      '<Button size="small" onPress={() => setPaused((p) => !p)}>暂停 / 继续</Button>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'title', desc: '标题', type: 'ReactNode', default: '–' },
  { name: 'value', desc: '截止时刻时间戳(ms)', type: 'number', default: '–' },
  { name: 'leftTime', desc: '剩余毫秒（挂载起算）', type: 'number', default: '–' },
  { name: 'format', desc: '展示格式 D/HH/mm/ss/SSS', type: 'string', default: "'HH:mm:ss'" },
  { name: 'paused', desc: '暂停计时', type: 'boolean', default: 'false' },
  { name: 'prefix / suffix', desc: '前后缀', type: 'ReactNode', default: '–' },
  { name: 'render', desc: '自定义渲染时间片', type: '(parts) => ReactNode', default: '–' },
  { name: 'onChange / onFinish', desc: '变化 / 结束回调', type: '(parts) / () => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'fontSizeXL', desc: '数值字号', default: '24' },
  { name: 'colorTextTertiary', desc: '标题 / 前后缀色', default: '三级文本' },
  { name: 'ticker', desc: '全局帧驱动 subscribe', default: '按需重绘' },
];

export function CountDownDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
