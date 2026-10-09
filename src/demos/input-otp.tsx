// INPUT-OTP：一次性验证码输入。DemoPage 多段式，覆盖 基础 / 掩码 / 4 位 / 完成回调 / 状态。
import React from 'react';
import { InputOTP, Text, View, useToken } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础 6 位 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [val, setVal] = React.useState('');
  return (
    <View>
      <InputOTP length={6} onChange={setVal} />
      <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        当前值: {val || '(空)'} (长度 {val.length})
      </Text>
    </View>
  );
}

/** 掩码模式 */
function MaskedDemo(): React.ReactElement {
  return <InputOTP length={6} masked defaultValue="123456" />;
}

/** 4 位短信码 */
function ShortDemo(): React.ReactElement {
  const { token } = useToken();
  const [done, setDone] = React.useState(false);
  return (
    <View>
      <InputOTP length={4} onComplete={() => setDone(true)} />
      {done ? (
        <Text style={{ marginTop: token.marginXS, fontSize: token.fontSizeSM, color: token.colorSuccess }}>
          验证码已提交！
        </Text>
      ) : null}
    </View>
  );
}

/** 校验状态 */
function StatusDemo(): React.ReactElement {
  return (
    <View style={{ gap: 16 }}>
      <InputOTP length={6} status="error" defaultValue="123" />
      <InputOTP length={6} status="warning" defaultValue="456" />
      <InputOTP length={6} disabled defaultValue="789" />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: '6 格，键盘逐字录入',
    node: <BasicDemo />,
    code: [
      'import { InputOTP } from "react-native-flux-desktop";',
      '',
      '// 6 格，键盘逐字录入',
      'const [val, setVal] = useState(\'\');',
      '<InputOTP length={6} onChange={setVal} />',
    ].join('\n'),
  },
  {
    name: '掩码模式',
    desc: 'masked 显示 • 代替实际字符',
    node: <MaskedDemo />,
    code: [
      'import { InputOTP } from "react-native-flux-desktop";',
      '',
      '// masked 显示 • 代替实际字符',
      '<InputOTP length={6} masked defaultValue="123456" />',
    ].join('\n'),
  },
  {
    name: '4 位短码',
    desc: 'length=4 + onComplete 回调',
    node: <ShortDemo />,
    code: [
      'import { InputOTP } from "react-native-flux-desktop";',
      '',
      '// length=4 + onComplete 全部填满回调',
      '<InputOTP length={4} onComplete={() => setDone(true)} />',
    ].join('\n'),
  },
  {
    name: '校验/禁用',
    desc: 'status error/warning + disabled',
    node: <StatusDemo />,
    code: [
      'import { InputOTP, View } from "react-native-flux-desktop";',
      '',
      '// status=error / warning + disabled',
      '<View style={{ gap: 16 }}>',
      '  <InputOTP length={6} status="error" defaultValue="123" />',
      '  <InputOTP length={6} status="warning" defaultValue="456" />',
      '  <InputOTP length={6} disabled defaultValue="789" />',
      '</View>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'length', desc: '格子数量', type: 'number', default: '6' },
  { name: 'value / defaultValue', desc: '绑定值', type: 'string', default: "''" },
  { name: 'onChange', desc: '值变化回调', type: '(v: string) => void', default: '–' },
  { name: 'onComplete', desc: '全部填满回调', type: '(v: string) => void', default: '–' },
  { name: 'masked', desc: '掩码显示', type: 'boolean', default: 'false' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'status', desc: '校验状态', type: "'error'|'warning'", default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'controlHeightLG', desc: '格子基准尺寸', default: '40' },
  { name: 'colorPrimary', desc: '聚焦边框色', default: '#3b82f6' },
  { name: 'colorBorder', desc: '默认边框色', default: '–' },
];

export function InputOTPDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
