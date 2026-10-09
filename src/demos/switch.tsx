// SWITCH：开关。统一走 DemoPage 多段式，覆盖 基础 / 文字内容 / 尺寸 / 加载态 / 禁用。
import React from 'react';
import { Switch, View, Text, useToken, Icon } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础：受控 + 非受控回显 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [sw, setSw] = React.useState(true);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: token.marginLG }}>
      <Switch checked={sw} onChange={setSw} />
      <Switch defaultChecked />
      <Switch defaultChecked={false} />
      <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>受控：{sw ? '开' : '关'}</Text>
    </View>
  );
}

/** 文字内容：checkedChildren / unCheckedChildren */
function TextDemo(): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
      <Switch defaultChecked checkedChildren="开" unCheckedChildren="关" />
      <Switch defaultChecked={false} checkedChildren="开" unCheckedChildren="关" />
      <Switch
        defaultChecked
        checkedChildren={<Icon name="check" size={12} color="#fff" strokeWidth={3} />}
        unCheckedChildren={<Icon name="close" size={12} color="#999" strokeWidth={3} />}
      />
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础',
    desc: '受控 / 非受控，点轨道切换',
    node: <BasicDemo />,
    code: [
      'import { Switch } from "react-native-flux-desktop";',
      '',
      '// 受控：checked + onChange；非受控：defaultChecked',
      "const [sw, setSw] = React.useState(true);",
      '<Switch checked={sw} onChange={setSw} />',
      '<Switch defaultChecked />',
    ].join('\n'),
  },
  {
    name: '文字与图标',
    desc: 'checkedChildren / unCheckedChildren 轨道内内容',
    node: <TextDemo />,
    code: [
      'import { Switch, Icon } from "react-native-flux-desktop";',
      '',
      '// checkedChildren / unCheckedChildren 放轨道内',
      '<Switch defaultChecked checkedChildren="开" unCheckedChildren="关" />',
      '<Switch',
      '  defaultChecked',
      '  checkedChildren={<Icon name="check" size={12} color="#fff" />}',
      '  unCheckedChildren={<Icon name="close" size={12} color="#999" />}',
      '/>',
    ].join('\n'),
  },
  {
    name: '尺寸',
    desc: 'size = default / small',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
        <Switch defaultChecked />
        <Switch defaultChecked size="small" />
        <Switch defaultChecked size="small" checkedChildren="开" unCheckedChildren="关" />
      </View>
    ),
    code: [
      'import { Switch } from "react-native-flux-desktop";',
      '',
      '// size = default / small',
      '<Switch defaultChecked />',
      '<Switch defaultChecked size="small" />',
    ].join('\n'),
  },
  {
    name: '加载态',
    desc: 'loading 手柄内旋转指示器且不可交互',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
        <LoadingDemo />
        <Switch loading defaultChecked={false} />
      </View>
    ),
    code: [
      'import { Switch } from "react-native-flux-desktop";',
      '',
      '// loading 时手柄内旋转且禁交互；可点击后异步落定',
      'const [on, setOn] = React.useState(false);',
      'const [ld, setLd] = React.useState(false);',
      'const change = (v) => {',
      '  setLd(true);',
      '  setTimeout(() => { setLd(false); setOn(v); }, 1200);',
      '};',
      '<Switch checked={on} loading={ld} onChange={change} />',
    ].join('\n'),
  },
  {
    name: '禁用',
    desc: 'disabled 灰显不可点',
    node: (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
        <Switch checked disabled />
        <Switch checked={false} disabled />
      </View>
    ),
    code: [
      'import { Switch } from "react-native-flux-desktop";',
      '',
      '// disabled 灰显不可点',
      '<Switch checked disabled />',
      '<Switch checked={false} disabled />',
    ].join('\n'),
  },
];

/** 点击后进入 1.2s 加载再落定 */
function LoadingDemo(): React.ReactElement {
  const [on, setOn] = React.useState(false);
  const [ld, setLd] = React.useState(false);
  const change = (v: boolean): void => {
    setLd(true);
    setTimeout(() => {
      setLd(false);
      setOn(v);
    }, 1200);
  };
  return <Switch checked={on} loading={ld} onChange={change} />;
}

const API: ApiRow[] = [
  { name: 'checked / defaultChecked', desc: '受控 / 非受控开关', type: 'boolean', default: 'false' },
  { name: 'size', desc: '尺寸', type: "'default' | 'small'", default: "'default'" },
  { name: 'loading', desc: '加载态（手柄内指示器，禁交互）', type: 'boolean', default: 'false' },
  { name: 'checkedChildren', desc: '开启时轨道内容', type: 'ReactNode', default: '–' },
  { name: 'unCheckedChildren', desc: '关闭时轨道内容', type: 'ReactNode', default: '–' },
  { name: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
  { name: 'onChange', desc: '切换回调', type: '(checked) => void', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'minLineWidth', desc: '轨道最小宽', default: 'handle*2 + margin*2' },
  { name: 'handleSize', desc: '手柄直径', default: 'token' },
  { name: 'colorPrimary', desc: '开启轨道色', default: '主色' },
];

export function SwitchDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
